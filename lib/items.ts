import type { Category, Item, Level, QuantityType } from "@prisma/client";

export const CATEGORY_LABELS: Record<Category, string> = {
  MEDS: "Meds",
  FOOD: "Food",
  GEAR: "Gear",
  CLOTHING: "Clothing",
  TOILETRIES: "Toiletries",
  OTHER: "Other",
};

export const CATEGORY_COLORS: Record<Category, string> = {
  MEDS: "bg-red-100 text-red-800",
  FOOD: "bg-orange-100 text-orange-800",
  GEAR: "bg-blue-100 text-blue-800",
  CLOTHING: "bg-purple-100 text-purple-800",
  TOILETRIES: "bg-teal-100 text-teal-800",
  OTHER: "bg-gray-100 text-gray-800",
};

export const CATEGORY_ORDER: Category[] = [
  "MEDS",
  "FOOD",
  "GEAR",
  "CLOTHING",
  "TOILETRIES",
  "OTHER",
];

export type SerializedItem = Omit<Item, "expirationDate" | "createdAt" | "updatedAt"> & {
  expirationDate: string | null;
  createdAt: string;
  updatedAt: string;
};

export function serializeItem(item: Item): SerializedItem {
  return {
    ...item,
    expirationDate: item.expirationDate?.toISOString() ?? null,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}

export function daysUntilExpiration(date: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exp = new Date(date);
  exp.setHours(0, 0, 0, 0);
  return Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function isExpiringSoon(date: Date): boolean {
  return daysUntilExpiration(date) <= 90;
}

type ItemLike = Pick<
  Item,
  "name" | "quantityType" | "quantity" | "level" | "lowThreshold"
> & {
  expirationDate: Date | string | null;
};

export function isItemLow(item: ItemLike): boolean {
  if (item.quantityType === "LEVEL") {
    return item.level === "LOW";
  }
  if (item.quantityType === "COUNT" && item.quantity != null && item.lowThreshold != null) {
    return item.quantity <= item.lowThreshold;
  }
  return false;
}

export function getItemAlertMessage(item: ItemLike): string | null {
  if (isItemLow(item)) {
    return `${item.name} is low`;
  }
  if (item.expirationDate) {
    const exp =
      typeof item.expirationDate === "string"
        ? new Date(item.expirationDate)
        : item.expirationDate;
    if (!isExpiringSoon(exp)) return null;
    const days = daysUntilExpiration(exp);
    if (days < 0) {
      return `${item.name} is expired`;
    }
    return `${item.name} expires in ${days} day${days === 1 ? "" : "s"}`;
  }
  return null;
}

export type ItemFormData = {
  name: string;
  category: Category;
  quantityType: QuantityType;
  quantity: number | null;
  level: Level | null;
  lowThreshold: number | null;
  expirationDate: string | null;
  notes: string | null;
};
