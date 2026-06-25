"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import type { Category, Level, QuantityType } from "@prisma/client";
import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  type ItemFormData,
  type SerializedItem,
} from "@/lib/items";
import { getExpirationStatus } from "@/lib/expiration";

type ItemSheetProps =
  | { mode: "add"; item?: undefined; onClose: () => void }
  | { mode: "edit"; item: SerializedItem; onClose: () => void };

const defaultForm: ItemFormData = {
  name: "",
  category: "OTHER",
  quantityType: "COUNT",
  quantity: 0,
  level: "FULL",
  lowThreshold: 0,
  expirationDate: null,
  notes: null,
};

function toFormData(item: SerializedItem): ItemFormData {
  return {
    name: item.name,
    category: item.category,
    quantityType: item.quantityType,
    quantity: item.quantity,
    level: item.level,
    lowThreshold: item.lowThreshold,
    expirationDate: item.expirationDate
      ? item.expirationDate.slice(0, 10)
      : null,
    notes: item.notes,
  };
}

function getYesterdayISO(): string {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date.toISOString().slice(0, 10);
}

export function ItemSheet({ mode, item, onClose }: ItemSheetProps) {
  const router = useRouter();
  const [form, setForm] = useState<ItemFormData>(
    item ? toFormData(item) : defaultForm
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    if (!form.name.trim()) {
      setError("Name is required");
      return;
    }

    setSaving(true);
    setError(null);

    const payload = {
      name: form.name.trim(),
      category: form.category,
      quantityType: form.quantityType,
      quantity: form.quantityType === "COUNT" ? form.quantity : null,
      level: form.quantityType === "LEVEL" ? form.level : null,
      lowThreshold: form.quantityType === "COUNT" ? form.lowThreshold : null,
      expirationDate: form.expirationDate || null,
      notes: form.notes?.trim() || null,
    };

    try {
      const url =
        mode === "add" ? "/api/items" : `/api/items/${item!.id}`;
      const method = mode === "add" ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Failed to save item");
      }

      router.refresh();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save item");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (mode !== "edit" || !item) return;
    if (!window.confirm(`Delete "${item.name}"? This cannot be undone.`)) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/items/${item.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Failed to delete item");
      }
      router.refresh();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete item");
    } finally {
      setSaving(false);
    }
  }

  async function handleMarkExpired() {
    if (mode !== "edit" || !item) return;

    setSaving(true);
    setError(null);

    const expirationDate = getYesterdayISO();

    try {
      const res = await fetch(`/api/items/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expirationDate }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Failed to mark item as expired");
      }

      router.refresh();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to mark item as expired"
      );
    } finally {
      setSaving(false);
    }
  }

  const showMarkExpired =
    mode === "edit" &&
    form.expirationDate &&
    getExpirationStatus(form.expirationDate) !== "expired";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {mode === "add" ? "Add item" : "Edit item"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Item name"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              value={form.category}
              onChange={(e) =>
                setForm({ ...form, category: e.target.value as Category })
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {CATEGORY_ORDER.map((cat) => (
                <option key={cat} value={cat}>
                  {CATEGORY_LABELS[cat]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Quantity type
            </label>
            <div className="flex rounded-lg border border-gray-300 p-1">
              {(["COUNT", "LEVEL"] as QuantityType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setForm({ ...form, quantityType: type })}
                  className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    form.quantityType === type
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {type === "COUNT" ? "Count" : "Level"}
                </button>
              ))}
            </div>
          </div>

          {form.quantityType === "COUNT" ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Quantity
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.quantity ?? 0}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      quantity: parseInt(e.target.value, 10) || 0,
                    })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Low threshold
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.lowThreshold ?? 0}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      lowThreshold: parseInt(e.target.value, 10) || 0,
                    })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Level
              </label>
              <div className="flex rounded-lg border border-gray-300 p-1">
                {(["FULL", "MEDIUM", "LOW"] as Level[]).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setForm({ ...form, level })}
                    className={`flex-1 rounded-md px-3 py-2 text-sm font-medium capitalize transition-colors ${
                      form.level === level
                        ? "bg-blue-600 text-white"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {level.toLowerCase()}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Expiration date{" "}
              <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <input
              type="date"
              value={form.expirationDate ?? ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  expirationDate: e.target.value || null,
                })
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {showMarkExpired && (
              <button
                type="button"
                onClick={handleMarkExpired}
                disabled={saving}
                className="mt-2 text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
              >
                Mark as expired
              </button>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Notes{" "}
              <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <textarea
              value={form.notes ?? ""}
              onChange={(e) =>
                setForm({ ...form, notes: e.target.value || null })
              }
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Any extra details..."
            />
          </div>

          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save"}
            </button>
            {mode === "edit" && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={saving}
                className="rounded-lg border border-red-300 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
