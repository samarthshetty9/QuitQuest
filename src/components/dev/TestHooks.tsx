"use client";
import { useEffect } from "react";
import { clock, isTestControlAllowed } from "@/lib/time/clock";
import { loadDemoProfile, resetToFreshInstall } from "@/lib/dev/seed";
import * as repo from "@/lib/db/repo";

declare global {
  interface Window {
    __quitquest_test__?: {
      advanceMs: (ms: number) => void;
      freezeAtISO: (iso: string) => void;
      resetClock: () => void;
      loadDemoProfile: () => Promise<void>;
      resetAllData: () => Promise<void>;
      awardXp: typeof repo.awardXp;
    };
  }
}

/**
 * Exposes clock/data controls on `window` for Playwright only. Gated by
 * isTestControlAllowed (never true in a production build), so this hook
 * compiles away to a no-op in production regardless of what calls it.
 */
export function TestHooks() {
  useEffect(() => {
    if (!isTestControlAllowed()) return;
    window.__quitquest_test__ = {
      advanceMs: (ms: number) => clock.advance(ms),
      freezeAtISO: (iso: string) => clock.freezeAt(new Date(iso)),
      resetClock: () => clock.reset(),
      loadDemoProfile,
      resetAllData: resetToFreshInstall,
      awardXp: repo.awardXp,
    };
    return () => {
      delete window.__quitquest_test__;
    };
  }, []);

  return null;
}
