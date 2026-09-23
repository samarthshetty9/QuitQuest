"use client";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { CheckCircle2, Circle } from "lucide-react";
import type { GameData } from "@/hooks/useGameData";
import { useLiveQuery } from "dexie-react-hooks";
import { getDB } from "@/lib/db/db";
import { CURRENT_USER_ID } from "@/lib/db/repo";

const PREP_MISSIONS = [
  { key: "remove_cigs", label: "Remove cigarettes, lighters, and ashtrays" },
  { key: "identify_triggers", label: "Identify your triggers" },
  { key: "pick_arsenal", label: "Choose your coping arsenal" },
  { key: "make_plans", label: "Create three IF-THEN plans" },
  { key: "tell_someone", label: "Tell an accountability person" },
  { key: "pick_rewards", label: "Choose a reward goal" },
  { key: "practice_technique", label: "Practice one craving technique" },
];

export function PreparationHome({ data }: { data: GameData }) {
  const plans = data.ifThenPlans;
  const goals = data.rewardGoals;
  const prefs = useLiveQuery(() => getDB().copingPreferences.get(CURRENT_USER_ID), []);

  const done = {
    remove_cigs: false,
    identify_triggers: (data.profile?.commonTriggers?.length ?? 0) > 0,
    pick_arsenal: (prefs?.favoriteInterventions.length ?? 0) > 0,
    make_plans: plans.length >= 3,
    tell_someone: false,
    pick_rewards: goals.length > 0,
    practice_technique: data.cravingEvents.length > 0,
  } as Record<string, boolean>;

  const doneCount = Object.values(done).filter(Boolean).length;

  return (
    <div className="mx-auto max-w-2xl px-4 pt-6 sm:px-6">
      <div className="mb-6 text-center">
        <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-[var(--accent)]">Preparation Mode</p>
        <div className="text-6xl font-black tabular-nums">{data.stats?.daysUntilQuit ?? 0}</div>
        <p className="text-[var(--fg-muted)]">
          {data.stats?.daysUntilQuit === 1 ? "day until Quit Day" : "days until Quit Day"}
        </p>
      </div>

      <Card className="mb-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-bold">Preparation missions</h2>
          <span className="text-sm text-[var(--fg-muted)] tabular-nums">
            {doneCount}/{PREP_MISSIONS.length}
          </span>
        </div>
        <ProgressBar value={doneCount} max={PREP_MISSIONS.length} className="mb-4" />
        <ul className="space-y-3">
          {PREP_MISSIONS.map((m) => (
            <li key={m.key} className="flex items-center gap-3 text-sm">
              {done[m.key] ? (
                <CheckCircle2 size={20} className="shrink-0 text-[var(--success)]" />
              ) : (
                <Circle size={20} className="shrink-0 text-[var(--fg-subtle)]" />
              )}
              <span className={done[m.key] ? "text-[var(--fg-muted)] line-through" : ""}>{m.label}</span>
            </li>
          ))}
        </ul>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Link href="/battle" className="block">
          <Card className="text-center hover:border-[var(--accent)]">
            <p className="text-sm font-semibold">Practice a technique</p>
            <p className="mt-1 text-xs text-[var(--fg-muted)]">Try a coping tool before you need it</p>
          </Card>
        </Link>
        <Link href="/you" className="block">
          <Card className="text-center hover:border-[var(--accent)]">
            <p className="text-sm font-semibold">Set up your plans</p>
            <p className="mt-1 text-xs text-[var(--fg-muted)]">Reasons, rewards, and IF-THEN plans</p>
          </Card>
        </Link>
      </div>

      <p className="mt-6 text-center text-xs text-[var(--fg-subtle)]">
        Money saved and cigarettes avoided will start counting from your quit day.
      </p>
    </div>
  );
}
