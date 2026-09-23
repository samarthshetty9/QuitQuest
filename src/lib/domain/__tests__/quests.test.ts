import { describe, it, expect } from "vitest";
import { generateDailyQuests, generateWeeklyQuests } from "@/lib/domain/quests";

describe("quest generation", () => {
  it("generates the same daily quests for the same user+day (deterministic)", () => {
    const a = generateDailyQuests("u1", "2026-01-01");
    const b = generateDailyQuests("u1", "2026-01-01");
    expect(a.map((q) => q.key)).toEqual(b.map((q) => q.key));
  });

  it("generates a different set (usually) for a different day", () => {
    const a = generateDailyQuests("u1", "2026-01-01").map((q) => q.key);
    const b = generateDailyQuests("u1", "2026-01-02").map((q) => q.key);
    expect(a).not.toEqual(b);
  });

  it("returns a small, non-overwhelming number of daily quests", () => {
    const quests = generateDailyQuests("u1", "2026-01-01");
    expect(quests.length).toBeGreaterThan(0);
    expect(quests.length).toBeLessThanOrEqual(5);
  });

  it("generates deterministic weekly quests per week key", () => {
    const a = generateWeeklyQuests("u1", "2026-01-05");
    const b = generateWeeklyQuests("u1", "2026-01-05");
    expect(a.map((q) => q.key)).toEqual(b.map((q) => q.key));
    expect(a.every((q) => q.weekStart === "2026-01-05")).toBe(true);
  });
});
