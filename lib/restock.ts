import {
  daysUntilExpiration,
  getExpirationStatus,
  isExpiringSoon,
} from "@/lib/expiration";
import {
  getItemAlertPriority,
  isItemLow,
  type SerializedItem,
} from "@/lib/items";

export type RestockEntry = {
  item: SerializedItem;
  reason: string;
};

export type RestockSections = {
  lowOrEmpty: RestockEntry[];
  expiringSoon: RestockEntry[];
};

export function isLowRestockItem(item: SerializedItem): boolean {
  return isItemLow(item);
}

export function isExpiringRestockItem(item: SerializedItem): boolean {
  return isExpiringSoon(item.expirationDate);
}

export function getLowRestockReason(item: SerializedItem): string | null {
  if (!isLowRestockItem(item)) return null;

  if (item.quantityType === "LEVEL") {
    return "Low";
  }

  if (item.quantity != null) {
    return `${item.quantity} left`;
  }

  return "Low";
}

export function getExpiringRestockReason(item: SerializedItem): string | null {
  if (!item.expirationDate || !isExpiringRestockItem(item)) return null;

  const status = getExpirationStatus(item.expirationDate);
  if (status === "expired") {
    return "Expired";
  }

  const days = daysUntilExpiration(item.expirationDate);
  if (days === 0) {
    return "Expires today";
  }

  return `Expires in ${days} day${days === 1 ? "" : "s"}`;
}

function sortRestockEntries(entries: RestockEntry[]): RestockEntry[] {
  return [...entries].sort((a, b) => {
    const priorityDiff =
      getItemAlertPriority(a.item) - getItemAlertPriority(b.item);
    if (priorityDiff !== 0) return priorityDiff;
    return a.item.name.localeCompare(b.item.name);
  });
}

export function partitionRestockItems(items: SerializedItem[]): RestockSections {
  const lowOrEmpty: RestockEntry[] = [];
  const expiringSoon: RestockEntry[] = [];

  for (const item of items) {
    const lowReason = getLowRestockReason(item);
    if (lowReason) {
      lowOrEmpty.push({ item, reason: lowReason });
    }

    const expReason = getExpiringRestockReason(item);
    if (expReason) {
      expiringSoon.push({ item, reason: expReason });
    }
  }

  return {
    lowOrEmpty: sortRestockEntries(lowOrEmpty),
    expiringSoon: sortRestockEntries(expiringSoon),
  };
}

export function getRestockEntryCount(sections: RestockSections): number {
  return sections.lowOrEmpty.length + sections.expiringSoon.length;
}

function formatChecklistSection(
  title: string,
  entries: RestockEntry[]
): string | null {
  if (entries.length === 0) return null;

  const lines = entries.map(
    (entry) => `[ ] ${entry.item.name} — ${entry.reason}`
  );
  return `${title}\n${lines.join("\n")}`;
}

export function formatRestockChecklist(sections: RestockSections): string {
  const generated = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const parts = [
    "Owner's Locker — Restock List",
    `Generated ${generated}`,
    "",
    formatChecklistSection("Low or empty", sections.lowOrEmpty),
    formatChecklistSection("Expiring soon", sections.expiringSoon),
  ].filter((part): part is string => part != null && part !== "");

  return parts.join("\n\n");
}
