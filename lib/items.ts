import type { Item, ItemCategory, Level, QuantityType } from "@prisma/client";
import {
  daysUntilExpiration,
  getExpirationStatus,
  isExpiringSoon,
} from "@/lib/expiration";

export { daysUntilExpiration, isExpiringSoon } from "@/lib/expiration";

export type SerializedItemCategory = {
  id: string;
  name: string;
  colorClass: string;
  sortOrder: number;
};

export type ItemWithCategory = Item & {
  category: ItemCategory | null;
};

export type SerializedItem = Omit<
  Item,
  "expirationDate" | "createdAt" | "updatedAt"
> & {
  expirationDate: string | null;
  createdAt: string;
  updatedAt: string;
  category: SerializedItemCategory | null;
};

export const itemCategoryInclude = {
  category: true,
} as const;

export function serializeItem(item: ItemWithCategory): SerializedItem {
  const { category, ...rest } = item;
  return {
    ...rest,
    expirationDate: item.expirationDate?.toISOString() ?? null,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
    category: category
      ? {
          id: category.id,
          name: category.name,
          colorClass: category.colorClass,
          sortOrder: category.sortOrder,
        }
      : null,
  };
}

export function sortItemsByCategory<T extends SerializedItem>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const catDiff =
      (a.category?.sortOrder ?? 9999) - (b.category?.sortOrder ?? 9999);
    if (catDiff !== 0) return catDiff;
    return a.name.localeCompare(b.name);
  });
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
  categoryId: string | null;
  quantityType: QuantityType;
  quantity: number | null;
  level: Level | null;
  lowThreshold: number | null;
  expirationDate: string | null;
  notes: string | null;
};
