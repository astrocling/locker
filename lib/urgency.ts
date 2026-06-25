import type { Level } from "@prisma/client";
import { getExpirationStatus } from "@/lib/expiration";

type UrgencyItem = {
  quantityType: "COUNT" | "LEVEL";
  quantity: number | null;
  level: Level | null;
  lowThreshold: number | null;
  expirationDate: Date | string | null;
};

function isCountLow(item: UrgencyItem): boolean {
  return (
    item.quantityType === "COUNT" &&
    item.quantity != null &&
    item.lowThreshold != null &&
    item.quantity <= item.lowThreshold
  );
}

export function getItemUrgencyStripe(item: UrgencyItem): string {
  if (item.expirationDate) {
    const status = getExpirationStatus(item.expirationDate);
    if (status === "expired") return "bg-red-500";
    if (status === "urgent") return "bg-orange-400";
    if (status === "soon") return "bg-amber-400";
  }

  if (item.quantityType === "COUNT") {
    if (item.quantity === 0) return "bg-red-500";
    if (isCountLow(item)) return "bg-orange-400";
    return "bg-slate-300";
  }

  if (item.quantityType === "LEVEL") {
    if (item.level === "LOW") return "bg-orange-400";
    if (item.level === "FULL") return "bg-emerald-500";
    return "bg-slate-300";
  }

  return "bg-slate-300";
}

export function getItemStockLabel(item: UrgencyItem): string | null {
  if (item.quantityType === "COUNT") {
    if (item.quantity === 0) return "Refill Required";
    if (isCountLow(item)) return "Low";
    return "Good";
  }

  if (item.quantityType === "LEVEL" && item.level) {
    if (item.level === "FULL") return "Full Stock";
    if (item.level === "LOW") return "Low";
    return "Medium";
  }

  return null;
}
