import type { Category, Item, Level, QuantityType } from "@prisma/client";
import {
  daysUntilExpiration,
  getExpirationStatus,
  isExpiringSoon,
} from "@/lib/expiration";

export { daysUntilExpiration, isExpiringSoon } from "@/lib/expiration";

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
    const status = getExpirationStatus(item.expirationDate);
    if (status === "none" || status === "ok") return null;
    const days = daysUntilExpiration(item.expirationDate);
    if (status === "expired") {
      return `${item.name} is expired`;
    }
    return `${item.name} expires in ${days} day${days === 1 ? "" : "s"}`;
  }
  return null;
}

export function getItemAlertPriority(item: ItemLike): number {
  if (item.expirationDate) {
    const status = getExpirationStatus(item.expirationDate);
    if (status === "expired") return 0;
    if (status === "urgent") return 1;
    if (status === "soon") return 2;
  }
  if (isItemLow(item)) return 3;
  return 4;
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
