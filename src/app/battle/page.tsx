"use client";
import Link from "next/link";
import { Flame } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { useGameData } from "@/hooks/useGameData";
import { INTERVENTIONS } from "@/lib/config/interventions";
import { useLiveQuery } from "dexie-react-hooks";
import { getDB } from "@/lib/db/db";
import { CURRENT_USER_ID } from "@/lib/db/repo";
import { computeInterventionStats } from "@/lib/domain/personalization";

export default function BattlePage() {
  const data = useGameData();
  const prefs = useLiveQuery(() => getDB().copingPreferences.get(CURRENT_USER_ID), []);
  const favorites = prefs?.favoriteInterventions ?? [];

  return (
    <div className="mx-auto max-w-2xl px-4 pt-6 sm:px-6">
      <h1 className="mb-1 text-2xl font-bold">Battle</h1>
      <p className="mb-6 text-[var(--fg-muted)]">Cravings, coping tools, and your trigger intelligence.</p>

      <Link href="/battle/sos" className="mb-6 block">
        <div className="flex items-center justify-between rounded-[var(--radius-lg)] bg-[var(--danger)] px-6 py-5 text-white shadow-[0_12px_32px_-10px_rgba(220,59,59,0.55)] transition-transform active:scale-[0.99]">
          <div>
            <p className="text-lg font-bold leading-tight">I WANT TO SMOKE</p>
            <p className="text-sm text-white/80">Start a craving battle now</p>
          </div>
          <Flame size={32} />
        </div>
      </Link>

      <h2 className="mb-3 text-base font-bold">My Arsenal</h2>
      {favorites.length === 0 ? (
        <Card className="mb-6">
          <p className="text-sm text-[var(--fg-muted)]">
            No favourite tools chosen yet. Pick some from the You tab so they&apos;re ready before you need them.
          </p>
        </Card>
      ) : (
        <div className="mb-6 grid grid-cols-3 gap-3">
          {favorites.map((key) => {
            const def = INTERVENTIONS.find((i) => i.key === key);
            if (!def) return null;
            return (
              <Card key={key} className="p-3 text-center">
                <div className="mb-1 text-2xl">{def.emoji}</div>
                <p className="text-xs font-medium">{def.shortLabel}</p>
              </Card>
            );
          })}
        </div>
      )}

      <h2 className="mb-3 text-base font-bold">Your Trigger Intelligence</h2>
      {data.cravingEvents.length === 0 ? (
        <Card>
          <p className="text-sm text-[var(--fg-muted)]">
            You haven&apos;t logged a craving yet. When one hits, Battle will be ready.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {Array.from(new Set(data.cravingEvents.map((e) => e.trigger))).map((trigger) => {
            const events = data.cravingEvents.filter((e) => e.trigger === trigger);
            const best = INTERVENTIONS.map((i) => computeInterventionStats(events, i.key, trigger))
              .filter((s) => s.hasEnoughSamples)
              .sort((a, b) => b.avgReduction - a.avgReduction)[0];
            return (
              <Card key={trigger}>
                <p className="mb-1 text-sm font-semibold capitalize">{trigger.replace(/_/g, " ")}</p>
                <p className="text-xs text-[var(--fg-muted)]">
                  {events.length} logged &middot;{" "}
                  {best
                    ? `${INTERVENTIONS.find((i) => i.key === best.intervention)?.shortLabel} has worked best for you (avg -${best.avgReduction.toFixed(1)})`
                    : "Not enough data yet for a personal trend"}
                </p>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
