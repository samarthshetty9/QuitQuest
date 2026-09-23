import { describe, it, expect } from "vitest";
import { computeStreaks } from "@/lib/domain/streak";
import type { QuitAttempt, SlipEvent } from "@/lib/domain/types";

function attempt(overrides: Partial<QuitAttempt> = {}): QuitAttempt {
  return {
    id: "qa1",
    userId: "u1",
    quitDateTime: "2026-01-01T00:00:00.000Z",
    startedAt: "2026-01-01T00:00:00.000Z",
    active: true,
    ...overrides,
  };
}

describe("computeStreaks", () => {
  it("computes current streak with no slips", () => {
    const now = new Date("2026-01-11T00:00:00.000Z"); // 10 days
    const result = computeStreaks({ attempts: [attempt()], slips: [], now });
    expect(Math.floor(result.currentStreakDays)).toBe(10);
    expect(Math.floor(result.bestStreakDays)).toBe(10);
    expect(result.totalSlips).toBe(0);
  });

  it("resets current streak after one slip but preserves best streak from before it", () => {
    const now = new Date("2026-01-21T00:00:00.000Z"); // 20 days total
    const slip: SlipEvent = {
      id: "s1",
      userId: "u1",
      quitAttemptId: "qa1",
      occurredAt: "2026-01-16T00:00:00.000Z", // slip on day 15, current streak since then = 5 days
      cigaretteCount: 1,
      trigger: "stress",
      learnings: [],
    };
    const result = computeStreaks({ attempts: [attempt()], slips: [slip], now });
    expect(Math.floor(result.currentStreakDays)).toBe(5);
    expect(Math.floor(result.bestStreakDays)).toBe(15);
    expect(result.totalSlips).toBe(1);
  });

  it("handles multiple slips, tracking best streak across all segments", () => {
    const now = new Date("2026-02-01T00:00:00.000Z");
    const slips: SlipEvent[] = [
      {
        id: "s1",
        userId: "u1",
        quitAttemptId: "qa1",
        occurredAt: "2026-01-05T00:00:00.000Z", // segment 1: 4 days
        cigaretteCount: 1,
        trigger: "stress",
        learnings: [],
      },
      {
        id: "s2",
        userId: "u1",
        quitAttemptId: "qa1",
        occurredAt: "2026-01-10T00:00:00.000Z", // segment 2: 5 days
        cigaretteCount: 2,
        trigger: "alcohol",
        learnings: [],
      },
    ];
    // segment 3: Jan 10 -> Feb 1 = 22 days (current, and best)
    const result = computeStreaks({ attempts: [attempt()], slips, now });
    expect(Math.floor(result.bestStreakDays)).toBe(22);
    expect(Math.floor(result.currentStreakDays)).toBe(22);
    expect(result.totalSlips).toBe(2);
  });

  it("handles a same-day slip correctly (current streak near zero)", () => {
    const now = new Date("2026-01-05T18:00:00.000Z");
    const slip: SlipEvent = {
      id: "s1",
      userId: "u1",
      quitAttemptId: "qa1",
      occurredAt: "2026-01-05T12:00:00.000Z",
      cigaretteCount: 1,
      trigger: "boredom",
      learnings: [],
    };
    const result = computeStreaks({ attempts: [attempt()], slips: [slip], now });
    expect(result.currentStreakDays).toBeCloseTo(0.25, 1);
  });

  it("computes lifetime smoke-free days excluding only the calendar days a slip occurred on", () => {
    const now = new Date("2026-01-11T00:00:00.000Z"); // 10 days elapsed, 11 calendar days tracked
    const slip: SlipEvent = {
      id: "s1",
      userId: "u1",
      quitAttemptId: "qa1",
      occurredAt: "2026-01-05T00:00:00.000Z",
      cigaretteCount: 1,
      trigger: "stress",
      learnings: [],
    };
    const result = computeStreaks({ attempts: [attempt()], slips: [slip], now });
    expect(result.lifetimeSmokeFreeDays).toBe(10); // 11 tracked days - 1 slip day
  });

  it("ignores attempts whose quit date is in the future", () => {
    const now = new Date("2026-01-01T00:00:00.000Z");
    const future = attempt({ quitDateTime: "2026-06-01T00:00:00.000Z" });
    const result = computeStreaks({ attempts: [future], slips: [], now });
    expect(result.currentStreakDays).toBe(0);
    expect(result.totalDaysTracked).toBe(0);
  });
});
