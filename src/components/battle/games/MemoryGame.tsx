"use client";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { GameDone } from "@/components/battle/games/TapGame";

const TILE_COUNT = 6;
const TARGET_LEVEL = 5;

function randomTile(): number {
  return Math.floor(Math.random() * TILE_COUNT);
}

export function MemoryGame({ onComplete }: { onComplete: () => void }) {
  const [sequence, setSequence] = useState<number[]>(() => [randomTile()]);
  const [userInput, setUserInput] = useState<number[]>([]);
  const [showing, setShowing] = useState(true);
  const [activeTile, setActiveTile] = useState<number | null>(null);
  const [done, setDone] = useState(false);

  // Plays back the current sequence any time it grows. State resets for the
  // next round happen inside the timer callbacks below, not synchronously at
  // effect-start, so this only reacts to real async playback events.
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setActiveTile(sequence[i]);
      setTimeout(() => setActiveTile(null), 350);
      i++;
      if (i >= sequence.length) {
        clearInterval(interval);
        setTimeout(() => {
          setShowing(false);
          setUserInput([]);
        }, 500);
      }
    }, 600);
    return () => clearInterval(interval);
  }, [sequence]);

  function handleTap(tile: number) {
    if (showing || done) return;
    const next = [...userInput, tile];
    setUserInput(next);
    const idx = next.length - 1;
    if (sequence[idx] !== tile) {
      // mistake: gently restart the same level, no punishment copy
      setUserInput([]);
      return;
    }
    if (next.length === sequence.length) {
      if (sequence.length >= TARGET_LEVEL) {
        setDone(true);
        return;
      }
      setShowing(true);
      setSequence((s) => [...s, randomTile()]);
    }
  }

  if (done) {
    return <GameDone label={`You reproduced a ${TARGET_LEVEL}-step pattern.`} onComplete={onComplete} />;
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-sm text-[var(--fg-muted)]">
        {showing ? "Watch the sequence..." : `Your turn — repeat ${sequence.length} tile${sequence.length > 1 ? "s" : ""}`}
      </p>
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: TILE_COUNT }).map((_, i) => (
          <button
            key={i}
            onClick={() => handleTap(i)}
            className={cn(
              "h-20 w-20 rounded-[var(--radius-md)] border border-[var(--border)] transition-colors",
              activeTile === i ? "bg-[var(--accent)]" : "bg-[var(--bg-elevated)]"
            )}
            aria-label={`Tile ${i + 1}`}
          />
        ))}
      </div>
      <button onClick={onComplete} className="text-xs text-[var(--fg-subtle)] underline">
        Skip (dev)
      </button>
    </div>
  );
}
