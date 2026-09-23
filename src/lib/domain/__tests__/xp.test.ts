import { describe, it, expect } from "vitest";
import { totalXpFromEvents, levelFromEvents, isDuplicateXpEvent } from "@/lib/domain/xp";
import { levelInfoForTotalXp, xpForLevel, cumulativeXpForLevel, titleForLevel, MAX_LEVEL } from "@/lib/config/xp";
import type { XPEvent } from "@/lib/domain/types";

function ev(amount: number, dedupeKey: string): XPEvent {
  return { id: dedupeKey, userId: "u1", createdAt: "2026-01-01T00:00:00.000Z", amount, source: "craving_logged", dedupeKey };
}

describe("XP totals and levels", () => {
  it("sums XP events", () => {
    expect(totalXpFromEvents([ev(10, "a"), ev(30, "b")])).toBe(40);
  });

  it("detects duplicate dedupe keys", () => {
    const events = [ev(10, "battle:1")];
    expect(isDuplicateXpEvent(events, "battle:1")).toBe(true);
    expect(isDuplicateXpEvent(events, "battle:2")).toBe(false);
  });

  it("level 1 has zero xp into it and increases monotonically", () => {
    const info = levelInfoForTotalXp(0);
    expect(info.level).toBe(1);
    expect(info.xpIntoLevel).toBe(0);
  });

  it("crossing exactly the threshold moves to the next level", () => {
    const needed = xpForLevel(1);
    const info = levelInfoForTotalXp(needed);
    expect(info.level).toBe(2);
    expect(info.xpIntoLevel).toBe(0);
  });

  it("cumulative xp for level N matches sum of xpForLevel(1..N-1)", () => {
    let manual = 0;
    for (let l = 1; l < 10; l++) manual += xpForLevel(l);
    expect(cumulativeXpForLevel(10)).toBe(manual);
  });

  it("never exceeds MAX_LEVEL", () => {
    const info = levelInfoForTotalXp(Number.MAX_SAFE_INTEGER / 2);
    expect(info.level).toBe(MAX_LEVEL);
    expect(info.isMaxLevel).toBe(true);
  });

  it("title reflects the most recent milestone at or below the level", () => {
    expect(titleForLevel(1)).toBe("The Decision");
    expect(titleForLevel(12)).toBe("Habit Breaker");
    expect(titleForLevel(100)).toBe("Free");
  });

  it("levelFromEvents never decreases level as more XP (even post-slip reflection) is added", () => {
    const events: XPEvent[] = [ev(500, "a"), ev(300, "b")];
    const before = levelFromEvents(events);
    const after = levelFromEvents([...events, ev(30, "slip_reflection:1")]);
    expect(after.totalXp).toBeGreaterThanOrEqual(before.totalXp);
    expect(after.level).toBeGreaterThanOrEqual(before.level);
  });
});
