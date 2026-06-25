import { Calendar } from "lucide-react";
import {
  daysUntilExpiration,
  formatExpirationShort,
  getExpirationLabel,
  getExpirationStatus,
} from "@/lib/expiration";

type ExpirationBadgeProps = {
  expirationDate: string | Date;
  variant?: "pill" | "inline";
  className?: string;
};

export function ExpirationBadge({
  expirationDate,
  variant = "inline",
  className = "",
}: ExpirationBadgeProps) {
  const status = getExpirationStatus(expirationDate);
  if (status === "none") {
    return null;
  }

  if (status === "ok") {
    const dateLabel = formatExpirationShort(expirationDate);
    if (!dateLabel) return null;

    return (
      <span
        className={`inline-flex items-center gap-1 text-xs text-slate-400 ${className}`}
      >
        <Calendar className="h-3 w-3" aria-hidden="true" />
        {dateLabel}
      </span>
    );
  }

  const days = daysUntilExpiration(expirationDate);
  const label = getExpirationLabel(status, days);
  if (!label) {
    return null;
  }

  const isRed = status === "expired" || status === "urgent";

  if (variant === "inline") {
    return (
      <span
        className={`text-xs font-bold ${
          isRed ? "text-red-600" : "text-orange-600"
        } ${status === "expired" ? "animate-pulse" : ""} ${className}`}
      >
        {label}
      </span>
    );
  }

  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
        isRed ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"
      } ${className}`}
    >
      {label}
    </span>
  );
}
