import type { SlipEvent, UserProfile } from "@/lib/domain/types";

/** Elapsed time between two instants, clamped to zero (never negative). */
export function elapsedMs(fromISO: string, toDate: Date): number {
  const from = new Date(fromISO).getTime();
  const to = toDate.getTime();
  return Math.max(0, to - from);
}

export function elapsedDays(fromISO: string, toDate: Date): number {
  return elapsedMs(fromISO, toDate) / (1000 * 60 * 60 * 24);
}

export interface MoneyCalcInput {
  profile: Pick<UserProfile, "cigarettesPerDayBaseline" | "cigarettesPerPack" | "pricePerPack">;
  quitDateTimeISO: string;
  now: Date;
  slips: Pick<SlipEvent, "cigaretteCount">[];
}

export interface MoneyCalcResult {
  dailySmokingCost: number;
  pricePerCigarette: number;
  elapsedDays: number;
  expectedSpend: number;
  actualSpentOnSlips: number;
  moneySaved: number;
}

/**
 * daily smoking cost = (cigarettes per day / cigarettes per pack) * pack price
 * money saved = expected spend at baseline rate over elapsed time, minus
 * what was actually spent buying cigarettes during logged slips.
 */
export function calculateMoneySaved(input: MoneyCalcInput): MoneyCalcResult {
  const { profile, quitDateTimeISO, now, slips } = input;
  const cigsPerPack = Math.max(1, profile.cigarettesPerPack);
  const pricePerPack = Math.max(0, profile.pricePerPack);
  const cigsPerDay = Math.max(0, profile.cigarettesPerDayBaseline);

  const dailySmokingCost = (cigsPerDay / cigsPerPack) * pricePerPack;
  const pricePerCigarette = pricePerPack / cigsPerPack;

  const days = elapsedDays(quitDateTimeISO, now);
  const expectedSpend = dailySmokingCost * days;
  const actualSpentOnSlips =
    slips.reduce((sum, s) => sum + Math.max(0, s.cigaretteCount), 0) * pricePerCigarette;

  const moneySaved = Math.max(0, expectedSpend - actualSpentOnSlips);

  return {
    dailySmokingCost,
    pricePerCigarette,
    elapsedDays: days,
    expectedSpend,
    actualSpentOnSlips,
    moneySaved,
  };
}

export interface CigarettesAvoidedInput {
  profile: Pick<UserProfile, "cigarettesPerDayBaseline">;
  quitDateTimeISO: string;
  now: Date;
  slips: Pick<SlipEvent, "cigaretteCount">[];
}

export interface CigarettesAvoidedResult {
  elapsedDays: number;
  expectedCigarettes: number;
  actualCigarettesSmoked: number;
  cigarettesAvoided: number;
}

/** Never returns a negative avoided count; this is clearly an estimate. */
export function calculateCigarettesAvoided(input: CigarettesAvoidedInput): CigarettesAvoidedResult {
  const { profile, quitDateTimeISO, now, slips } = input;
  const days = elapsedDays(quitDateTimeISO, now);
  const expectedCigarettes = Math.max(0, profile.cigarettesPerDayBaseline) * days;
  const actualCigarettesSmoked = slips.reduce((sum, s) => sum + Math.max(0, s.cigaretteCount), 0);
  const cigarettesAvoided = Math.max(0, expectedCigarettes - actualCigarettesSmoked);
  return { elapsedDays: days, expectedCigarettes, actualCigarettesSmoked, cigarettesAvoided };
}

export interface TimeSavedInput {
  cigarettesAvoided: number;
  minutesPerSmokingEvent: number;
}

/** Only estimated from the user's own reported minutes-per-cigarette, never a universal constant. */
export function calculateTimeSavedMinutes(input: TimeSavedInput): number {
  return Math.max(0, input.cigarettesAvoided) * Math.max(0, input.minutesPerSmokingEvent);
}

export function formatCurrency(amount: number, currency: string, locale?: string): string {
  try {
    return new Intl.NumberFormat(locale ?? undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: amount >= 1000 ? 0 : 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(0)}`;
  }
}
