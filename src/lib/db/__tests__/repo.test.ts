import { describe, it, expect, beforeEach } from "vitest";
import "fake-indexeddb/auto";
import { QuitQuestDB, __setTestDB } from "@/lib/db/db";
import * as repo from "@/lib/db/repo";
import { clock } from "@/lib/time/clock";

let dbCounter = 0;

beforeEach(() => {
  clock.reset();
  __setTestDB(new QuitQuestDB(`test-db-${dbCounter++}`));
});

describe("repo: XP dedupe", () => {
  it("awards XP once for a dedupe key even when called twice", async () => {
    const first = await repo.awardXp("craving_logged", "craving_logged:c1");
    const second = await repo.awardXp("craving_logged", "craving_logged:c1");
    expect(first).not.toBeNull();
    expect(second).toBeNull();
    const events = await repo.getAllXpEvents();
    expect(events.length).toBe(1);
  });

  it("caps repetitive coping-action XP per day to prevent farming", async () => {
    for (let i = 0; i < 12; i++) {
      await repo.awardXp("coping_action_completed", `coping:${i}`);
    }
    const events = await repo.getAllXpEvents();
    const copingEvents = events.filter((e) => e.source === "coping_action_completed");
    expect(copingEvents.length).toBeLessThanOrEqual(8);
  });
});

describe("repo: quests", () => {
  it("prevents completing the same quest twice", async () => {
    await repo.putQuests([
      {
        id: "q1",
        userId: repo.CURRENT_USER_ID,
        date: "2026-01-01",
        scope: "daily",
        key: "stay_smoke_free_today",
        title: "Stay smoke-free today",
        description: "",
        xpReward: 30,
        completed: false,
      },
    ]);
    await repo.completeQuest("q1");
    await repo.awardXp("daily_quest", "quest:q1", 30);
    await repo.awardXp("daily_quest", "quest:q1", 30); // simulate a duplicate completion call
    const events = await repo.getAllXpEvents();
    expect(events.filter((e) => e.dedupeKey === "quest:q1").length).toBe(1);
  });
});

describe("repo: export/import round trip", () => {
  it("restores profile, XP, and rewards exactly after export then import", async () => {
    await repo.saveUserProfile({
      id: repo.CURRENT_USER_ID,
      nickname: "Sam",
      createdAt: "2026-01-01T00:00:00.000Z",
      smokingStatus: "quit",
      cigarettesPerDayBaseline: 10,
      cigarettesPerPack: 20,
      pricePerPack: 200,
      currency: "INR",
      yearsSmoked: 5,
      minutesToFirstCigarette: 30,
      previousQuitAttempts: 1,
      longestPreviousQuitDays: 10,
      minutesPerSmokingEvent: 6,
      onboardingComplete: true,
      demoMode: false,
    });
    await repo.awardXp("smoke_free_day", "smoke_free_day:2026-01-01");
    await repo.createRewardGoal({ title: "Headphones", emoji: "🎧", targetCost: 5000, priority: 1 });

    const exported = await repo.exportAllData();
    await repo.resetAllData();
    expect(await repo.getUserProfile()).toBeUndefined();

    await repo.importAllData(exported);

    const profile = await repo.getUserProfile();
    const xp = await repo.getAllXpEvents();
    const goals = await repo.getRewardGoals();

    expect(profile?.nickname).toBe("Sam");
    expect(xp.length).toBe(1);
    expect(goals.length).toBe(1);
    expect(goals[0].title).toBe("Headphones");
  });

  it("handles an import with unknown/missing tables gracefully (older schema)", async () => {
    await expect(
      repo.importAllData({ schemaVersion: 0, exportedAt: "2026-01-01", tables: {} })
    ).resolves.not.toThrow();
  });
});
