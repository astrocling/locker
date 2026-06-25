"use client";

import { useTransition } from "react";
import { Minus, Plus } from "lucide-react";
import { updateItemQuantity } from "@/app/actions/items";

type CountStepperProps = {
  itemId: string;
  quantity: number;
  lowThreshold: number | null;
};

export function CountStepper({
  itemId,
  quantity,
  lowThreshold,
}: CountStepperProps) {
  const [isPending, startTransition] = useTransition();
  const isLow = lowThreshold != null && quantity <= lowThreshold;

  function change(delta: number) {
    const next = Math.max(0, quantity + delta);
    startTransition(async () => {
      await updateItemQuantity(itemId, next);
    });
  }

  return (
    <div
      className="flex items-center gap-2"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        disabled={isPending || quantity <= 0}
        onClick={() => change(-1)}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 disabled:opacity-40"
        aria-label="Decrease quantity"
      >
        <Minus className="h-4 w-4" />
      </button>
      <span
        className={`min-w-[2ch] text-center text-lg font-semibold tabular-nums ${
          isLow ? "text-red-600" : "text-gray-900"
        }`}
      >
        {quantity}
      </span>
      <button
        type="button"
        disabled={isPending}
        onClick={() => change(1)}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 disabled:opacity-40"
        aria-label="Increase quantity"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
