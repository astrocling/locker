"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  CATEGORY_COLOR_OPTIONS,
  DEFAULT_CATEGORY_COLOR,
  type SerializedCategory,
} from "@/lib/categories";

type ManageViewProps = {
  categories: SerializedCategory[];
};

export function ManageView({ categories }: ManageViewProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [colorClass, setColorClass] = useState<string>(DEFAULT_CATEGORY_COLOR);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Category name is required");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed, colorClass }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Failed to add category");
      }

      setName("");
      setColorClass(DEFAULT_CATEGORY_COLOR);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add category");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(category: SerializedCategory) {
    const itemLabel =
      category.itemCount === 1 ? "1 item" : `${category.itemCount} items`;
    const message =
      category.itemCount > 0
        ? `Delete ${category.name}? ${itemLabel} will become uncategorized.`
        : `Delete ${category.name}?`;

    if (!window.confirm(message)) return;

    setDeletingId(category.id);
    setError(null);

    try {
      const res = await fetch(`/api/categories/${category.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Failed to delete category");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete category");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Categories
        </h2>

        <form
          onSubmit={handleAdd}
          className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Add category
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Category name"
            className="mb-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
          />

          <p className="mb-2 text-sm font-medium text-slate-700">Color</p>
          <div className="mb-4 flex flex-wrap gap-2">
            {CATEGORY_COLOR_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setColorClass(option.value)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${option.value} ${
                  colorClass === option.value
                    ? "ring-2 ring-slate-900 ring-offset-2"
                    : "opacity-80 hover:opacity-100"
                }`}
                aria-label={option.label}
                aria-pressed={colorClass === option.value}
              >
                {option.label}
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            {saving ? "Adding…" : "Add category"}
          </button>
        </form>

        {error && (
          <p className="mb-4 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        {categories.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
            <p className="text-slate-500">No categories yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="min-w-0">
                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${category.colorClass}`}
                  >
                    {category.name}
                  </span>
                  <p className="mt-1 text-sm text-slate-500">
                    {category.itemCount}{" "}
                    {category.itemCount === 1 ? "item" : "items"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(category)}
                  disabled={deletingId === category.id}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-red-600 hover:bg-red-50 disabled:opacity-50"
                  aria-label={`Delete ${category.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="opacity-50">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Add Locker
        </h2>
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-8 text-center">
          <p className="text-sm text-slate-500">Coming soon</p>
        </div>
      </section>
    </div>
  );
}
