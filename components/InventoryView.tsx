"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, ArrowDownAZ, Filter, Layers, Search, X } from "lucide-react";
import { getCategoryTextClass, type SerializedCategory } from "@/lib/categories";
import { useCollapseOnScroll } from "@/hooks/useCollapseOnScroll";
import type { InventorySortMode, SerializedItem } from "@/lib/items";
import { itemNeedsAttention, sortInventoryItems } from "@/lib/items";
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
  const [sortMode, setSortMode] = useState<InventorySortMode>("alphabetical");
  const [prioritizeAlerts, setPrioritizeAlerts] = useState(true);
  const [needsAttentionOnly, setNeedsAttentionOnly] = useState(false);

  const collapsed = useCollapseOnScroll({ disabled: searchOpen });

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

    if (needsAttentionOnly) {
      filtered = filtered.filter(itemNeedsAttention);
    }

    return sortInventoryItems(filtered, { mode: sortMode, prioritizeAlerts });
  }, [
    items,
    activeTab,
    searchQuery,
    needsAttentionOnly,
    sortMode,
    prioritizeAlerts,
  ]);

  const activeCategory = categories.find((cat) => cat.id === activeTab);

  const emptyMessage = (() => {
    if (searchQuery.trim()) return "No items match your search.";
    if (needsAttentionOnly) return "No items need attention right now.";
    if (activeTab === "ALL") return "No items yet. Tap + to add your first item.";
    return `No ${activeCategory?.name.toLowerCase() ?? "category"} items.`;
  })();

  return (
    <div className="flex flex-col">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
        <div className="px-4 pb-3 pt-6">
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
        </div>

        {searchOpen && (
          <div className="border-b border-slate-200 px-4 pb-3">
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

        <div
          className={`overflow-hidden transition-[height] duration-200 ease-out motion-reduce:transition-none ${
            collapsed ? "h-0" : "h-24"
          }`}
        >
          <div
            aria-hidden={collapsed}
            className={`transition-opacity duration-200 ease-out motion-reduce:transition-none ${
              collapsed ? "pointer-events-none opacity-0" : "opacity-100"
            }`}
          >
            <div className="flex items-center justify-between gap-2 px-4 pb-3">
            <div
              className="flex rounded-full border border-slate-200 bg-slate-50 p-0.5"
              role="group"
              aria-label="Sort items"
            >
              <button
                type="button"
                onClick={() => setSortMode("alphabetical")}
                aria-pressed={sortMode === "alphabetical"}
                className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  sortMode === "alphabetical"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <ArrowDownAZ className="h-3.5 w-3.5" aria-hidden="true" />
                A–Z
              </button>
              <button
                type="button"
                onClick={() => setSortMode("category")}
                aria-pressed={sortMode === "category"}
                className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  sortMode === "category"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Layers className="h-3.5 w-3.5" aria-hidden="true" />
                Category
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPrioritizeAlerts((on) => !on)}
                aria-pressed={prioritizeAlerts}
                aria-label="Prioritize alerts"
                className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                  prioritizeAlerts
                    ? "bg-amber-100 text-amber-800"
                    : "border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                }`}
              >
                <AlertTriangle className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setNeedsAttentionOnly((on) => !on)}
                aria-pressed={needsAttentionOnly}
                aria-label="Show needs attention only"
                className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                  needsAttentionOnly
                    ? "bg-slate-900 text-white"
                    : "border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                }`}
              >
                <Filter className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="-mx-1 overflow-x-auto px-4 pb-4">
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
          </div>
        </div>
      </header>

      <div className="px-4 py-6">
        {filteredItems.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
            <p className="text-slate-500">{emptyMessage}</p>
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
