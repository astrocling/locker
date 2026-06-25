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

export function toMonthYearValue(date: Date | string | null): string {
  if (!date) return "";
  const parsed = parseDate(date);
  if (!parsed) return "";
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  return `${parsed.getFullYear()}-${month}`;
}

export function fromMonthYearValue(value: string): string | null {
  if (!value || !/^\d{4}-\d{2}$/.test(value)) return null;
  const [yearStr, monthStr] = value.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);
  if (month < 1 || month > 12) return null;

  const lastDay = new Date(year, month, 0);
  const y = lastDay.getFullYear();
  const m = String(lastDay.getMonth() + 1).padStart(2, "0");
  const d = String(lastDay.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formatExpirationShort(date: Date | string): string {
  const parsed = parseDate(date);
  if (!parsed) return "";
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const year = String(parsed.getFullYear()).slice(-2);
  return `${month}/${year}`;
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
      return days === 0 ? "Expires today" : `Expires in ${days}d`;
    case "soon":
      return `Expires in ${days}d`;
  }
}
