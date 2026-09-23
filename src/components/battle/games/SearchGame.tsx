"use client";
import { useState } from "react";
import { GameDone } from "@/components/battle/games/TapGame";
import { cn } from "@/lib/utils";

const GRID_SIZE = 30;
const TARGET_COUNT = 5;
const ICONS = ["●", "▲", "■", "★", "◆"];

function buildGrid(): { icon: string; isTarget: boolean }[] {
  const targetIcon = ICONS[0];
  const arr: { icon: string; isTarget: boolean }[] = [];
  const targetIndices = new Set<number>();
  while (targetIndices.size < TARGET_COUNT) targetIndices.add(Math.floor(Math.random() * GRID_SIZE));
  for (let i = 0; i < GRID_SIZE; i++) {
    if (targetIndices.has(i)) arr.push({ icon: targetIcon, isTarget: true });
    else arr.push({ icon: ICONS[1 + Math.floor(Math.random() * (ICONS.length - 1))], isTarget: false });
  }
  return arr;
}

export function SearchGame({ onComplete }: { onComplete: () => void }) {
  const targetIcon = ICONS[0];
  const [cells] = useState(buildGrid);

  const [found, setFound] = useState<Set<number>>(new Set());

  const foundCount = found.size;
  const complete = foundCount >= TARGET_COUNT;

  if (complete) {
    return <GameDone label={`Found all ${TARGET_COUNT} targets.`} onComplete={onComplete} />;
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-sm text-[var(--fg-muted)]">
        Find all {TARGET_COUNT} &ldquo;{targetIcon}&rdquo; shapes &middot; {foundCount}/{TARGET_COUNT}
      </p>
      <div className="grid grid-cols-6 gap-2">
        {cells.map((cell, i) => (
          <button
            key={i}
            onClick={() => cell.isTarget && setFound((f) => new Set(f).add(i))}
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--bg-elevated)] text-lg transition-opacity",
              found.has(i) && "opacity-30"
            )}
            aria-label="grid cell"
          >
            {cell.icon}
          </button>
        ))}
      </div>
    </div>
  );
}
