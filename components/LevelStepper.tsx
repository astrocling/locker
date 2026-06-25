"use client";

import { useTransition } from "react";
import { Minus, Plus } from "lucide-react";
import type { Level } from "@prisma/client";
import { updateItemLevel } from "@/app/actions/items";

const LEVELS: Level[] = ["LOW", "MEDIUM", "FULL"];

type LevelStepperProps = {
  itemId: string;
  level: Level;
  layout?: "horizontal" | "vertical";
};

export function LevelStepper({
  itemId,
  level,
  layout = "vertical",
}: LevelStepperProps) {
  const [isPending, startTransition] = useTransition();
  const levelIndex = LEVELS.indexOf(level);

  function change(delta: number) {
    const next = LEVELS[levelIndex + delta];
    if (!next) return;

    startTransition(async () => {
      await updateItemLevel(itemId, next);
    });
  }

  const buttonClass =
    "flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 transition-transform active:scale-95 disabled:opacity-40";

  if (layout === "vertical") {
    return (
      <div
        className="flex shrink-0 flex-col items-center gap-1"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          disabled={isPending || levelIndex >= LEVELS.length - 1}
          onClick={() => change(1)}
          className={buttonClass}
          aria-label="Increase level"
        >
          <Plus className="h-4 w-4" />
        </button>
        <button
          type="button"
          disabled={isPending || levelIndex <= 0}
          onClick={() => change(-1)}
          className={buttonClass}
          aria-label="Decrease level"
        >
          <Minus className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-2"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        disabled={isPending || levelIndex <= 0}
        onClick={() => change(-1)}
        className={buttonClass}
        aria-label="Decrease level"
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className="min-w-[4ch] text-center text-sm font-medium capitalize text-slate-900">
        {level.toLowerCase()}
      </span>
      <button
        type="button"
        disabled={isPending || levelIndex >= LEVELS.length - 1}
        onClick={() => change(1)}
        className={buttonClass}
        aria-label="Increase level"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
