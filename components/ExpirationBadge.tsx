import {
  daysUntilExpiration,
  getExpirationLabel,
  getExpirationStatus,
} from "@/lib/expiration";

type ExpirationBadgeProps = {
  expirationDate: string | Date;
};

export function ExpirationBadge({ expirationDate }: ExpirationBadgeProps) {
  const status = getExpirationStatus(expirationDate);
  if (status === "none" || status === "ok") {
    return null;
  }

  const days = daysUntilExpiration(expirationDate);
  const label = getExpirationLabel(status, days);
  if (!label) {
    return null;
  }

  const isRed = status === "expired" || status === "urgent";

  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
        isRed ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"
      }`}
    >
      {label}
    </span>
  );
}
