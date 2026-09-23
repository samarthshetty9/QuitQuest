import type { CravingEvent, InterventionKey, TriggerKey } from "@/lib/domain/types";
import { TRIGGER_DEFAULT_RANKING, INTERVENTIONS } from "@/lib/config/interventions";

export const MIN_SAMPLES_FOR_TREND = 3;
export const MIN_SAMPLES_FOR_STRONG_PERSONALIZATION = 5;

export interface InterventionStat {
  intervention: InterventionKey;
  uses: number;
  completedUses: number;
  avgIntensityBefore: number;
  avgIntensityAfter: number;
  avgReduction: number;
  completionRate: number;
  hasEnoughSamples: boolean;
  hasStrongSamples: boolean;
}

/** Aggregate a user's own logged history for one intervention, optionally filtered to one trigger. */
export function computeInterventionStats(
  events: CravingEvent[],
  intervention: InterventionKey,
  trigger?: TriggerKey
): InterventionStat {
  const results = events
    .filter((e) => !trigger || e.trigger === trigger)
    .flatMap((e) => e.interventions.filter((r) => r.intervention === intervention));

  const uses = results.length;
  const completed = results.filter((r) => r.completedAt && !r.skipped);
  const withBeforeAfter = completed.filter((r) => typeof r.intensityAfter === "number");

  const avgIntensityBefore = avg(withBeforeAfter.map((r) => r.intensityBefore));
  const avgIntensityAfter = avg(withBeforeAfter.map((r) => r.intensityAfter as number));
  const avgReduction = avg(withBeforeAfter.map((r) => r.intensityBefore - (r.intensityAfter as number)));

  return {
    intervention,
    uses,
    completedUses: completed.length,
    avgIntensityBefore,
    avgIntensityAfter,
    avgReduction,
    completionRate: uses > 0 ? completed.length / uses : 0,
    hasEnoughSamples: withBeforeAfter.length >= MIN_SAMPLES_FOR_TREND,
    hasStrongSamples: withBeforeAfter.length >= MIN_SAMPLES_FOR_STRONG_PERSONALIZATION,
  };
}

function avg(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

export interface RankedIntervention {
  intervention: InterventionKey;
  reason: "personalized" | "default";
  stat?: InterventionStat;
}

/**
 * Rank interventions for a trigger. Uses the user's own logged effectiveness
 * once enough samples exist (MIN_SAMPLES_FOR_TREND); otherwise falls back to
 * the deterministic default ranking. Never claims universal/medical
 * superiority — ranking reasons should always be explained as personal history.
 */
export function rankInterventionsForTrigger(
  events: CravingEvent[],
  trigger: TriggerKey,
  excludeSafeWhileDrivingOnly = false
): RankedIntervention[] {
  const candidates = excludeSafeWhileDrivingOnly
    ? INTERVENTIONS.filter((i) => i.safeWhileDriving)
    : INTERVENTIONS;

  const defaultOrder = TRIGGER_DEFAULT_RANKING[trigger].filter((k) =>
    candidates.some((c) => c.key === k)
  );

  // Consider every candidate the user has actually tried for this trigger, not
  // just ones in the fixed default list — if something outside the suggested
  // set worked for them personally, it should be able to surface too.
  const allStats = candidates.map((c) => computeInterventionStats(events, c.key, trigger));
  const personalized = allStats.filter((s) => s.hasEnoughSamples);
  const rest = defaultOrder.filter((k) => !personalized.some((p) => p.intervention === k));

  personalized.sort((a, b) => b.avgReduction - a.avgReduction);

  const ranked: RankedIntervention[] = [
    ...personalized.map((s) => ({ intervention: s.intervention, reason: "personalized" as const, stat: s })),
    ...rest.map((k) => ({ intervention: k, reason: "default" as const })),
  ];

  // Ensure at least a handful of options even if the trigger's default list is short.
  if (ranked.length < 4) {
    for (const c of candidates) {
      if (!ranked.some((r) => r.intervention === c.key)) {
        ranked.push({ intervention: c.key, reason: "default" });
      }
      if (ranked.length >= 6) break;
    }
  }

  return ranked;
}
