import { getDB } from "@/lib/db/db";
import { CURRENT_USER_ID } from "@/lib/db/repo";
import { makeId } from "@/lib/domain/id";
import * as repo from "@/lib/db/repo";
import { clock } from "@/lib/time/clock";
import {
  ensureTodayQuests,
  ensureThisWeekQuests,
  syncAchievements,
  syncSmokeFreeDayXp,
} from "@/lib/game/engine";
import type {
  UserProfile,
  QuitAttempt,
  CravingEvent,
  CravingInterventionResult,
  SlipEvent,
  ReasonForQuitting,
  RewardGoal,
  IfThenPlan,
} from "@/lib/domain/types";

function iso(date: Date): string {
  return date.toISOString();
}

function daysAgo(now: Date, days: number, hour: number, minute = 0): Date {
  const d = new Date(now);
  d.setDate(d.getDate() - days);
  d.setHours(hour, minute, 0, 0);
  return d;
}

/**
 * Populates a realistic demo history: a 17-day-old quit attempt, ~28 craving
 * battles across varied triggers/times (including a clean personalization
 * signal for stress: walking outperforms the tap game), one historical slip,
 * plans, and reward goals. Never mixed with a real onboarded profile —
 * callers should confirm with the user before overwriting real data.
 */
export async function loadDemoProfile(): Promise<void> {
  const db = getDB();
  const now = clock.now();
  const quitDate = daysAgo(now, 17, 7, 0);

  const profile: UserProfile = {
    id: CURRENT_USER_ID,
    nickname: "Demo",
    createdAt: iso(quitDate),
    smokingStatus: "quit",
    cigarettesPerDayBaseline: 12,
    cigarettesPerPack: 20,
    pricePerPack: 360,
    currency: "INR",
    yearsSmoked: 8,
    minutesToFirstCigarette: 20,
    previousQuitAttempts: 2,
    longestPreviousQuitDays: 5,
    minutesPerSmokingEvent: 6,
    onboardingComplete: true,
    demoMode: true,
    commonTriggers: ["stress", "coffee", "after_food", "boredom"],
  };

  const attempt: QuitAttempt = {
    id: makeId("qa"),
    userId: CURRENT_USER_ID,
    quitDateTime: iso(quitDate),
    startedAt: iso(quitDate),
    active: true,
  };

  const reasons: ReasonForQuitting[] = [
    { id: makeId("reason"), userId: CURRENT_USER_ID, key: "health", label: "Health" },
    { id: makeId("reason"), userId: CURRENT_USER_ID, key: "money", label: "Money" },
    { id: makeId("reason"), userId: CURRENT_USER_ID, key: "family", label: "Family" },
  ];

  function makeResult(
    cravingEventId: string,
    intervention: CravingInterventionResult["intervention"],
    before: number,
    after: number,
    durationSeconds: number
  ): CravingInterventionResult {
    return {
      id: makeId("iv"),
      cravingEventId,
      intervention,
      startedAt: iso(now),
      completedAt: iso(now),
      durationSeconds,
      intensityBefore: before,
      intensityAfter: after,
    };
  }

  const cravingEvents: CravingEvent[] = [];

  // Personalization demo signal: stress + walk works much better than stress + tap game.
  for (let i = 0; i < 5; i++) {
    const id = makeId("cr");
    const before = 7 + (i % 2);
    const after = 2;
    cravingEvents.push({
      id,
      userId: CURRENT_USER_ID,
      quitAttemptId: attempt.id,
      createdAt: iso(daysAgo(now, 15 - i * 2, 17, 30)),
      startingIntensity: before,
      trigger: "stress",
      interventions: [makeResult(id, "walk_5", before, after, 300)],
      outcome: "resolved",
      effectivenessRating: 5,
    });
  }
  for (let i = 0; i < 5; i++) {
    const id = makeId("cr");
    const before = 7;
    const after = 6;
    cravingEvents.push({
      id,
      userId: CURRENT_USER_ID,
      quitAttemptId: attempt.id,
      createdAt: iso(daysAgo(now, 14 - i * 2, 18, 0)),
      startingIntensity: before,
      trigger: "stress",
      interventions: [makeResult(id, "distraction_tap", before, after, 60)],
      outcome: "resolved",
      effectivenessRating: 2,
    });
  }

  const otherTriggerPlan: Array<{
    trigger: CravingEvent["trigger"];
    hour: number;
    intervention: CravingInterventionResult["intervention"];
    before: number;
    after: number;
  }> = [
    { trigger: "coffee", hour: 8, intervention: "change_environment", before: 5, after: 2 },
    { trigger: "coffee", hour: 8, intervention: "oral_substitute", before: 6, after: 3 },
    { trigger: "after_food", hour: 13, intervention: "walk_5", before: 4, after: 1 },
    { trigger: "after_food", hour: 20, intervention: "move_2", before: 5, after: 2 },
    { trigger: "boredom", hour: 15, intervention: "distraction_memory", before: 4, after: 2 },
    { trigger: "morning", hour: 7, intervention: "breathing_2", before: 6, after: 3 },
    { trigger: "driving", hour: 9, intervention: "delay_5", before: 5, after: 3 },
    { trigger: "work_break", hour: 11, intervention: "walk_5", before: 4, after: 2 },
    { trigger: "late_night", hour: 23, intervention: "urge_surf", before: 6, after: 3 },
    { trigger: "alcohol", hour: 22, intervention: "change_environment", before: 8, after: 4 },
    { trigger: "parties", hour: 21, intervention: "social_support", before: 7, after: 3 },
    { trigger: "other_smokers", hour: 12, intervention: "talk_back", before: 5, after: 2 },
  ];

  otherTriggerPlan.forEach((p, i) => {
    const id = makeId("cr");
    cravingEvents.push({
      id,
      userId: CURRENT_USER_ID,
      quitAttemptId: attempt.id,
      createdAt: iso(daysAgo(now, (i % 16) + 1, p.hour)),
      startingIntensity: p.before,
      trigger: p.trigger,
      interventions: [makeResult(id, p.intervention, p.before, p.after, 180)],
      outcome: "resolved",
      effectivenessRating: 4,
    });
  });

  // One in-progress chained battle: breathing didn't fully work, walk finished it.
  {
    const id = makeId("cr");
    const r1 = makeResult(id, "breathing_2", 9, 8, 120);
    const r2 = makeResult(id, "walk_5", 8, 3, 300);
    cravingEvents.push({
      id,
      userId: CURRENT_USER_ID,
      quitAttemptId: attempt.id,
      createdAt: iso(daysAgo(now, 3, 16, 0)),
      startingIntensity: 9,
      trigger: "stress",
      interventions: [r1, r2],
      outcome: "resolved",
      effectivenessRating: 4,
    });
  }

  // One historical slip, ~10 days ago.
  const slip: SlipEvent = {
    id: makeId("sl"),
    userId: CURRENT_USER_ID,
    quitAttemptId: attempt.id,
    occurredAt: iso(daysAgo(now, 10, 22, 30)),
    cigaretteCount: 2,
    trigger: "alcohol",
    context: "Friend's birthday, had a couple of drinks",
    cravingIntensity: 8,
    learnings: ["social_pressure", "alcohol"],
    note: "Didn't plan ahead for the party.",
  };

  const rewardGoals: RewardGoal[] = [
    { id: makeId("rw"), userId: CURRENT_USER_ID, title: "Wireless Headphones", emoji: "🎧", targetCost: 3000, priority: 1, createdAt: iso(quitDate) },
    { id: makeId("rw"), userId: CURRENT_USER_ID, title: "Weekend Trip", emoji: "🏖️", targetCost: 20000, priority: 2, createdAt: iso(quitDate) },
  ];

  const plans: IfThenPlan[] = [
    {
      id: makeId("pl"),
      userId: CURRENT_USER_ID,
      trigger: "coffee",
      ifText: "I want a cigarette with coffee",
      thenText: "I'll drink it somewhere different and chew gum.",
      createdAt: iso(quitDate),
      active: true,
      timesSurfaced: 0,
      timesHelped: 0,
    },
    {
      id: makeId("pl"),
      userId: CURRENT_USER_ID,
      trigger: "parties",
      ifText: "I'm going out drinking",
      thenText: "I'll tell one friend beforehand that I've quit.",
      createdAt: iso(quitDate),
      active: true,
      timesSurfaced: 0,
      timesHelped: 0,
    },
  ];

  await db.transaction(
    "rw",
    [
      db.userProfile,
      db.quitAttempts,
      db.cravingEvents,
      db.slipEvents,
      db.reasonsForQuitting,
      db.rewardGoals,
      db.ifThenPlans,
      db.futureSelfMessages,
      db.copingPreferences,
      db.appSettings,
    ],
    async () => {
      await db.userProfile.put(profile);
      await db.quitAttempts.put(attempt);
      await db.cravingEvents.bulkPut(cravingEvents);
      await db.slipEvents.put(slip);
      await db.reasonsForQuitting.bulkPut(reasons);
      await db.rewardGoals.bulkPut(rewardGoals);
      await db.ifThenPlans.bulkPut(plans);
      await db.futureSelfMessages.put({
        userId: CURRENT_USER_ID,
        message: "you fought hard to get here, and one cigarette doesn't undo that",
        updatedAt: iso(quitDate),
      });
      await db.copingPreferences.put({
        userId: CURRENT_USER_ID,
        favoriteInterventions: ["water", "breathing_2", "walk_5", "urge_surf", "why_i_quit"],
        talkBackResponses: [],
      });
      await db.appSettings.put({
        userId: CURRENT_USER_ID,
        theme: "system",
        reducedMotion: false,
        notificationsEnabled: false,
        currency: "INR",
        demoMode: true,
      });
    }
  );

  // Backfill XP for every seeded event, timestamped on the event's own
  // historical date — not "now" — so daily anti-farming caps apply per
  // historical day instead of all colliding on today's real date.
  for (const e of cravingEvents) {
    await repo.awardXp("craving_logged", `craving_logged:${e.id}`, undefined, undefined, e.createdAt);
    for (const r of e.interventions) {
      await repo.awardXp("coping_action_completed", `coping:${r.id}`, undefined, undefined, e.createdAt);
    }
    if (e.outcome === "resolved") {
      await repo.awardXp("craving_battle_completed", `battle:${e.id}`, undefined, undefined, e.createdAt);
      if (e.startingIntensity >= 7) {
        await repo.awardXp("high_intensity_craving_passed", `battle_bonus:${e.id}`, undefined, undefined, e.createdAt);
      }
    }
  }
  await repo.awardXp("slip_reflection", `slip_reflection:${slip.id}`, undefined, undefined, slip.occurredAt);
  for (const p of plans) {
    await repo.awardXp("if_then_plan_created", `plan:${p.id}`, undefined, undefined, p.createdAt);
  }

  await syncSmokeFreeDayXp();
  await ensureTodayQuests();
  await ensureThisWeekQuests();
  await syncAchievements();
}

export async function resetToFreshInstall(): Promise<void> {
  await repo.resetAllData();
}
