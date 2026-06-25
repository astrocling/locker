export const EXPIRING_SOON_DAYS = 90;
export const EXPIRING_URGENT_DAYS = 14;

export type ExpirationStatus = "none" | "ok" | "soon" | "urgent" | "expired";

function parseDate(date: Date | string): Date | null {
  const parsed = typeof date === "string" ? new Date(date) : date;
  if (!parsed || Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed;
}

export function daysUntilExpiration(date: Date | string): number {
  const exp = parseDate(date);
  if (!exp) return Infinity;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  exp.setHours(0, 0, 0, 0);
  return Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function isExpired(date: Date | string | null): boolean {
  if (!date) return false;
  const parsed = parseDate(date);
  if (!parsed) return false;
  return daysUntilExpiration(parsed) < 0;
}

export function isExpiringSoon(date: Date | string | null): boolean {
  if (!date) return false;
  const parsed = parseDate(date);
  if (!parsed) return false;
  return daysUntilExpiration(parsed) <= EXPIRING_SOON_DAYS;
}

export function getExpirationStatus(
  date: Date | string | null
): ExpirationStatus {
  if (!date) return "none";

  const parsed = parseDate(date);
  if (!parsed) return "none";

  const days = daysUntilExpiration(parsed);

  if (days < 0) return "expired";
  if (days <= EXPIRING_URGENT_DAYS) return "urgent";
  if (days <= EXPIRING_SOON_DAYS) return "soon";
  return "ok";
}

export function getExpirationLabel(
  status: ExpirationStatus,
  days: number
): string | null {
  switch (status) {
    case "none":
    case "ok":
      return null;
    case "expired":
      return "Expired";
    case "urgent":
      return days === 0 ? "Expires today" : `${days}d left`;
    case "soon":
      return `${days}d left`;
  }
}
