import { describe, it, expect } from "vitest";
import { generateInsights, MIN_EVENTS_FOR_INSIGHT } from "@/lib/domain/insights";
import type { CravingEvent } from "@/lib/domain/types";

function craving(hourUTC: number, trigger: CravingEvent["trigger"], dayOffset = 0): CravingEvent {
  const d = new Date(Date.UTC(2026, 0, 1 + dayOffset, hourUTC, 0, 0));
  return {
    id: `c${Math.random()}`,
    userId: "u1",
    quitAttemptId: "qa1",
    createdAt: d.toISOString(),
    startingIntensity: 6,
    trigger,
    interventions: [],
    outcome: "resolved",
  };
}

describe("generateInsights", () => {
  it("generates nothing below the minimum sample size", () => {
    const events = Array.from({ length: MIN_EVENTS_FOR_INSIGHT - 1 }, (_, i) => craving(18, "stress", i));
    const insights = generateInsights(events, new Date("2026-02-01T00:00:00.000Z"));
    expect(insights).toEqual([]);
  });

  it("identifies a dominant trigger once enough samples exist", () => {
    const events = [
      ...Array.from({ length: 5 }, (_, i) => craving(18, "stress", i)),
      craving(10, "coffee", 10),
    ];
    const insights = generateInsights(events, new Date("2026-02-01T00:00:00.000Z"));
    expect(insights.some((i) => i.key === "top_trigger" && i.text.includes("Stress"))).toBe(true);
  });

  it("does not fabricate a pattern from a single event", () => {
    const events = [craving(18, "stress")];
    const insights = generateInsights(events, new Date("2026-02-01T00:00:00.000Z"));
    expect(insights).toEqual([]);
  });
});
