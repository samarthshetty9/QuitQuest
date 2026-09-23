"use client";
import Link from "next/link";
import { Flame, ChevronRight, CheckCircle2, Circle, Sparkles, ClipboardList } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import type { GameData } from "@/hooks/useGameData";
import { formatCurrency } from "@/lib/domain/calculations";
import { completeQuestAction } from "@/lib/game/engine";
import { ACHIEVEMENTS } from "@/lib/config/achievements";
import { CHAPTERS, chapterForDay } from "@/lib/config/chapters";
import { useLiveQuery } from "dexie-react-hooks";
import { getDB } from "@/lib/db/db";
import { CURRENT_USER_ID } from "@/lib/db/repo";

export function ActiveHome({ data }: { data: GameData }) {
  const stats = data.stats!;
  const currency = data.profile?.currency ?? "INR";
  const unlocked = useLiveQuery(() => getDB().achievementUnlocks.where({ userId: CURRENT_USER_ID }).toArray(), []) ?? [];
  const unlockedKeys = new Set(unlocked.map((u) => u.achievementKey));
  const nextAchievement = ACHIEVEMENTS.find((a) => !unlockedKeys.has(a.key));

  const todayQuests = data.quests.filter((q) => q.scope === "daily" && q.date === data.now.toISOString().slice(0, 10));
  const chapter = chapterForDay(stats.currentStreakDays);
  const chapterIndex = CHAPTERS.findIndex((c) => c.key === chapter.key);
  const nextChapter = CHAPTERS[chapterIndex + 1];

  return (
    <div className="mx-auto max-w-2xl px-4 pt-6 sm:px-6">
      {/* Hero */}
      <div className="mb-6 text-center">
        <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-[var(--fg-subtle)]">
          {data.profile?.nickname ? `Hey ${data.profile.nickname}` : "Smoke-free for"}
        </p>
        <div className="text-7xl font-black tabular-nums leading-none">{stats.currentStreakDays}</div>
        <p className="mb-4 text-[var(--fg-muted)]">{stats.currentStreakDays === 1 ? "day smoke-free" : "days smoke-free"}</p>

        <div className="mx-auto flex max-w-xs items-center justify-center gap-2 text-sm font-semibold text-[var(--accent-strong)]">
          <Sparkles size={16} />
          Level {stats.level} &middot; {stats.levelTitle}
        </div>
        <div className="mx-auto mt-2 max-w-xs">
          <ProgressBar value={stats.xpIntoLevel} max={stats.xpForNextLevel || 1} colorVar="--accent" />
          <p className="mt-1 text-xs tabular-nums text-[var(--fg-subtle)]">
            {stats.isMaxLevel ? "Max level reached" : `${stats.xpIntoLevel} / ${stats.xpForNextLevel} XP`}
          </p>
        </div>
      </div>

      {/* SOS */}
      <Link href="/battle/sos" className="mb-4 block">
        <div className="flex items-center justify-between rounded-[var(--radius-lg)] bg-[var(--danger)] px-6 py-5 text-white shadow-[0_12px_32px_-10px_rgba(220,59,59,0.55)] transition-transform active:scale-[0.99]">
          <div>
            <p className="text-lg font-bold leading-tight">I WANT TO SMOKE</p>
            <p className="text-sm text-white/80">Start a craving battle now</p>
          </div>
          <Flame size={32} />
        </div>
      </Link>

      {/* Situational quick log */}
      <Link href="/battle/checkin" className="mb-4 block">
        <div className="flex items-center justify-between rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-elevated)] px-5 py-3.5 transition-transform active:scale-[0.99] hover:border-[var(--accent)]">
          <div className="flex items-center gap-3">
            <ClipboardList size={20} className="text-[var(--fg-muted)]" />
            <div>
              <p className="text-sm font-semibold">Drinking or high right now?</p>
              <p className="text-xs text-[var(--fg-subtle)]">Log a session — even zero counts</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-[var(--fg-subtle)]" />
        </div>
      </Link>

      {/* Key stats */}
      <div className="mb-4 grid grid-cols-3 gap-3">
        <StatTile label="Saved" value={formatCurrency(stats.moneySaved, currency)} />
        <StatTile label="Avoided" value={String(stats.cigarettesAvoided)} sub="cigarettes" />
        <StatTile label="Defeated" value={String(stats.cravingsDefeated)} sub="cravings" />
      </div>

      {/* Today's quests */}
      <Card className="mb-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-bold">Today&apos;s quests</h2>
          <span className="text-xs text-[var(--fg-subtle)]">
            {todayQuests.filter((q) => q.completed).length}/{todayQuests.length}
          </span>
        </div>
        {todayQuests.length === 0 ? (
          <p className="text-sm text-[var(--fg-muted)]">Quests are loading for today.</p>
        ) : (
          <ul className="space-y-1">
            {todayQuests.map((q) => (
              <li key={q.id}>
                <button
                  onClick={() => !q.completed && completeQuestAction(q.id)}
                  disabled={q.completed}
                  className="flex w-full items-center gap-3 rounded-[var(--radius-sm)] px-2 py-2.5 text-left transition-colors hover:bg-[var(--accent-soft)]/60 disabled:hover:bg-transparent"
                >
                  {q.completed ? (
                    <CheckCircle2 size={20} className="shrink-0 text-[var(--success)]" />
                  ) : (
                    <Circle size={20} className="shrink-0 text-[var(--fg-subtle)]" />
                  )}
                  <span className={`flex-1 text-sm ${q.completed ? "text-[var(--fg-muted)] line-through" : ""}`}>
                    {q.title}
                  </span>
                  <span className="text-xs font-medium text-[var(--gold)]">+{q.xpReward}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Journey progress */}
      <Link href="/journey" className="mb-4 block">
        <Card className="hover:border-[var(--accent)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">
                Chapter {chapterIndex + 1} &middot; {chapter.title}
              </p>
              <p className="mt-1 text-sm text-[var(--fg-muted)]">
                {nextChapter ? `Next: ${nextChapter.title}` : "You're in the final chapter."}
              </p>
            </div>
            <ChevronRight className="text-[var(--fg-subtle)]" />
          </div>
        </Card>
      </Link>

      {/* Next achievement */}
      {nextAchievement && (
        <Card className="mb-4">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--fg-subtle)]">Next unlock</p>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{nextAchievement.emoji}</span>
            <div>
              <p className="text-sm font-semibold">{nextAchievement.label}</p>
              <p className="text-xs text-[var(--fg-muted)]">{nextAchievement.description}</p>
            </div>
          </div>
        </Card>
      )}

      <div className="mb-8 text-center">
        <Link href="/progress" className="text-sm font-medium text-[var(--fg-muted)] underline-offset-4 hover:underline">
          See full analytics
        </Link>
      </div>
    </div>
  );
}

function StatTile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <Card className="p-3 text-center">
      <p className="text-lg font-bold tabular-nums leading-tight">{value}</p>
      <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--fg-subtle)]">{sub ?? label}</p>
    </Card>
  );
}
