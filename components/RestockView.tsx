"use client";

import { useMemo, useState } from "react";
import { Copy, Check } from "lucide-react";
import type { SerializedItem } from "@/lib/items";
import { CATEGORY_COLORS, CATEGORY_LABELS } from "@/lib/items";
import {
  formatRestockChecklist,
  getRestockEntryCount,
  partitionRestockItems,
  type RestockEntry,
} from "@/lib/restock";
import { ItemSheet } from "@/components/ItemSheet";

type RestockViewProps = {
  items: SerializedItem[];
};

function RestockItemRow({
  entry,
  onSelect,
}: {
  entry: RestockEntry;
  onSelect: (item: SerializedItem) => void;
}) {
  const { item, reason } = entry;

  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
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
        <span className="shrink-0 text-sm text-gray-500">{reason}</span>
      </div>
    </button>
  );
}

function RestockSection({
  title,
  entries,
  onSelectItem,
}: {
  title: string;
  entries: RestockEntry[];
  onSelectItem: (item: SerializedItem) => void;
}) {
  if (entries.length === 0) return null;

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
        {title}
      </h2>
      <div className="space-y-3">
        {entries.map((entry) => (
          <RestockItemRow
            key={`${title}-${entry.item.id}`}
            entry={entry}
            onSelect={onSelectItem}
          />
        ))}
      </div>
    </section>
  );
}

export function RestockView({ items }: RestockViewProps) {
  const [editingItem, setEditingItem] = useState<SerializedItem | null>(null);
  const [copied, setCopied] = useState(false);

  const sections = useMemo(() => partitionRestockItems(items), [items]);
  const entryCount = getRestockEntryCount(sections);
  const isEmpty = entryCount === 0;

  async function handleCopy() {
    const text = formatRestockChecklist(sections);
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="pb-24">
      {!isEmpty && (
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-sm text-gray-600">
            {entryCount} {entryCount === 1 ? "item needs" : "items need"}{" "}
            attention
          </p>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 active:scale-95"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy list
              </>
            )}
          </button>
        </div>
      )}

      {isEmpty ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
          <p className="text-gray-500">
            Nothing to restock — you&apos;re all set!
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          <RestockSection
            title="Low or empty"
            entries={sections.lowOrEmpty}
            onSelectItem={setEditingItem}
          />
          <RestockSection
            title="Expiring soon"
            entries={sections.expiringSoon}
            onSelectItem={setEditingItem}
          />
        </div>
      )}

      {editingItem && (
        <ItemSheet
          mode="edit"
          item={editingItem}
          onClose={() => setEditingItem(null)}
        />
      )}
    </div>
  );
}
