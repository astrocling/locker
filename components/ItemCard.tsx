"use client";

import { useState } from "react";
import type { SerializedItem } from "@/lib/items";
import { CATEGORY_COLORS, CATEGORY_LABELS } from "@/lib/items";
import { CountStepper } from "@/components/CountStepper";
import { ExpirationBadge } from "@/components/ExpirationBadge";
import { ItemSheet } from "@/components/ItemSheet";
import { LevelGauge } from "@/components/LevelGauge";

type ItemCardProps = {
  item: SerializedItem;
};

export function ItemCard({ item }: ItemCardProps) {
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setSheetOpen(true)}
        className="w-full rounded-xl border border-gray-200 bg-white p-4 text-left shadow-sm transition-shadow hover:shadow-md"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-gray-900">{item.name}</p>
            <span
              className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${CATEGORY_COLORS[item.category]}`}
            >
              {CATEGORY_LABELS[item.category]}
            </span>
          </div>
          {item.expirationDate && (
            <ExpirationBadge expirationDate={item.expirationDate} />
          )}
        </div>
        <div className="mt-3">
          {item.quantityType === "LEVEL" && item.level ? (
            <LevelGauge level={item.level} />
          ) : (
            <CountStepper
              itemId={item.id}
              quantity={item.quantity ?? 0}
              lowThreshold={item.lowThreshold}
            />
          )}
        </div>
      </button>
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
