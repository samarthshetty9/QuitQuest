import { describe, it, expect } from "vitest";
import { calculateMoneySaved, calculateCigarettesAvoided, calculateTimeSavedMinutes } from "@/lib/domain/calculations";

const baseProfile = { cigarettesPerDayBaseline: 10, cigarettesPerPack: 20, pricePerPack: 200 };

describe("calculateMoneySaved", () => {
  it("computes baseline savings over a full number of days", () => {
    const quitDateTimeISO = new Date("2026-01-01T00:00:00.000Z").toISOString();
    const now = new Date("2026-01-11T00:00:00.000Z"); // 10 days elapsed
    const result = calculateMoneySaved({ profile: baseProfile, quitDateTimeISO, now, slips: [] });
    // dailyCost = (10/20)*200 = 100; 10 days => 1000
    expect(result.dailySmokingCost).toBeCloseTo(100);
    expect(result.moneySaved).toBeCloseTo(1000);
  });

  it("handles partial days proportionally", () => {
    const quitDateTimeISO = new Date("2026-01-01T00:00:00.000Z").toISOString();
    const now = new Date("2026-01-01T12:00:00.000Z"); // 0.5 days
    const result = calculateMoneySaved({ profile: baseProfile, quitDateTimeISO, now, slips: [] });
    expect(result.moneySaved).toBeCloseTo(50);
  });

  it("respects different pack sizes", () => {
    const quitDateTimeISO = new Date("2026-01-01T00:00:00.000Z").toISOString();
    const now = new Date("2026-01-02T00:00:00.000Z"); // 1 day
    const result = calculateMoneySaved({
      profile: { cigarettesPerDayBaseline: 20, cigarettesPerPack: 10, pricePerPack: 100 },
      quitDateTimeISO,
      now,
      slips: [],
    });
    // dailyCost = (20/10)*100 = 200
    expect(result.moneySaved).toBeCloseTo(200);
  });

  it("subtracts money actually spent on slip cigarettes", () => {
    const quitDateTimeISO = new Date("2026-01-01T00:00:00.000Z").toISOString();
    const now = new Date("2026-01-11T00:00:00.000Z"); // 10 days, expected 1000
    const result = calculateMoneySaved({
      profile: baseProfile,
      quitDateTimeISO,
      now,
      slips: [{ cigaretteCount: 5 }], // 5 * 10/cig = 50
    });
    expect(result.moneySaved).toBeCloseTo(950);
  });

  it("never returns negative savings even with heavy slips", () => {
    const quitDateTimeISO = new Date("2026-01-01T00:00:00.000Z").toISOString();
    const now = new Date("2026-01-01T01:00:00.000Z");
    const result = calculateMoneySaved({
      profile: baseProfile,
      quitDateTimeISO,
      now,
      slips: [{ cigaretteCount: 500 }],
    });
    expect(result.moneySaved).toBe(0);
  });

  it("handles zero/invalid profile values without throwing", () => {
    const quitDateTimeISO = new Date("2026-01-01T00:00:00.000Z").toISOString();
    const now = new Date("2026-01-02T00:00:00.000Z");
    const result = calculateMoneySaved({
      profile: { cigarettesPerDayBaseline: 0, cigarettesPerPack: 0, pricePerPack: 0 },
      quitDateTimeISO,
      now,
      slips: [],
    });
    expect(result.moneySaved).toBe(0);
    expect(Number.isFinite(result.dailySmokingCost)).toBe(true);
  });
});

describe("calculateCigarettesAvoided", () => {
  it("computes expected count based on elapsed time", () => {
    const quitDateTimeISO = new Date("2026-01-01T00:00:00.000Z").toISOString();
    const now = new Date("2026-01-11T00:00:00.000Z");
    const result = calculateCigarettesAvoided({ profile: baseProfile, quitDateTimeISO, now, slips: [] });
    expect(result.cigarettesAvoided).toBeCloseTo(100);
  });

  it("adjusts for slip cigarettes actually smoked", () => {
    const quitDateTimeISO = new Date("2026-01-01T00:00:00.000Z").toISOString();
    const now = new Date("2026-01-11T00:00:00.000Z"); // expected 100
    const result = calculateCigarettesAvoided({
      profile: baseProfile,
      quitDateTimeISO,
      now,
      slips: [{ cigaretteCount: 30 }],
    });
    expect(result.cigarettesAvoided).toBeCloseTo(70);
  });

  it("never goes negative", () => {
    const quitDateTimeISO = new Date("2026-01-01T00:00:00.000Z").toISOString();
    const now = new Date("2026-01-01T06:00:00.000Z"); // 0.25 day => expected 2.5
    const result = calculateCigarettesAvoided({
      profile: baseProfile,
      quitDateTimeISO,
      now,
      slips: [{ cigaretteCount: 50 }],
    });
    expect(result.cigarettesAvoided).toBe(0);
  });
});

describe("calculateTimeSavedMinutes", () => {
  it("uses the user's own reported minutes per cigarette", () => {
    expect(calculateTimeSavedMinutes({ cigarettesAvoided: 100, minutesPerSmokingEvent: 6 })).toBe(600);
  });

  it("never negative", () => {
    expect(calculateTimeSavedMinutes({ cigarettesAvoided: -5, minutesPerSmokingEvent: 6 })).toBe(0);
  });
});
