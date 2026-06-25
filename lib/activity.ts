import type { ActivityAction, ActivityLog, Item, Level } from "@prisma/client";
import { getExpirationStatus } from "@/lib/expiration";
import { prisma } from "@/lib/prisma";
import type { AuthSession } from "@/lib/session";

export type SerializedActivityLog = {
  id: string;
  action: ActivityAction;
  itemId: string | null;
  itemName: string;
  userEmail: string;
  userName: string;
  detail: string | null;
  createdAt: string;
};

const LEVEL_LABELS: Record<Level, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  FULL: "Full",
};

export function serializeActivityLog(log: ActivityLog): SerializedActivityLog {
  return {
    id: log.id,
    action: log.action,
    itemId: log.itemId,
    itemName: log.itemName,
    userEmail: log.userEmail,
    userName: log.userName,
    detail: log.detail,
    createdAt: log.createdAt.toISOString(),
  };
}

export function getUserInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]![0]!.toUpperCase();
  return `${parts[0]![0]}${parts[1]![0]}`.toUpperCase();
}

export function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (
    date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate()
  ) {
    return "yesterday";
  }

  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatActivityMessage(log: SerializedActivityLog): string {
  const { userName, action, itemName, detail } = log;

  switch (action) {
    case "CREATED":
      return `${userName} added ${itemName}`;
    case "DELETED":
      return `${userName} deleted ${itemName}`;
    case "UPDATED":
      if (detail?.startsWith("renamed to ")) {
        return `${userName} ${detail}`;
      }
      if (detail?.startsWith("set quantity to ")) {
        return `${userName} set ${itemName} quantity to ${detail.replace("set quantity to ", "")}`;
      }
      if (detail) {
        return `${userName} marked ${itemName} as ${detail.replace("marked as ", "")}`;
      }
      return `${userName} updated ${itemName}`;
  }
}

export function describeItemUpdate(before: Item, after: Item): string | null {
  if (before.level !== after.level && after.level != null) {
    return `marked as ${LEVEL_LABELS[after.level]}`;
  }

  const beforeExpired = before.expirationDate
    ? getExpirationStatus(before.expirationDate) === "expired"
    : false;
  const afterExpired = after.expirationDate
    ? getExpirationStatus(after.expirationDate) === "expired"
    : false;
  if (!beforeExpired && afterExpired) {
    return "marked as expired";
  }

  if (
    before.quantityType === "COUNT" &&
    after.quantityType === "COUNT" &&
    before.quantity !== after.quantity &&
    after.quantity != null
  ) {
    return `set quantity to ${after.quantity}`;
  }

  if (before.name !== after.name) {
    return `renamed to ${after.name}`;
  }

  return null;
}

export async function recordActivity(input: {
  action: ActivityAction;
  itemId: string | null;
  itemName: string;
  session: AuthSession;
  detail?: string | null;
}): Promise<void> {
  await prisma.activityLog.create({
    data: {
      action: input.action,
      itemId: input.itemId,
      itemName: input.itemName,
      userEmail: input.session.email,
      userName: input.session.name,
      detail: input.detail ?? null,
    },
  });
}
