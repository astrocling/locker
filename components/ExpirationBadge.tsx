import { daysUntilExpiration, isExpiringSoon } from "@/lib/items";

type ExpirationBadgeProps = {
  expirationDate: string | Date;
};

export function ExpirationBadge({ expirationDate }: ExpirationBadgeProps) {
  const date =
    typeof expirationDate === "string"
      ? new Date(expirationDate)
      : expirationDate;

  if (!date || Number.isNaN(date.getTime())) {
    return null;
  }

  if (!isExpiringSoon(date)) {
    return null;
  }

  const days = daysUntilExpiration(date);

  if (days < 0) {
    return (
      <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
        Expired
      </span>
    );
  }

  if (days <= 14) {
    return (
      <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
        {days === 0 ? "Expires today" : `${days}d left`}
      </span>
    );
  }

  return (
    <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
      {days}d left
    </span>
  );
}
