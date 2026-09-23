"use client";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useCountdown } from "@/hooks/useCountdown";

export function TapGame({ onComplete }: { onComplete: () => void }) {
  const [score, setScore] = useState(0);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const { remainingSeconds, isDone, devSkip } = useCountdown(60);

  function tap() {
    setScore((s) => s + 1);
    setPos({ x: 10 + Math.random() * 80, y: 10 + Math.random() * 70 });
  }

  if (isDone) {
    return (
      <GameDone label={`You tapped ${score} times.`} onComplete={onComplete} />
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="tabular-nums text-sm text-[var(--fg-muted)]">{remainingSeconds}s left &middot; score {score}</p>
      <div className="relative h-72 w-full overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-elevated)]">
        <button
          onClick={tap}
          aria-label="Tap target"
          className="absolute h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--accent)] text-white shadow-lg transition-all duration-150 active:scale-90"
          style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
        >
          Tap
        </button>
      </div>
      <button onClick={devSkip} className="text-xs text-[var(--fg-subtle)] underline">
        Skip (dev)
      </button>
    </div>
  );
}

export function GameDone({ label, onComplete }: { label: string; onComplete: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 py-8 text-center">
      <p className="text-lg font-semibold">Nice — attention redirected.</p>
      <p className="text-sm text-[var(--fg-muted)]">{label}</p>
      <Button size="lg" onClick={onComplete}>
        Continue
      </Button>
    </div>
  );
}
