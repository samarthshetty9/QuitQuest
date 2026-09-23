"use client";
import { useEffect, useState } from "react";
import { clock } from "@/lib/time/clock";

/** Re-renders on an interval and whenever the dev/test clock is advanced or frozen. */
export function useNow(intervalMs = 30000): Date {
  const [now, setNow] = useState(() => clock.now());

  useEffect(() => {
    const tick = () => setNow(clock.now());
    const unsub = clock.subscribe(tick);
    const id = setInterval(tick, intervalMs);
    return () => {
      unsub();
      clearInterval(id);
    };
  }, [intervalMs]);

  return now;
}
