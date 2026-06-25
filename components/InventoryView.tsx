"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { getCategoryTextClass, type SerializedCategory } from "@/lib/categories";
import type { SerializedItem } from "@/lib/items";
import { getItemAlertPriority } from "@/lib/items";
import { ItemCard } from "@/components/ItemCard";

type FilterTab = "ALL" | string;

type InventoryViewProps = {
  items: SerializedItem[];
  categories: SerializedCategory[];
};

export function InventoryView({ items, categories }: InventoryViewProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>("ALL");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const tabs = useMemo(
    () => [
      { id: "ALL" as const, label: "All Items" },
      ...categories.map((cat) => ({ id: cat.id, label: cat.name })),
    ],
    [categories]
  );

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    let filtered =
      activeTab === "ALL"
        ? items
        : items.filter((item) => item.categoryId === activeTab);

    if (query) {
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          (item.notes?.toLowerCase().includes(query) ?? false)
      );
    }

    return [...filtered].sort((a, b) => {
      const priorityDiff = getItemAlertPriority(a) - getItemAlertPriority(b);
      if (priorityDiff !== 0) return priorityDiff;
      return a.name.localeCompare(b.name);
    });
  }, [items, activeTab, searchQuery]);

  const activeCategory = categories.find((cat) => cat.id === activeTab);

  return (
    <div className="flex flex-col">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white px-4 pb-4 pt-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Inventory
          </h1>
          <button
            type="button"
            onClick={() => {
              setSearchOpen((open) => {
                if (open) setSearchQuery("");
                return !open;
              });
            }}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors active:bg-slate-200"
            aria-label={searchOpen ? "Close search" : "Search items"}
          >
            {searchOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Search className="h-5 w-5" />
            )}
          </button>
        </div>

        {searchOpen && (
          <div className="mt-3">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or notes…"
              autoFocus
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
            />
          </div>
        )}

        <div className="-mx-1 mt-4 overflow-x-auto">
          <div className="flex gap-2 px-1">
            {tabs.map((tab) => {
              const category =
                tab.id === "ALL"
                  ? null
                  : categories.find((cat) => cat.id === tab.id);
              const isActive = activeTab === tab.id;

              const tabClassName = category
                ? isActive
                  ? `${category.colorClass} font-semibold`
                  : `border border-slate-200 bg-white ${getCategoryTextClass(category.colorClass)} hover:bg-slate-50`
                : isActive
                  ? "bg-slate-900 font-semibold text-white"
                  : "border border-slate-200 bg-white text-slate-500 hover:bg-slate-50";

              return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-colors ${tabClassName}`}
              >
                {tab.label}
              </button>
              );
            })}
          </div>
        </div>
      </header>

      <div className="px-4 py-6">
        {filteredItems.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
            <p className="text-slate-500">
              {searchQuery.trim()
                ? "No items match your search."
                : activeTab === "ALL"
                  ? "No items yet. Tap + to add your first item."
                  : `No ${activeCategory?.name.toLowerCase() ?? "category"} items.`}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
