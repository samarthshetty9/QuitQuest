"use client";
import { useEffect, useMemo, useState } from "react";
import { clock } from "@/lib/time/clock";
import { isTestControlAllowed } from "@/lib/time/clock";

export function useCountdown(durationSeconds: number) {
  const deadline = useMemo(() => clock.now().getTime() + durationSeconds * 1000, [durationSeconds]);
  const [remainingMs, setRemainingMs] = useState(() => Math.max(0, deadline - clock.now().getTime()));

  useEffect(() => {
    const tick = () => setRemainingMs(Math.max(0, deadline - clock.now().getTime()));
    tick();
    const id = setInterval(tick, 250);
    const unsub = clock.subscribe(tick);
    return () => {
      clearInterval(id);
      unsub();
    };
  }, [deadline]);

  const isDone = remainingMs <= 0;
  const remainingSeconds = Math.ceil(remainingMs / 1000);
  const elapsedSeconds = Math.min(durationSeconds, durationSeconds - Math.floor(remainingMs / 1000));
  const progress = durationSeconds > 0 ? 1 - remainingMs / (durationSeconds * 1000) : 1;

  function devSkip() {
    if (!isTestControlAllowed()) return;
    clock.advance(remainingMs + 500);
  }

  return { remainingSeconds, remainingMs, isDone, elapsedSeconds, progress, devSkip };
}
