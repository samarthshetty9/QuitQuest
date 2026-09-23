import { ACHIEVEMENTS } from "@/lib/config/achievements";
import type { CravingEvent, IfThenPlan, SlipEvent } from "@/lib/domain/types";

export interface AchievementCheckContext {
  currentStreakDays: number;
  lifetimeSmokeFreeDays: number;
  completedBattleCount: number;
  moneySaved: number;
  cigarettesAvoided: number;
  cravingEvents: CravingEvent[];
  plans: IfThenPlan[];
  slips: SlipEvent[];
}

const TIME_THRESHOLDS: Array<{ key: string; days: number }> = [
  { key: "time_24h", days: 1 },
  { key: "time_3d", days: 3 },
  { key: "time_7d", days: 7 },
  { key: "time_14d", days: 14 },
  { key: "time_30d", days: 30 },
  { key: "time_90d", days: 90 },
  { key: "time_180d", days: 180 },
  { key: "time_365d", days: 365 },
];

const BATTLE_THRESHOLDS: Array<{ key: string; count: number }> = [
  { key: "battles_1", count: 1 },
  { key: "battles_10", count: 10 },
  { key: "battles_25", count: 25 },
  { key: "battles_50", count: 50 },
  { key: "battles_100", count: 100 },
];

const MONEY_THRESHOLDS: Array<{ key: string; amount: number }> = [
  { key: "money_1000", amount: 1000 },
  { key: "money_5000", amount: 5000 },
  { key: "money_10000", amount: 10000 },
  { key: "money_25000", amount: 25000 },
];

const CIG_THRESHOLDS: Array<{ key: string; count: number }> = [
  { key: "cigs_10", count: 10 },
  { key: "cigs_50", count: 50 },
  { key: "cigs_100", count: 100 },
  { key: "cigs_500", count: 500 },
  { key: "cigs_1000", count: 1000 },
];

/** Returns achievement keys that SHOULD be unlocked given current state. Caller diffs against already-unlocked. */
export function evaluateAchievements(ctx: AchievementCheckContext): string[] {
  const unlocked = new Set<string>();

  for (const t of TIME_THRESHOLDS) {
    if (ctx.currentStreakDays >= t.days || ctx.lifetimeSmokeFreeDays >= t.days) unlocked.add(t.key);
  }
  for (const t of BATTLE_THRESHOLDS) {
    if (ctx.completedBattleCount >= t.count) unlocked.add(t.key);
  }
  for (const t of MONEY_THRESHOLDS) {
    if (ctx.moneySaved >= t.amount) unlocked.add(t.key);
  }
  for (const t of CIG_THRESHOLDS) {
    if (ctx.cigarettesAvoided >= t.count) unlocked.add(t.key);
  }

  const resolved = ctx.cravingEvents.filter((e) => e.outcome === "resolved");
  if (resolved.some((e) => e.trigger === "coffee")) unlocked.add("trigger_coffee_first");
  if (resolved.some((e) => e.trigger === "parties" || e.trigger === "other_smokers")) {
    unlocked.add("trigger_social_first");
  }
  if (resolved.some((e) => e.trigger === "stress" && e.startingIntensity >= 7)) {
    unlocked.add("trigger_stress_strong");
  }

  if (ctx.plans.length >= 1) unlocked.add("plan_first");

  const distinctTriggers = new Set(ctx.cravingEvents.map((e) => e.trigger));
  if (distinctTriggers.size >= 5) unlocked.add("triggers_five_understood");

  if (ctx.slips.some((s) => s.learnings.length > 0)) unlocked.add("slip_reflected");

  return [...unlocked].filter((k) => ACHIEVEMENTS.some((a) => a.key === k));
}
