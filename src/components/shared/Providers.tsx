"use client";
import { useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { getDB } from "@/lib/db/db";
import { CURRENT_USER_ID } from "@/lib/db/repo";
import { ensureTodayQuests, ensureThisWeekQuests, syncSmokeFreeDayXp, syncAchievements } from "@/lib/game/engine";

export function Providers({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const settings = useLiveQuery(() => getDB().appSettings.get(CURRENT_USER_ID), []);

  useEffect(() => {
    let cancelled = false;
    async function boot() {
      try {
        await syncSmokeFreeDayXp();
        await ensureTodayQuests();
        await ensureThisWeekQuests();
        await syncAchievements();
      } catch {
        // Non-fatal: the app must still render if a background sync fails.
      } finally {
        if (!cancelled) setReady(true);
      }
    }
    boot();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!settings) return;
    const root = document.documentElement;
    if (settings.theme === "light" || settings.theme === "dark") {
      root.setAttribute("data-theme", settings.theme);
    } else {
      root.removeAttribute("data-theme");
    }
    if (settings.reducedMotion) {
      root.setAttribute("data-reduced-motion", "true");
    } else {
      root.removeAttribute("data-reduced-motion");
    }
  }, [settings]);

  void ready;
  return <>{children}</>;
}
