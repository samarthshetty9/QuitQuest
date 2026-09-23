// Central XP/level configuration. Nothing about XP amounts or the level curve
// should be hardcoded anywhere else in the UI — import from here.

import type { XPSourceKey } from "@/lib/domain/types";

export const XP_AWARDS: Record<XPSourceKey, number> = {
  smoke_free_day: 100,
  craving_logged: 10,
  coping_action_completed: 15,
  craving_battle_completed: 30,
  high_intensity_craving_passed: 25, // bonus, added on top of battle completion for intensity >= 7
  daily_quest: 25,
  weekly_quest: 150,
  if_then_plan_created: 20,
  slip_reflection: 30,
  new_trigger_identified: 10,
  milestone: 100,
  boss_defeated: 120,
  achievement_unlocked: 0, // achievements carry their own xpReward, see achievements.ts
  context_checkin_good: 15, // logging a drinking/high session at or below your usual baseline
};

// Anti-farming caps: max times a dedupe-prefix can award XP per local day.
export const DAILY_XP_CAPS: Partial<Record<XPSourceKey, number>> = {
  coping_action_completed: 8,
  craving_logged: 6,
  craving_battle_completed: 6,
  new_trigger_identified: 3,
  context_checkin_good: 4,
};

export const MAX_LEVEL = 100;

/**
 * XP required to go from level N to N+1. Uses a smooth accelerating curve
 * (roughly quadratic) so early levels come quickly and later levels take
 * sustained, meaningful play.
 */
export function xpForLevel(level: number): number {
  const l = Math.max(1, Math.min(level, MAX_LEVEL));
  return Math.round(80 + 22 * l + 2.6 * l * l);
}

/** Cumulative XP needed to REACH a given level (level 1 = 0). */
export function cumulativeXpForLevel(level: number): number {
  let total = 0;
  for (let l = 1; l < level; l++) total += xpForLevel(l);
  return total;
}

export interface LevelInfo {
  level: number;
  title: string;
  xpIntoLevel: number;
  xpForNextLevel: number;
  totalXp: number;
  isMaxLevel: boolean;
}

// Title milestones — levels between these still advance numerically but
// inherit the most recent milestone title.
export const LEVEL_TITLES: Array<{ level: number; title: string }> = [
  { level: 1, title: "The Decision" },
  { level: 3, title: "First Steps" },
  { level: 5, title: "Challenger" },
  { level: 10, title: "Habit Breaker" },
  { level: 15, title: "Pattern Spotter" },
  { level: 20, title: "Craving Hunter" },
  { level: 30, title: "Nicotine Breaker" },
  { level: 40, title: "Trigger Tactician" },
  { level: 50, title: "Unchained" },
  { level: 60, title: "Steady Hand" },
  { level: 75, title: "Smoke-Free Veteran" },
  { level: 90, title: "Identity Rebuilt" },
  { level: 100, title: "Free" },
];

export function titleForLevel(level: number): string {
  let title = LEVEL_TITLES[0].title;
  for (const t of LEVEL_TITLES) {
    if (level >= t.level) title = t.title;
    else break;
  }
  return title;
}

export function levelInfoForTotalXp(totalXp: number): LevelInfo {
  let level = 1;
  let remaining = totalXp;
  while (level < MAX_LEVEL) {
    const need = xpForLevel(level);
    if (remaining < need) break;
    remaining -= need;
    level++;
  }
  const isMaxLevel = level >= MAX_LEVEL;
  const xpForNextLevel = isMaxLevel ? 0 : xpForLevel(level);
  return {
    level,
    title: titleForLevel(level),
    xpIntoLevel: remaining,
    xpForNextLevel,
    totalXp,
    isMaxLevel,
  };
}
