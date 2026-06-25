import type { ItemCategory, Prisma } from "@prisma/client";

export const CATEGORY_COLOR_OPTIONS = [
  { label: "Red", value: "bg-red-100 text-red-800" },
  { label: "Orange", value: "bg-orange-100 text-orange-800" },
  { label: "Blue", value: "bg-blue-100 text-blue-800" },
  { label: "Purple", value: "bg-purple-100 text-purple-800" },
  { label: "Teal", value: "bg-teal-100 text-teal-800" },
  { label: "Gray", value: "bg-gray-100 text-gray-800" },
  { label: "Green", value: "bg-green-100 text-green-800" },
  { label: "Yellow", value: "bg-yellow-100 text-yellow-800" },
  { label: "Pink", value: "bg-pink-100 text-pink-800" },
  { label: "Indigo", value: "bg-indigo-100 text-indigo-800" },
] as const;

export type CategoryColorClass = (typeof CATEGORY_COLOR_OPTIONS)[number]["value"];

export const DEFAULT_CATEGORY_COLOR: CategoryColorClass =
  "bg-gray-100 text-gray-800";

export type CategoryWithCount = ItemCategory & {
  _count: { items: number };
};

export type SerializedCategory = {
  id: string;
  name: string;
  colorClass: string;
  sortOrder: number;
  itemCount: number;
  createdAt: string;
};

export function serializeCategory(category: CategoryWithCount): SerializedCategory {
  return {
    id: category.id,
    name: category.name,
    colorClass: category.colorClass,
    sortOrder: category.sortOrder,
    itemCount: category._count.items,
    createdAt: category.createdAt.toISOString(),
  };
}

export function isValidColorClass(value: string): value is CategoryColorClass {
  return CATEGORY_COLOR_OPTIONS.some((option) => option.value === value);
}

export function getCategoryTextClass(colorClass: string): string {
  const textClass = colorClass.split(" ").find((part) => part.startsWith("text-"));
  return textClass ?? "text-gray-800";
}

export const categoryInclude = {
  _count: { select: { items: true } },
} satisfies Prisma.ItemCategoryInclude;

export async function getDefaultCategoryId(
  prisma: { itemCategory: { findFirst: (args: { where: { name: string } }) => Promise<{ id: string } | null> } }
): Promise<string | null> {
  const other = await prisma.itemCategory.findFirst({ where: { name: "Other" } });
  return other?.id ?? null;
}
