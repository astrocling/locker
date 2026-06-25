"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import type { Category } from "@prisma/client";
import type { SerializedItem } from "@/lib/items";
import { CATEGORY_LABELS, CATEGORY_ORDER, getItemAlertMessage } from "@/lib/items";
import { AlertBanner } from "@/components/AlertBanner";
import { ItemCard } from "@/components/ItemCard";
import { ItemSheet } from "@/components/ItemSheet";

type FilterTab = "ALL" | Category;

const TABS: { id: FilterTab; label: string }[] = [
  { id: "ALL", label: "All" },
  ...CATEGORY_ORDER.map((cat) => ({
    id: cat as FilterTab,
    label: CATEGORY_LABELS[cat],
  })),
];

type InventoryViewProps = {
  items: SerializedItem[];
};

export function InventoryView({ items }: InventoryViewProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>("ALL");
  const [addSheetOpen, setAddSheetOpen] = useState(false);

  const filteredItems = useMemo(() => {
    if (activeTab === "ALL") return items;
    return items.filter((item) => item.category === activeTab);
  }, [items, activeTab]);

  const alertMessages = useMemo(() => {
    return items
      .map((item) => getItemAlertMessage(item))
      .filter((msg): msg is string => msg !== null);
  }, [items]);

  return (
    <div className="pb-24">
      <AlertBanner messages={alertMessages} />

      <div className="mb-4 -mx-1 overflow-x-auto">
        <div className="flex gap-1 px-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
          <p className="text-gray-500">
            {activeTab === "ALL"
              ? "No items yet. Tap + to add your first item."
              : `No ${CATEGORY_LABELS[activeTab as Category].toLowerCase()} items.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => setAddSheetOpen(true)}
        className="fixed bottom-20 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 active:scale-95"
        aria-label="Add item"
      >
        <Plus className="h-6 w-6" />
      </button>

      {addSheetOpen && (
        <ItemSheet mode="add" onClose={() => setAddSheetOpen(false)} />
      )}
    </div>
  );
}
