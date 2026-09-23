import { describe, it, expect } from "vitest";
import { computeInterventionStats, rankInterventionsForTrigger } from "@/lib/domain/personalization";
import type { CravingEvent, CravingInterventionResult } from "@/lib/domain/types";

function result(overrides: Partial<CravingInterventionResult>): CravingInterventionResult {
  return {
    id: `r${Math.random()}`,
    cravingEventId: "c1",
    intervention: "walk_5",
    startedAt: "2026-01-01T00:00:00.000Z",
    completedAt: "2026-01-01T00:05:00.000Z",
    intensityBefore: 8,
    intensityAfter: 3,
    ...overrides,
  };
}

function craving(interventions: CravingInterventionResult[], trigger: CravingEvent["trigger"] = "stress"): CravingEvent {
  return {
    id: `c${Math.random()}`,
    userId: "u1",
    quitAttemptId: "qa1",
    createdAt: "2026-01-01T00:00:00.000Z",
    startingIntensity: 8,
    trigger,
    interventions,
    outcome: "resolved",
  };
}

describe("computeInterventionStats", () => {
  it("reports insufficient sample size below the trend threshold", () => {
    const events = [craving([result({ intervention: "walk_5" })])];
    const stat = computeInterventionStats(events, "walk_5", "stress");
    expect(stat.uses).toBe(1);
    expect(stat.hasEnoughSamples).toBe(false);
  });

  it("computes average reduction once enough samples exist", () => {
    const events = [1, 2, 3].map(() =>
      craving([result({ intervention: "walk_5", intensityBefore: 8, intensityAfter: 3 })])
    );
    const stat = computeInterventionStats(events, "walk_5", "stress");
    expect(stat.uses).toBe(3);
    expect(stat.hasEnoughSamples).toBe(true);
    expect(stat.avgReduction).toBeCloseTo(5);
  });
});

describe("rankInterventionsForTrigger", () => {
  it("ranks the more effective personally-logged intervention above a weaker one", () => {
    const walkEvents = Array.from({ length: 5 }, () =>
      craving([result({ intervention: "walk_5", intensityBefore: 8, intensityAfter: 2 })])
    );
    const gameEvents = Array.from({ length: 5 }, () =>
      craving([result({ intervention: "distraction_tap", intensityBefore: 8, intensityAfter: 6 })])
    );
    const ranked = rankInterventionsForTrigger([...walkEvents, ...gameEvents], "stress");
    const walkIndex = ranked.findIndex((r) => r.intervention === "walk_5");
    const gameIndex = ranked.findIndex((r) => r.intervention === "distraction_tap");
    expect(walkIndex).toBeGreaterThanOrEqual(0);
    expect(gameIndex).toBeGreaterThanOrEqual(0);
    expect(walkIndex).toBeLessThan(gameIndex);
    expect(ranked[walkIndex].reason).toBe("personalized");
  });

  it("falls back to the deterministic default ranking without enough samples", () => {
    const ranked = rankInterventionsForTrigger([], "stress");
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.every((r) => r.reason === "default")).toBe(true);
  });

  it("filters to driving-safe interventions only when requested", () => {
    const ranked = rankInterventionsForTrigger([], "driving", true);
    expect(ranked.length).toBeGreaterThan(0);
  });
});
