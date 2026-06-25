import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  itemCategoryInclude,
  serializeItem,
  sortItemsByCategory,
} from "@/lib/items";
import { requireAuthSession } from "@/lib/session";
import type { Level, QuantityType } from "@prisma/client";

type CreateItemBody = {
  name: string;
  categoryId?: string | null;
  quantityType: QuantityType;
  quantity?: number | null;
  level?: Level | null;
  lowThreshold?: number | null;
  expirationDate?: string | null;
  notes?: string | null;
};

export async function GET() {
  const session = await requireAuthSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const items = await prisma.item.findMany({
    include: itemCategoryInclude,
  });

  return Response.json(sortItemsByCategory(items.map(serializeItem)));
}

export async function POST(request: NextRequest) {
  const session = await requireAuthSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as CreateItemBody;

  if (!body.name?.trim()) {
    return Response.json({ error: "Name is required" }, { status: 400 });
  }

  const item = await prisma.$transaction(async (tx) => {
    const created = await tx.item.create({
      data: {
        name: body.name.trim(),
        categoryId: body.categoryId ?? null,
        quantityType: body.quantityType,
        quantity: body.quantityType === "COUNT" ? (body.quantity ?? 0) : null,
        level: body.quantityType === "LEVEL" ? (body.level ?? "FULL") : null,
        lowThreshold:
          body.quantityType === "COUNT" ? (body.lowThreshold ?? 0) : null,
        expirationDate: body.expirationDate
          ? new Date(body.expirationDate)
          : null,
        notes: body.notes?.trim() || null,
        updatedBy: session.name,
        updatedByEmail: session.email,
      },
      include: itemCategoryInclude,
    });

    await tx.activityLog.create({
      data: {
        action: "CREATED",
        itemId: created.id,
        itemName: created.name,
        userEmail: session.email,
        userName: session.name,
      },
    });

    return created;
  });

  return Response.json(serializeItem(item), { status: 201 });
}
