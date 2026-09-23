import { describe, it, expect, beforeEach } from "vitest";
import "fake-indexeddb/auto";
import { QuitQuestDB, __setTestDB } from "@/lib/db/db";
import * as repo from "@/lib/db/repo";
import { clock, nowISO } from "@/lib/time/clock";
import { startCravingBattle, beginIntervention, finishCravingBattle, logSlip, logContextCheckIn } from "@/lib/game/engine";
import type { UserProfile } from "@/lib/domain/types";

let dbCounter = 0;

function baseProfile(overrides: Partial<UserProfile> = {}): UserProfile {
  return {
    id: repo.CURRENT_USER_ID,
    nickname: "Test",
    createdAt: nowISO(),
    smokingStatus: "quit",
    cigarettesPerDayBaseline: 10,
    cigarettesPerPack: 20,
    pricePerPack: 200,
    currency: "USD",
    yearsSmoked: 5,
    minutesToFirstCigarette: 15,
    previousQuitAttempts: 0,
    longestPreviousQuitDays: 0,
    minutesPerSmokingEvent: 6,
    onboardingComplete: true,
    demoMode: false,
    ...overrides,
  };
}

beforeEach(async () => {
  clock.reset();
  __setTestDB(new QuitQuestDB(`test-db-${dbCounter++}`));
  await repo.saveUserProfile(baseProfile());
  await repo.createQuitAttempt(nowISO());
});

describe("engine: situational check-ins", () => {
  it("a resolved craving with the alcohol trigger logs a zero-count check-in but no slip", async () => {
    const event = await startCravingBattle({ startingIntensity: 5, trigger: "alcohol" });
    const result = await beginIntervention(event.id, "water", 5);
    void result;
    await finishCravingBattle(event.id, "resolved");

    const checkIns = await repo.getContextCheckIns();
    expect(checkIns.length).toBe(1);
    expect(checkIns[0].context).toBe("drinking");
    expect(checkIns[0].cigaretteCount).toBe(0);

    const slips = await repo.getAllSlips();
    expect(slips.length).toBe(0);
  });

  it("resolving the same craving twice does not double the check-in or its XP", async () => {
    const event = await startCravingBattle({ startingIntensity: 5, trigger: "cannabis" });
    await finishCravingBattle(event.id, "resolved");
    await finishCravingBattle(event.id, "resolved"); // simulate a duplicate call (e.g. double-click)

    const checkIns = await repo.getContextCheckIns();
    expect(checkIns.length).toBe(1);

    const xp = await repo.getAllXpEvents();
    const checkInXp = xp.filter((e) => e.source === "context_checkin_good");
    expect(checkInXp.length).toBe(1);
  });

  it("logSlip with an alcohol trigger creates exactly one slip and one matching check-in", async () => {
    const result = await logSlip({ cigaretteCount: 2, trigger: "alcohol", learnings: [] });

    const slips = await repo.getAllSlips();
    expect(slips.length).toBe(1);
    expect(slips[0].cigaretteCount).toBe(2);

    const checkIns = await repo.getContextCheckIns();
    expect(checkIns.length).toBe(1);
    expect(checkIns[0].cigaretteCount).toBe(2);
    expect(result.contextCheckInId).toBe(checkIns[0].id);
  });

  it("logContextCheckIn with a positive count creates a real slip so the streak is affected", async () => {
    const result = await logContextCheckIn({ context: "high", cigaretteCount: 3 });

    const slips = await repo.getAllSlips();
    expect(slips.length).toBe(1);
    expect(slips[0].trigger).toBe("cannabis");
    expect(result.slipId).toBe(slips[0].id);

    const checkIns = await repo.getContextCheckIns();
    expect(checkIns.length).toBe(1);
    expect(checkIns[0].context).toBe("high");
  });

  it("logContextCheckIn with a zero count never creates a slip", async () => {
    await logContextCheckIn({ context: "drinking", cigaretteCount: 0 });

    const slips = await repo.getAllSlips();
    expect(slips.length).toBe(0);

    const checkIns = await repo.getContextCheckIns();
    expect(checkIns.length).toBe(1);
    expect(checkIns[0].cigaretteCount).toBe(0);
  });

  it("awards context_checkin_good XP only when at/below the user's own baseline", async () => {
    await repo.saveUserProfile(baseProfile({ cigsWhenDrinkingBaseline: 2 }));

    const worse = await logSlip({ cigaretteCount: 5, trigger: "alcohol", learnings: [] });
    const xpAfterWorse = (await repo.getAllXpEvents()).filter((e) => e.source === "context_checkin_good");
    expect(xpAfterWorse.length).toBe(0);
    void worse;

    const better = await logContextCheckIn({ context: "drinking", cigaretteCount: 1 });
    const xpAfterBetter = (await repo.getAllXpEvents()).filter((e) => e.source === "context_checkin_good");
    expect(xpAfterBetter.length).toBe(1);
    void better;
  });
});
