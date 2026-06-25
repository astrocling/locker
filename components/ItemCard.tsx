"use client";

import { useState, useTransition } from "react";
import { CircleOff } from "lucide-react";
import type { Level } from "@prisma/client";
import type { SerializedItem } from "@/lib/items";
import { updateItemLevel } from "@/app/actions/items";
import { DEFAULT_CATEGORY_COLOR, getCategoryTextClass } from "@/lib/categories";
import { getItemStockLabel, getItemUrgencyStripe } from "@/lib/urgency";
import { CountStepper } from "@/components/CountStepper";
import { ExpirationBadge } from "@/components/ExpirationBadge";
import { ItemSheet } from "@/components/ItemSheet";
import { LevelGauge } from "@/components/LevelGauge";
import { LevelStepper } from "@/components/LevelStepper";

type ItemCardProps = {
  item: SerializedItem;
};

const LEVELS: Level[] = ["LOW", "MEDIUM", "FULL"];

function getStockLabelClass(item: SerializedItem): string {
  const label = getItemStockLabel(item);
  if (label === "Refill Required") return "text-red-600";
  if (label === "Low") return "text-orange-600";
  if (label === "Full Stock") return "text-emerald-600";
  return "text-slate-400";
}

function getQuantityBadgeClass(item: SerializedItem): string {
  if (item.quantityType === "COUNT") {
    if (item.quantity === 0) return "bg-red-50 text-red-700";
    if (
      item.lowThreshold != null &&
      item.quantity != null &&
      item.quantity <= item.lowThreshold
    ) {
      return "bg-orange-50 text-orange-700";
    }
  }
  return "bg-slate-100 text-slate-700";
}

function getQuantityLabel(item: SerializedItem): string {
  return `${item.quantity ?? 0} Remain`;
}

function isCountEmpty(item: SerializedItem): boolean {
  return item.quantityType === "COUNT" && (item.quantity ?? 0) === 0;
}

export function ItemCard({ item }: ItemCardProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [isLevelPending, startLevelTransition] = useTransition();
  const stockLabel = getItemStockLabel(item);
  const stripeClass = getItemUrgencyStripe(item);
  const empty = isCountEmpty(item);
  const isLevelItem = item.quantityType === "LEVEL" && item.level != null;

  function cycleLevel() {
    if (!item.level) return;
    const index = LEVELS.indexOf(item.level);
    const next = LEVELS[(index - 1 + LEVELS.length) % LEVELS.length];
    startLevelTransition(async () => {
      await updateItemLevel(item.id, next);
    });
  }

  return (
    <>
      <div className="relative flex items-center gap-4 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div
          className={`absolute top-0 bottom-0 left-0 w-1.5 ${stripeClass}`}
          aria-hidden="true"
        />

        <div className="min-w-0 flex-1">
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className="w-full text-left"
          >
            <div className="mb-1 flex items-center justify-between gap-2">
              <h3 className="truncate font-semibold text-slate-900">{item.name}</h3>
              <span
                className={`shrink-0 text-[10px] font-bold tracking-wider uppercase ${getCategoryTextClass(
                  item.category?.colorClass ?? DEFAULT_CATEGORY_COLOR
                )}`}
              >
                {item.category?.name ?? "Uncategorized"}
              </span>
            </div>

            {item.notes && (
              <p className="line-clamp-2 text-xs text-slate-500">{item.notes}</p>
            )}
          </button>

          <div
            className={`flex flex-wrap items-center gap-x-3 gap-y-1 ${item.notes ? "mt-3" : "mt-3"}`}
          >
            {isLevelItem ? (
              <button
                type="button"
                disabled={isLevelPending}
                onClick={cycleLevel}
                className="flex items-center gap-2 rounded-lg transition-opacity active:opacity-70 disabled:opacity-40"
                aria-label={`Level: ${item.level!.toLowerCase()}. Tap to change.`}
              >
                <LevelGauge level={item.level!} />
                {stockLabel && (
                  <span
                    className={`text-[11px] font-medium ${getStockLabelClass(item)}`}
                  >
                    {stockLabel}
                  </span>
                )}
              </button>
            ) : (
              <>
                <span
                  className={`rounded px-2 py-0.5 font-mono text-xs font-semibold ${getQuantityBadgeClass(item)}`}
                >
                  {getQuantityLabel(item)}
                </span>
                {empty ? (
                  <span className="flex items-center gap-1 text-[11px] font-medium text-red-600">
                    <CircleOff className="h-3 w-3" aria-hidden="true" />
                    Empty
                  </span>
                ) : (
                  stockLabel && (
                    <span
                      className={`text-[11px] font-medium ${getStockLabelClass(item)}`}
                    >
                      {stockLabel}
                    </span>
                  )
                )}
              </>
            )}
            {item.expirationDate && (
              <span className="ml-auto">
                <ExpirationBadge expirationDate={item.expirationDate} />
              </span>
            )}
          </div>
        </div>

        {item.quantityType === "COUNT" ? (
          <CountStepper
            itemId={item.id}
            quantity={item.quantity ?? 0}
            lowThreshold={item.lowThreshold}
            layout="vertical"
          />
        ) : isLevelItem ? (
          <LevelStepper itemId={item.id} level={item.level!} layout="vertical" />
        ) : null}
      </div>

      {sheetOpen && (
        <ItemSheet
          mode="edit"
          item={item}
          onClose={() => setSheetOpen(false)}
        />
      )}
    </>
  );
}
