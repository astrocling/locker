import type { Level } from "@prisma/client";

type LevelGaugeProps = {
  level: Level;
};

const LEVEL_SEGMENT_CONFIG: Record<
  Level,
  { filledCount: number; color: string }
> = {
  FULL: { filledCount: 3, color: "bg-green-500" },
  MEDIUM: { filledCount: 2, color: "bg-yellow-400" },
  LOW: { filledCount: 1, color: "bg-red-500" },
};

export function LevelGauge({ level }: LevelGaugeProps) {
  const { filledCount, color } = LEVEL_SEGMENT_CONFIG[level];

  return (
    <div className="flex gap-1" aria-label={`Level: ${level.toLowerCase()}`}>
      {Array.from({ length: 3 }, (_, index) => (
        <div
          key={index}
          className={`h-2 w-8 rounded-full ${
            index < filledCount ? color : "bg-slate-200"
          }`}
        />
      ))}
    </div>
  );
}
