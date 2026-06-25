import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  categoryInclude,
  isValidColorClass,
  serializeCategory,
} from "@/lib/categories";
import { requireAuthSession } from "@/lib/session";

export async function GET() {
  const session = await requireAuthSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const categories = await prisma.itemCategory.findMany({
    include: categoryInclude,
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  return Response.json(categories.map(serializeCategory));
}

type CreateCategoryBody = {
  name?: string;
  colorClass?: string;
};

export async function POST(request: NextRequest) {
  const session = await requireAuthSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as CreateCategoryBody;
  const name = body.name?.trim();

  if (!name) {
    return Response.json({ error: "Name is required" }, { status: 400 });
  }

  if (!body.colorClass || !isValidColorClass(body.colorClass)) {
    return Response.json({ error: "Invalid color" }, { status: 400 });
  }

  const existing = await prisma.itemCategory.findFirst({
    where: { name: { equals: name, mode: "insensitive" } },
  });

  if (existing) {
    return Response.json(
      { error: "A category with this name already exists" },
      { status: 409 }
    );
  }

  const maxSort = await prisma.itemCategory.aggregate({
    _max: { sortOrder: true },
  });

  const category = await prisma.itemCategory.create({
    data: {
      name,
      colorClass: body.colorClass,
      sortOrder: (maxSort._max.sortOrder ?? -1) + 1,
    },
    include: categoryInclude,
  });

  return Response.json(serializeCategory(category), { status: 201 });
}
