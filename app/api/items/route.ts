import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { CATEGORY_ORDER, serializeItem } from "@/lib/items";
import { requireAuthSession } from "@/lib/session";
import type { Category, Level, QuantityType } from "@prisma/client";

type CreateItemBody = {
  name: string;
  category: Category;
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
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  const sorted = [...items].sort((a, b) => {
    const catDiff =
      CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category);
    if (catDiff !== 0) return catDiff;
    return a.name.localeCompare(b.name);
  });

  return Response.json(sorted.map(serializeItem));
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

  const item = await prisma.item.create({
    data: {
      name: body.name.trim(),
      category: body.category,
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
  });

  return Response.json(serializeItem(item), { status: 201 });
}
