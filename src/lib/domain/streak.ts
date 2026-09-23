import { differenceInCalendarDays, formatISO, parseISO } from "date-fns";
import type { QuitAttempt, SlipEvent } from "@/lib/domain/types";

export interface StreakInput {
  attempts: QuitAttempt[]; // all quit attempts for the user, any order
  slips: SlipEvent[]; // all slip events for the user, any order
  now: Date;
}

export interface StreakResult {
  currentStreakDays: number;
  currentStreakStartISO: string | null;
  bestStreakDays: number;
  lifetimeSmokeFreeDays: number;
  totalDaysTracked: number;
  totalCigarettesSmoked: number;
  totalSlips: number;
  smokeFreePercentage: number; // over all tracked attempt time
}

function calendarDateKey(iso: string): string {
  return formatISO(parseISO(iso), { representation: "date" });
}

/**
 * Streaks and lifetime stats are derived from the full event history every
 * time, not from a cached counter, so a slip can never silently corrupt
 * historical numbers. A slip resets the CURRENT streak only; lifetime
 * smoke-free days, XP, and levels are unaffected.
 */
export function computeStreaks(input: StreakInput): StreakResult {
  const { now } = input;
  const attempts = [...input.attempts].sort(
    (a, b) => new Date(a.quitDateTime).getTime() - new Date(b.quitDateTime).getTime()
  );

  let totalDaysTracked = 0;
  let lifetimeSmokeFreeDays = 0;
  let bestStreakDays = 0;
  let currentStreakDays = 0;
  let currentStreakStartISO: string | null = null;
  let totalCigarettesSmoked = 0;
  let totalSlips = 0;

  for (const attempt of attempts) {
    const start = parseISO(attempt.quitDateTime);
    if (start > now) continue; // future quit date: preparation mode, no elapsed stats yet
    const end = attempt.active ? now : attempt.endedAt ? parseISO(attempt.endedAt) : now;

    const attemptSlips = input.slips
      .filter((s) => s.quitAttemptId === attempt.id)
      .sort((a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime());

    totalSlips += attemptSlips.length;
    totalCigarettesSmoked += attemptSlips.reduce((sum, s) => sum + Math.max(0, s.cigaretteCount), 0);

    const daysInAttempt = Math.max(0, differenceInCalendarDays(end, start)) + 1;
    totalDaysTracked += daysInAttempt;

    const slipDayKeys = new Set(attemptSlips.map((s) => calendarDateKey(s.occurredAt)));
    lifetimeSmokeFreeDays += Math.max(0, daysInAttempt - slipDayKeys.size);

    // Walk streak segments within this attempt, bounded by slips.
    let segmentStart = start;
    for (const slip of attemptSlips) {
      const slipTime = parseISO(slip.occurredAt);
      const segMs = Math.max(0, slipTime.getTime() - segmentStart.getTime());
      const segDays = segMs / (1000 * 60 * 60 * 24);
      bestStreakDays = Math.max(bestStreakDays, segDays);
      segmentStart = slipTime;
    }
    const finalSegMs = Math.max(0, end.getTime() - segmentStart.getTime());
    const finalSegDays = finalSegMs / (1000 * 60 * 60 * 24);
    bestStreakDays = Math.max(bestStreakDays, finalSegDays);

    if (attempt.active) {
      currentStreakDays = finalSegDays;
      currentStreakStartISO = segmentStart.toISOString();
    }
  }

  const smokeFreePercentage = totalDaysTracked > 0 ? (lifetimeSmokeFreeDays / totalDaysTracked) * 100 : 0;

  return {
    currentStreakDays,
    currentStreakStartISO,
    bestStreakDays,
    lifetimeSmokeFreeDays,
    totalDaysTracked,
    totalCigarettesSmoked,
    totalSlips,
    smokeFreePercentage,
  };
}
