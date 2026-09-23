"use client";
import { Button } from "@/components/ui/Button";
import { useCountdown } from "@/hooks/useCountdown";
import { useEffect } from "react";

export function TimerIntervention({
  durationSeconds,
  title,
  subtitle,
  onDone,
}: {
  durationSeconds: number;
  title: string;
  subtitle: string;
  onDone: () => void;
}) {
  const { remainingSeconds, isDone, progress, devSkip } = useCountdown(durationSeconds);

  useEffect(() => {
    if (isDone) onDone();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDone]);

  const bars = 24;

  return (
    <div className="flex flex-col items-center gap-6 py-4 text-center">
      <p className="text-lg font-semibold">{title}</p>
      <p className="max-w-xs text-sm text-[var(--fg-muted)]">{subtitle}</p>

      <div className="flex h-24 items-end gap-[3px]" aria-hidden>
        {Array.from({ length: bars }).map((_, i) => {
          const active = i / bars < progress;
          return (
            <div
              key={i}
              className="w-2 rounded-full transition-all duration-300"
              style={{
                height: `${20 + Math.sin(i * 0.9) * 30 + 30}%`,
                background: active ? "var(--accent)" : "var(--border)",
                animationName: active ? "wave" : "none",
                animationDuration: "1.4s",
                animationTimingFunction: "ease-in-out",
                animationIterationCount: "infinite",
                animationDelay: `${i * 0.05}s`,
              }}
            />
          );
        })}
      </div>

      <div className="text-5xl font-black tabular-nums">{remainingSeconds}s</div>

      <Button variant="secondary" size="sm" onClick={devSkip}>
        Skip (dev)
      </Button>
    </div>
  );
}
