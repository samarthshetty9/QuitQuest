"use client";
import { useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Lock, CheckCircle2, Swords, Trophy } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useGameData } from "@/hooks/useGameData";
import { CHAPTERS, chapterForDay } from "@/lib/config/chapters";
import { ACHIEVEMENTS, type AchievementDef } from "@/lib/config/achievements";
import { SKILLS, skillLevelInfo, SKILL_UNLOCKS } from "@/lib/config/skills";
import { getDB } from "@/lib/db/db";
import { CURRENT_USER_ID } from "@/lib/db/repo";
import { computeEligibleBosses, reportBossOutcome } from "@/lib/game/engine";
import { cn } from "@/lib/utils";

type Tab = "map" | "skills" | "achievements" | "collections";

export default function JourneyPage() {
  const [tab, setTab] = useState<Tab>("map");
  const data = useGameData();
  const unlocks = useLiveQuery(() => getDB().achievementUnlocks.where({ userId: CURRENT_USER_ID }).toArray(), []) ?? [];
  const bossAttempts = useLiveQuery(() => getDB().bossAttempts.where({ userId: CURRENT_USER_ID }).toArray(), []) ?? [];
  const [eligibleBosses, setEligibleBosses] = useState<string[]>([]);

  useEffect(() => {
    computeEligibleBosses().then(setEligibleBosses);
  }, [data.cravingEvents]);

  if (!data.stats) return <div className="min-h-dvh" />;

  const currentChapter = chapterForDay(data.stats.currentStreakDays);
  const unlockedKeys = new Set(unlocks.map((u) => u.achievementKey));
  const beatenBosses = new Set(bossAttempts.filter((b) => b.outcome === "success").map((b) => b.bossKey));

  const skillXp = computeSkillXp(data);

  return (
    <div className="mx-auto max-w-2xl px-4 pt-6 sm:px-6">
      <h1 className="mb-1 text-2xl font-bold">Journey</h1>
      <p className="mb-5 text-[var(--fg-muted)]">World progression, skills, achievements, and collections.</p>

      <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
        {(["map", "skills", "achievements", "collections"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-semibold capitalize transition-colors",
              tab === t ? "bg-[var(--accent)] text-white" : "bg-[var(--bg-elevated)] text-[var(--fg-muted)] border border-[var(--border)]"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "map" && (
        <div className="space-y-4">
          {CHAPTERS.map((chapter, idx) => {
            const isCurrent = chapter.key === currentChapter.key;
            const isPast = chapter.order < currentChapter.order;
            const isLocked = chapter.order > currentChapter.order;
            return (
              <Card key={chapter.key} className={cn(isCurrent && "border-[var(--accent)]", isLocked && "opacity-60")}>
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                      isPast && "bg-[var(--success-soft)] text-[var(--success)]",
                      isCurrent && "bg-[var(--accent)] text-white",
                      isLocked && "bg-[var(--border)] text-[var(--fg-subtle)]"
                    )}
                  >
                    {isPast ? <CheckCircle2 size={18} /> : isLocked ? <Lock size={14} /> : idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--fg-subtle)]">{chapter.subtitle}</p>
                    <p className="font-bold">{chapter.title}</p>
                    <p className="mt-1 text-sm text-[var(--fg-muted)]">{chapter.description}</p>
                    {chapter.bosses.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {chapter.bosses.map((boss) => {
                          const beaten = beatenBosses.has(boss.key);
                          const eligible = eligibleBosses.includes(boss.key);
                          return (
                            <div
                              key={boss.key}
                              className="flex items-center justify-between rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--bg)] px-3 py-2"
                            >
                              <div className="flex items-center gap-2">
                                <span>{boss.emoji}</span>
                                <div>
                                  <p className="text-sm font-semibold">{boss.label}</p>
                                  <p className="text-xs text-[var(--fg-subtle)]">{boss.description}</p>
                                </div>
                              </div>
                              {beaten ? (
                                <Trophy size={18} className="shrink-0 text-[var(--gold)]" />
                              ) : eligible ? (
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() =>
                                    reportBossOutcome(boss.key, "success").then(() =>
                                      computeEligibleBosses().then(setEligibleBosses)
                                    )
                                  }
                                >
                                  <Swords size={14} /> Mark beaten
                                </Button>
                              ) : (
                                <span className="text-xs text-[var(--fg-subtle)]">{boss.eligibility}</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {tab === "skills" && (
        <div className="space-y-4">
          {SKILLS.map((skill) => {
            const info = skillLevelInfo(skillXp[skill.key] ?? 0);
            const unlocks = SKILL_UNLOCKS[skill.key];
            const nextUnlock = unlocks.find((u) => u.level > info.level);
            return (
              <Card key={skill.key}>
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{skill.emoji}</span>
                    <div>
                      <p className="font-bold">{skill.label}</p>
                      <p className="text-xs text-[var(--fg-muted)]">{skill.description}</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold tabular-nums" style={{ color: `var(--${skill.key})` }}>
                    Lv {info.level}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--border)]">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(100, (info.xpIntoLevel / info.xpForNextLevel) * 100)}%`,
                      background: `var(--${skill.key})`,
                    }}
                  />
                </div>
                {nextUnlock && (
                  <p className="mt-2 text-xs text-[var(--fg-subtle)]">
                    Level {nextUnlock.level}: {nextUnlock.label}
                  </p>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {tab === "achievements" && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {ACHIEVEMENTS.map((a) => (
            <AchievementTile key={a.key} def={a} unlocked={unlockedKeys.has(a.key)} />
          ))}
        </div>
      )}

      {tab === "collections" && (
        <div className="space-y-3">
          {["coffee", "after_food", "stress", "driving", "parties", "alcohol", "boredom"].map((trigger) => {
            const count = data.cravingEvents.filter((e) => e.trigger === trigger && e.outcome === "resolved").length;
            const mastered = count >= 5;
            return (
              <Card key={trigger} className={cn("flex items-center justify-between", mastered && "border-[var(--gold)]")}>
                <div>
                  <p className="text-sm font-semibold capitalize">{trigger.replace(/_/g, " ")} Mastery</p>
                  <p className="text-xs text-[var(--fg-muted)]">{count}/5 smoke-free resolutions logged</p>
                </div>
                {mastered && <Trophy size={20} className="text-[var(--gold)]" />}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function AchievementTile({ def, unlocked }: { def: AchievementDef; unlocked: boolean }) {
  return (
    <Card className={cn("flex flex-col items-center gap-1 p-3 text-center", !unlocked && "opacity-40 grayscale")}>
      <span className="text-2xl">{def.emoji}</span>
      <p className="text-xs font-bold">{def.label}</p>
      <p className="text-[10px] uppercase tracking-wide text-[var(--fg-subtle)]">{def.rarity}</p>
    </Card>
  );
}

function computeSkillXp(data: ReturnType<typeof useGameData>) {
  const mind = data.cravingEvents.filter((e) => e.interventions.some((i) => i.intervention === "urge_surf" || i.intervention === "talk_back")).length * 40;
  const resistance = data.cravingEvents.filter((e) => e.outcome === "resolved" && e.startingIntensity >= 6).length * 50;
  const recovery = (data.stats?.lifetimeSmokeFreeDays ?? 0) * 20;
  const wealth = Math.floor((data.stats?.moneySaved ?? 0) / 10);
  const discipline = data.quests.filter((q) => q.completed).length * 25;
  return { mind, resistance, recovery, wealth, discipline };
}
