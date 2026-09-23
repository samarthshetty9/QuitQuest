"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { clock } from "@/lib/time/clock";

const PHASES = [
  { key: "in", label: "Breathe in", seconds: 4 },
  { key: "hold", label: "Hold", seconds: 2 },
  { key: "out", label: "Breathe out", seconds: 6 },
] as const;

const CYCLE_SECONDS = PHASES.reduce((s, p) => s + p.seconds, 0);

export function BreathingIntervention({ durationSeconds, onDone }: { durationSeconds: number; onDone: () => void }) {
  const [totalElapsed, setTotalElapsed] = useState(0);
  const doneRef = useRef(false);
  const startRef = useRef(clock.now().getTime());

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = (clock.now().getTime() - startRef.current) / 1000;
      setTotalElapsed(elapsed);
      if (elapsed >= durationSeconds && !doneRef.current) {
        doneRef.current = true;
        onDone();
      }
    }, 200);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [durationSeconds]);

  const withinCycle = totalElapsed % CYCLE_SECONDS;
  let acc = 0;
  let phaseIndex = 0;
  let phaseElapsed = 0;
  for (let i = 0; i < PHASES.length; i++) {
    if (withinCycle < acc + PHASES[i].seconds) {
      phaseIndex = i;
      phaseElapsed = withinCycle - acc;
      break;
    }
    acc += PHASES[i].seconds;
  }

  const phase = PHASES[phaseIndex];
  const phaseProgress = Math.min(1, phaseElapsed / phase.seconds);
  const scale = phase.key === "in" ? 0.6 + phaseProgress * 0.5 : phase.key === "out" ? 1.1 - phaseProgress * 0.5 : 1.1;
  const remaining = Math.max(0, Math.ceil(durationSeconds - totalElapsed));

  function devSkip() {
    doneRef.current = true;
    onDone();
  }

  return (
    <div className="flex flex-col items-center gap-6 py-4 text-center">
      <p className="text-sm text-[var(--fg-muted)]">In for 4, hold briefly, out for 6.</p>
      <div className="relative flex h-56 w-56 items-center justify-center">
        <div
          className="absolute rounded-full bg-[var(--accent-soft)] transition-transform duration-300 ease-in-out"
          style={{ width: "100%", height: "100%", transform: `scale(${scale})` }}
        />
        <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-[var(--accent)] text-white shadow-lg">
          <span className="text-base font-bold">{phase.label}</span>
        </div>
      </div>
      <p className="tabular-nums text-sm text-[var(--fg-subtle)]">{remaining}s remaining</p>
      <Button variant="secondary" size="sm" onClick={devSkip}>
        Skip (dev)
      </Button>
    </div>
  );
}
