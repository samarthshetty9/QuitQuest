import { describe, it, expect } from "vitest";
import { evaluateAchievements } from "@/lib/domain/achievements";
import type { CravingEvent } from "@/lib/domain/types";

function craving(overrides: Partial<CravingEvent> = {}): CravingEvent {
  return {
    id: "c1",
    userId: "u1",
    quitAttemptId: "qa1",
    createdAt: "2026-01-01T00:00:00.000Z",
    startingIntensity: 5,
    trigger: "stress",
    interventions: [],
    outcome: "resolved",
    ...overrides,
  };
}

describe("evaluateAchievements", () => {
  it("unlocks nothing when stats are all below thresholds", () => {
    const result = evaluateAchievements({
      currentStreakDays: 0,
      lifetimeSmokeFreeDays: 0,
      completedBattleCount: 0,
      moneySaved: 0,
      cigarettesAvoided: 0,
      cravingEvents: [],
      plans: [],
      slips: [],
    });
    expect(result).toEqual([]);
  });

  it("unlocks time-based achievements at threshold", () => {
    const result = evaluateAchievements({
      currentStreakDays: 7,
      lifetimeSmokeFreeDays: 7,
      completedBattleCount: 0,
      moneySaved: 0,
      cigarettesAvoided: 0,
      cravingEvents: [],
      plans: [],
      slips: [],
    });
    expect(result).toContain("time_24h");
    expect(result).toContain("time_3d");
    expect(result).toContain("time_7d");
    expect(result).not.toContain("time_14d");
  });

  it("unlocks battle-count achievements without duplicating across recomputation", () => {
    const a = evaluateAchievements({
      currentStreakDays: 0,
      lifetimeSmokeFreeDays: 0,
      completedBattleCount: 10,
      moneySaved: 0,
      cigarettesAvoided: 0,
      cravingEvents: [],
      plans: [],
      slips: [],
    });
    expect(a).toContain("battles_1");
    expect(a).toContain("battles_10");
    expect(a).not.toContain("battles_25");
    // recomputing with identical input should give identical result (idempotent, no duplicates)
    const b = evaluateAchievements({
      currentStreakDays: 0,
      lifetimeSmokeFreeDays: 0,
      completedBattleCount: 10,
      moneySaved: 0,
      cigarettesAvoided: 0,
      cravingEvents: [],
      plans: [],
      slips: [],
    });
    expect(a).toEqual(b);
  });

  it("unlocks trigger-specific achievements from real resolved craving events", () => {
    const result = evaluateAchievements({
      currentStreakDays: 0,
      lifetimeSmokeFreeDays: 0,
      completedBattleCount: 1,
      moneySaved: 0,
      cigarettesAvoided: 0,
      cravingEvents: [craving({ trigger: "coffee" })],
      plans: [],
      slips: [],
    });
    expect(result).toContain("trigger_coffee_first");
  });

  it("does not unlock stress-strong achievement for low intensity", () => {
    const result = evaluateAchievements({
      currentStreakDays: 0,
      lifetimeSmokeFreeDays: 0,
      completedBattleCount: 1,
      moneySaved: 0,
      cigarettesAvoided: 0,
      cravingEvents: [craving({ trigger: "stress", startingIntensity: 3 })],
      plans: [],
      slips: [],
    });
    expect(result).not.toContain("trigger_stress_strong");
  });
});
