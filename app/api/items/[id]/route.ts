import type { NextRequest } from "next/server";
import { describeItemUpdate } from "@/lib/activity";
import { prisma } from "@/lib/prisma";
import { serializeItem } from "@/lib/items";
import { requireAuthSession } from "@/lib/session";
import type { Category, Level, QuantityType } from "@prisma/client";

type UpdateItemBody = {
  name?: string;
  category?: Category;
  quantityType?: QuantityType;
  quantity?: number | null;
  level?: Level | null;
  lowThreshold?: number | null;
  expirationDate?: string | null;
  notes?: string | null;
};

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAuthSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = (await request.json()) as UpdateItemBody;

  const existing = await prisma.item.findUnique({ where: { id } });
  if (!existing) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const quantityType = body.quantityType ?? existing.quantityType;

  const item = await prisma.$transaction(async (tx) => {
    const updated = await tx.item.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name.trim() }),
        ...(body.category !== undefined && { category: body.category }),
        ...(body.quantityType !== undefined && {
          quantityType: body.quantityType,
        }),
        quantity:
          quantityType === "COUNT"
            ? (body.quantity ?? existing.quantity ?? 0)
            : null,
        level:
          quantityType === "LEVEL"
            ? (body.level ?? existing.level ?? "FULL")
            : null,
        lowThreshold:
          quantityType === "COUNT"
            ? (body.lowThreshold ?? existing.lowThreshold ?? 0)
            : null,
        ...(body.expirationDate !== undefined && {
          expirationDate: body.expirationDate
            ? new Date(body.expirationDate)
            : null,
        }),
        ...(body.notes !== undefined && {
          notes: body.notes?.trim() || null,
        }),
        updatedBy: session.name,
        updatedByEmail: session.email,
      },
    });

    await tx.activityLog.create({
      data: {
        action: "UPDATED",
        itemId: updated.id,
        itemName: updated.name,
        userEmail: session.email,
        userName: session.name,
        detail: describeItemUpdate(existing, updated),
      },
    });

    return updated;
  });

  return Response.json(serializeItem(item));
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAuthSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.item.findUnique({ where: { id } });
  if (!existing) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.activityLog.create({
      data: {
        action: "DELETED",
        itemId: existing.id,
        itemName: existing.name,
        userEmail: session.email,
        userName: session.name,
      },
    });

    await tx.item.delete({ where: { id } });
  });

  return Response.json({ success: true });
}
