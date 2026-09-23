import type {
  UserProfile,
  QuitAttempt,
  CravingEvent,
  SlipEvent,
  XPEvent,
  IfThenPlan,
  RewardGoal,
} from "@/lib/domain/types";
import { calculateMoneySaved, calculateCigarettesAvoided, calculateTimeSavedMinutes } from "@/lib/domain/calculations";
import { computeStreaks } from "@/lib/domain/streak";
import { levelFromEvents } from "@/lib/domain/xp";
import { chapterForDay } from "@/lib/config/chapters";

export interface GameStats {
  isPreparationMode: boolean;
  daysUntilQuit: number;
  currentStreakDays: number;
  bestStreakDays: number;
  lifetimeSmokeFreeDays: number;
  smokeFreePercentage: number;
  moneySaved: number;
  dailySmokingCost: number;
  cigarettesAvoided: number;
  timeSavedMinutes: number;
  totalCigarettesSmoked: number;
  totalSlips: number;
  cravingsDefeated: number;
  cravingsTotal: number;
  level: number;
  levelTitle: string;
  xpIntoLevel: number;
  xpForNextLevel: number;
  totalXp: number;
  isMaxLevel: boolean;
  currentChapterKey: string;
}

export function computeGameStats(input: {
  profile: UserProfile;
  activeAttempt: QuitAttempt | undefined;
  allAttempts: QuitAttempt[];
  cravingEvents: CravingEvent[];
  slips: SlipEvent[];
  xpEvents: XPEvent[];
  now: Date;
}): GameStats {
  const { profile, activeAttempt, allAttempts, cravingEvents, slips, xpEvents, now } = input;

  const isPreparationMode = !!activeAttempt && new Date(activeAttempt.quitDateTime) > now;
  const daysUntilQuit = activeAttempt
    ? Math.max(0, Math.ceil((new Date(activeAttempt.quitDateTime).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  const streaks = computeStreaks({ attempts: allAttempts, slips, now });

  const money =
    activeAttempt && !isPreparationMode
      ? calculateMoneySaved({ profile, quitDateTimeISO: activeAttempt.quitDateTime, now, slips })
      : { moneySaved: 0, dailySmokingCost: 0, elapsedDays: 0, expectedSpend: 0, actualSpentOnSlips: 0, pricePerCigarette: 0 };

  const cigs =
    activeAttempt && !isPreparationMode
      ? calculateCigarettesAvoided({ profile, quitDateTimeISO: activeAttempt.quitDateTime, now, slips })
      : { cigarettesAvoided: 0, elapsedDays: 0, expectedCigarettes: 0, actualCigarettesSmoked: 0 };

  const timeSavedMinutes = calculateTimeSavedMinutes({
    cigarettesAvoided: cigs.cigarettesAvoided,
    minutesPerSmokingEvent: profile.minutesPerSmokingEvent,
  });

  const levelInfo = levelFromEvents(xpEvents);

  const cravingsDefeated = cravingEvents.filter((e) => e.outcome === "resolved").length;

  return {
    isPreparationMode,
    daysUntilQuit,
    currentStreakDays: Math.floor(streaks.currentStreakDays),
    bestStreakDays: Math.floor(streaks.bestStreakDays),
    lifetimeSmokeFreeDays: Math.floor(streaks.lifetimeSmokeFreeDays),
    smokeFreePercentage: streaks.smokeFreePercentage,
    moneySaved: money.moneySaved,
    dailySmokingCost: money.dailySmokingCost,
    cigarettesAvoided: Math.floor(cigs.cigarettesAvoided),
    timeSavedMinutes,
    totalCigarettesSmoked: streaks.totalCigarettesSmoked,
    totalSlips: streaks.totalSlips,
    cravingsDefeated,
    cravingsTotal: cravingEvents.length,
    level: levelInfo.level,
    levelTitle: levelInfo.title,
    xpIntoLevel: levelInfo.xpIntoLevel,
    xpForNextLevel: levelInfo.xpForNextLevel,
    totalXp: levelInfo.totalXp,
    isMaxLevel: levelInfo.isMaxLevel,
    currentChapterKey: chapterForDay(Math.floor(streaks.currentStreakDays)).key,
  };
}

export function planEligibleFor(plan: IfThenPlan, trigger: string): boolean {
  return plan.active && plan.trigger === trigger;
}

export function rewardProgress(goal: RewardGoal, moneySaved: number): number {
  if (goal.targetCost <= 0) return 0;
  return Math.min(1, moneySaved / goal.targetCost);
}
