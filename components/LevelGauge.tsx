import type { Level } from "@prisma/client";

type LevelGaugeProps = {
  level: Level;
};

export function LevelGauge({ level }: LevelGaugeProps) {
  const segments = [
    { active: true, color: "bg-red-500" },
    { active: level !== "LOW", color: "bg-amber-400" },
    { active: level === "FULL", color: "bg-green-500" },
  ];

  return (
    <div className="flex gap-1" aria-label={`Level: ${level.toLowerCase()}`}>
      {segments.map((segment, index) => (
        <div
          key={index}
          className={`h-2 w-8 rounded-full ${
            segment.active ? segment.color : "bg-gray-200"
          }`}
        />
      ))}
    </div>
  );
}
