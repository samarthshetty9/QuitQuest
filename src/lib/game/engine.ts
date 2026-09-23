import { format, startOfWeek } from "date-fns";
import * as repo from "@/lib/db/repo";
import { makeId } from "@/lib/domain/id";
import { nowISO, now as clockNow } from "@/lib/time/clock";
import { generateDailyQuests, generateWeeklyQuests } from "@/lib/domain/quests";
import { evaluateAchievements } from "@/lib/domain/achievements";
import { computeStreaks } from "@/lib/domain/streak";
import { calculateMoneySaved, calculateCigarettesAvoided } from "@/lib/domain/calculations";
import { compareToContextBaseline, isGoodContextOutcome } from "@/lib/domain/situational";
import { ACHIEVEMENTS } from "@/lib/config/achievements";
import { allBosses } from "@/lib/config/chapters";
import type {
  CravingEvent,
  CravingInterventionResult,
  InterventionKey,
  TriggerKey,
  SlipLearningTag,
  RewardGoal,
  SituationalContext,
  ContextCheckIn,
} from "@/lib/domain/types";

// A craving/slip trigger that maps onto a situational context we track a baseline for.
const TRIGGER_TO_CONTEXT: Partial<Record<TriggerKey, SituationalContext>> = {
  alcohol: "drinking",
  cannabis: "high",
};

function baselineForContext(
  profile: { cigsWhenDrinkingBaseline?: number | null; cigsWhenHighBaseline?: number | null } | undefined,
  context: SituationalContext
): number | null | undefined {
  if (!profile) return undefined;
  return context === "drinking" ? profile.cigsWhenDrinkingBaseline : profile.cigsWhenHighBaseline;
}

/**
 * Records a situational check-in and awards a small, capped XP bonus when the
 * count is at/below the user's own baseline.
 *
 * `sourceKey` must identify the real-world event this check-in represents
 * (e.g. `battle:${cravingEventId}` or `slip:${slipId}`), not a freshly
 * generated id — otherwise a retry/double-click (the craving-resolved and
 * slip hooks below aren't guarded against that at the UI layer) would create
 * a new check-in and a new XP award every time. Using it as the check-in's
 * own id makes the write idempotent (repo.createContextCheckIn upserts), and
 * as the XP dedupe key keeps XP awards idempotent per the same invariant the
 * rest of the app's XP sources follow.
 */
async function recordContextCheckIn(
  context: SituationalContext,
  cigaretteCount: number,
  sourceKey: string
): Promise<{ checkIn: ContextCheckIn; xpAwarded: number }> {
  const checkIn = await repo.createContextCheckIn({ id: `ctx_${sourceKey}`, context, cigaretteCount });
  const profile = await repo.getUserProfile();
  const comparison = compareToContextBaseline(cigaretteCount, baselineForContext(profile, context));
  let xpAwarded = 0;
  if (isGoodContextOutcome(comparison)) {
    const xp = await repo.awardXp("context_checkin_good", `context_checkin:${sourceKey}`);
    if (xp) xpAwarded = xp.amount;
  }
  return { checkIn, xpAwarded };
}

export const dateKey = (d: Date) => format(d, "yyyy-MM-dd");
export const weekKey = (d: Date) => format(startOfWeek(d, { weekStartsOn: 1 }), "yyyy-MM-dd");

// ---------- Quests ----------

// Quest IDs are deterministic (not random) so that a duplicate generation
// call — e.g. two concurrent app-boot syncs — upserts the same rows instead
// of inserting duplicates. This makes ensureTodayQuests/ensureThisWeekQuests
// safe to call more than once.

export async function ensureTodayQuests(): Promise<void> {
  const today = dateKey(clockNow());
  const existing = await repo.getQuestsForDate(today);
  if (existing.length > 0) return;
  const generated = generateDailyQuests(repo.CURRENT_USER_ID, today);
  await repo.putQuests(
    generated.map((q) => ({ ...q, id: `q_${repo.CURRENT_USER_ID}_${today}_${q.key}`, completed: false }))
  );
}

export async function ensureThisWeekQuests(): Promise<void> {
  const wk = weekKey(clockNow());
  const existing = await repo.getQuestsForWeek(wk);
  if (existing.length > 0) return;
  const generated = generateWeeklyQuests(repo.CURRENT_USER_ID, wk);
  await repo.putQuests(
    generated.map((q) => ({ ...q, id: `q_${repo.CURRENT_USER_ID}_${wk}_${q.key}`, completed: false }))
  );
}

/** Awards the smoke-free-day XP for each fully-completed past day with no slip. Idempotent via dedupe key. */
export async function syncSmokeFreeDayXp(): Promise<void> {
  const attempt = await repo.getActiveQuitAttempt();
  if (!attempt) return;
  const start = new Date(attempt.quitDateTime);
  const today = clockNow();
  if (start > today) return; // preparation mode

  const slips = await repo.getAllSlips();
  const slipDayKeys = new Set(slips.map((s) => dateKey(new Date(s.occurredAt))));

  const cursor = new Date(start);
  cursor.setHours(0, 0, 0, 0);
  const todayKey = dateKey(today);

  let guard = 0;
  while (dateKey(cursor) < todayKey && guard < 3650) {
    const key = dateKey(cursor);
    if (!slipDayKeys.has(key)) {
      await repo.awardXp("smoke_free_day", `smoke_free_day:${key}`);
    }
    cursor.setDate(cursor.getDate() + 1);
    guard++;
  }
}

export async function completeQuestAction(questId: string): Promise<void> {
  const quests = await repo.getAllQuests();
  const quest = quests.find((q) => q.id === questId);
  if (!quest || quest.completed) return;
  await repo.completeQuest(questId);
  await repo.awardXp(
    quest.scope === "daily" ? "daily_quest" : "weekly_quest",
    `quest:${questId}`,
    quest.xpReward
  );
  await syncAchievements();
}

// ---------- Craving battle ----------

export async function startCravingBattle(input: {
  startingIntensity: number;
  trigger: TriggerKey;
  customTriggerLabel?: string;
  location?: CravingEvent["location"];
}): Promise<CravingEvent> {
  let attempt = await repo.getActiveQuitAttempt();
  if (!attempt) {
    attempt = await repo.createQuitAttempt(nowISO());
  }
  const priorEvents = await repo.getAllCravingEvents();
  const isNewTrigger = !priorEvents.some((e) => e.trigger === input.trigger);

  const event = await repo.createCravingEvent({
    quitAttemptId: attempt.id,
    startingIntensity: input.startingIntensity,
    trigger: input.trigger,
    customTriggerLabel: input.customTriggerLabel,
    location: input.location,
  });
  await repo.awardXp("craving_logged", `craving_logged:${event.id}`);
  if (isNewTrigger) {
    await repo.awardXp("new_trigger_identified", `new_trigger:${input.trigger}`);
  }
  return event;
}

export async function beginIntervention(
  cravingEventId: string,
  intervention: InterventionKey,
  intensityBefore: number
): Promise<CravingInterventionResult> {
  const result: CravingInterventionResult = {
    id: makeId("iv"),
    cravingEventId,
    intervention,
    startedAt: nowISO(),
    intensityBefore,
  };
  await repo.addInterventionResult(cravingEventId, result);
  return result;
}

export async function completeIntervention(
  cravingEventId: string,
  resultId: string,
  intensityAfter: number,
  durationSeconds: number
): Promise<void> {
  await repo.updateInterventionResult(cravingEventId, resultId, {
    completedAt: nowISO(),
    intensityAfter,
    durationSeconds,
  });
  await repo.awardXp("coping_action_completed", `coping:${resultId}`);
}

export async function skipIntervention(cravingEventId: string, resultId: string): Promise<void> {
  await repo.updateInterventionResult(cravingEventId, resultId, { skipped: true, completedAt: nowISO() });
}

export interface FinishBattleResult {
  event: CravingEvent;
  xpAwarded: number;
  newlyUnlocked: string[];
  newlyCompletedBosses: string[];
}

export async function finishCravingBattle(
  cravingEventId: string,
  outcome: "resolved" | "smoked" | "abandoned",
  effectivenessRating?: number
): Promise<FinishBattleResult> {
  const events = await repo.getAllCravingEvents();
  const event = events.find((e) => e.id === cravingEventId);
  if (!event) throw new Error("Craving event not found");

  const lastResult = [...event.interventions].reverse().find((r) => typeof r.intensityAfter === "number");
  const endingIntensity = lastResult?.intensityAfter ?? event.startingIntensity;

  await repo.updateCravingEvent(cravingEventId, { outcome, endingIntensity, effectivenessRating });

  let xpAwarded = 0;
  if (outcome === "resolved") {
    const battleXp = await repo.awardXp("craving_battle_completed", `battle:${cravingEventId}`);
    if (battleXp) xpAwarded += battleXp.amount;
    if (event.startingIntensity >= 7) {
      const bonus = await repo.awardXp("high_intensity_craving_passed", `battle_bonus:${cravingEventId}`);
      if (bonus) xpAwarded += bonus.amount;
    }
    const context = TRIGGER_TO_CONTEXT[event.trigger];
    if (context) {
      const { xpAwarded: checkInXp } = await recordContextCheckIn(context, 0, `battle:${cravingEventId}`);
      xpAwarded += checkInXp;
    }
  }

  const newlyUnlocked = await syncAchievements();
  const newlyCompletedBosses = await computeEligibleBosses();

  const updated = (await repo.getAllCravingEvents()).find((e) => e.id === cravingEventId)!;
  return { event: updated, xpAwarded, newlyUnlocked, newlyCompletedBosses };
}

// ---------- Slip / relapse ----------

export interface LogSlipResult {
  slipId: string;
  xpAwarded: number;
  contextCheckInId?: string;
}

export async function logSlip(input: {
  cigaretteCount: number;
  trigger: TriggerKey;
  customTriggerLabel?: string;
  cravingIntensity?: number;
  context?: string;
  learnings: SlipLearningTag[];
  note?: string;
}): Promise<LogSlipResult> {
  let attempt = await repo.getActiveQuitAttempt();
  if (!attempt) attempt = await repo.createQuitAttempt(nowISO());

  const slip = await repo.createSlip({
    quitAttemptId: attempt.id,
    occurredAt: nowISO(),
    cigaretteCount: input.cigaretteCount,
    trigger: input.trigger,
    customTriggerLabel: input.customTriggerLabel,
    cravingIntensity: input.cravingIntensity,
    context: input.context,
    learnings: input.learnings,
    note: input.note,
  });

  let xpAwarded = 0;
  if (input.learnings.length > 0) {
    const xp = await repo.awardXp("slip_reflection", `slip_reflection:${slip.id}`);
    if (xp) xpAwarded += xp.amount;
  }

  const context = TRIGGER_TO_CONTEXT[input.trigger];
  let contextCheckInId: string | undefined;
  if (context) {
    const { checkIn, xpAwarded: checkInXp } = await recordContextCheckIn(context, input.cigaretteCount, `slip:${slip.id}`);
    contextCheckInId = checkIn.id;
    xpAwarded += checkInXp;
  }

  await syncAchievements();

  return { slipId: slip.id, xpAwarded, contextCheckInId };
}

// ---------- Situational context check-ins (standalone quick-log) ----------

export interface LogContextCheckInResult {
  checkInId: string;
  slipId?: string;
  xpAwarded: number;
}

/**
 * Standalone "I'm drinking / I'm high, here's how many I smoked" quick log,
 * independent of the craving-battle flow. If cigarettes were actually
 * smoked, this also creates a real SlipEvent so streak/lifetime stats stay
 * correct — a ContextCheckIn on its own never affects the streak.
 */
export async function logContextCheckIn(input: {
  context: SituationalContext;
  cigaretteCount: number;
  note?: string;
}): Promise<LogContextCheckInResult> {
  const count = Math.max(0, Math.round(input.cigaretteCount));

  if (count > 0) {
    const trigger: TriggerKey = input.context === "drinking" ? "alcohol" : "cannabis";
    const slipResult = await logSlip({
      cigaretteCount: count,
      trigger,
      context: input.context === "drinking" ? "Logged from a drinking session" : "Logged from a high session",
      learnings: [],
      note: input.note,
    });
    return { checkInId: slipResult.contextCheckInId ?? "", slipId: slipResult.slipId, xpAwarded: slipResult.xpAwarded };
  }

  const { checkIn, xpAwarded } = await recordContextCheckIn(input.context, 0, `checkin:${makeId("log")}`);
  return { checkInId: checkIn.id, xpAwarded };
}

// ---------- IF-THEN plans ----------

export async function createPlanAction(input: {
  trigger: TriggerKey;
  customTriggerLabel?: string;
  ifText: string;
  thenText: string;
}): Promise<void> {
  const plan = await repo.createIfThenPlan({ ...input, active: true });
  await repo.awardXp("if_then_plan_created", `plan:${plan.id}`);
  await syncAchievements();
}

// ---------- Reward goals ----------

export async function addRewardGoalAction(
  input: Omit<RewardGoal, "id" | "userId" | "createdAt" | "unlockedAt">
): Promise<void> {
  await repo.createRewardGoal(input);
}

export async function syncRewardGoalUnlocks(moneySaved: number): Promise<string[]> {
  const goals = await repo.getRewardGoals();
  const newlyUnlocked: string[] = [];
  for (const g of goals) {
    if (!g.unlockedAt && moneySaved >= g.targetCost) {
      await repo.updateRewardGoal(g.id, { unlockedAt: nowISO() });
      newlyUnlocked.push(g.id);
    }
  }
  return newlyUnlocked;
}

// ---------- Achievements ----------

export async function syncAchievements(): Promise<string[]> {
  const [profile, attempt, allAttempts, cravingEvents, slips, plans, xpEvents] = await Promise.all([
    repo.getUserProfile(),
    repo.getActiveQuitAttempt(),
    repo.getAllQuitAttempts(),
    repo.getAllCravingEvents(),
    repo.getAllSlips(),
    repo.getIfThenPlans(),
    repo.getAllXpEvents(),
  ]);
  if (!profile) return [];

  const now = clockNow();
  const streaks = computeStreaks({ attempts: allAttempts, slips, now });
  const money = attempt
    ? calculateMoneySaved({ profile, quitDateTimeISO: attempt.quitDateTime, now, slips })
    : { moneySaved: 0 };
  const cigs = attempt
    ? calculateCigarettesAvoided({ profile, quitDateTimeISO: attempt.quitDateTime, now, slips })
    : { cigarettesAvoided: 0 };

  const shouldUnlock = evaluateAchievements({
    currentStreakDays: Math.floor(streaks.currentStreakDays),
    lifetimeSmokeFreeDays: Math.floor(streaks.lifetimeSmokeFreeDays),
    completedBattleCount: cravingEvents.filter((e) => e.outcome === "resolved").length,
    moneySaved: money.moneySaved,
    cigarettesAvoided: Math.floor(cigs.cigarettesAvoided),
    cravingEvents,
    plans,
    slips,
  });

  const already = await repo.getUnlockedAchievements();
  const alreadyKeys = new Set(already.map((a) => a.achievementKey));
  const newlyUnlocked: string[] = [];

  for (const key of shouldUnlock) {
    if (alreadyKeys.has(key)) continue;
    const unlock = await repo.unlockAchievement(key);
    if (unlock) {
      newlyUnlocked.push(key);
      const def = ACHIEVEMENTS.find((a) => a.key === key);
      if (def?.xpReward) {
        await repo.awardXp("achievement_unlocked", `achievement:${key}`, def.xpReward);
      }
    }
  }

  void xpEvents;
  return newlyUnlocked;
}

// ---------- Bosses ----------
// Eligibility is derived automatically from real logged craving outcomes.
// Actually marking a boss "defeated" still requires the user to explicitly
// report the real-world outcome via reportBossOutcome — nothing here
// fabricates a completion on its own.

export async function computeEligibleBosses(): Promise<string[]> {
  const cravingEvents = await repo.getAllCravingEvents();
  const resolved = cravingEvents.filter((e) => e.outcome === "resolved");
  const eligible: string[] = [];

  for (const boss of allBosses()) {
    if (boss.key === "morning_autopilot" && resolved.some((e) => e.trigger === "morning")) {
      eligible.push(boss.key);
    }
    if (boss.key === "coffee_trigger" && resolved.some((e) => e.trigger === "coffee")) {
      eligible.push(boss.key);
    }
    if (boss.key === "after_meal_trigger" && resolved.filter((e) => e.trigger === "after_food").length >= 3) {
      eligible.push(boss.key);
    }
    if (
      boss.key === "stress_test" &&
      resolved.some((e) => e.trigger === "stress" && e.startingIntensity >= 7)
    ) {
      eligible.push(boss.key);
    }
    if (
      boss.key === "social_circle" &&
      resolved.some((e) => e.trigger === "parties" || e.trigger === "other_smokers")
    ) {
      eligible.push(boss.key);
    }
    if (boss.key === "night_out" && resolved.some((e) => e.trigger === "alcohol")) {
      eligible.push(boss.key);
    }
  }
  return eligible;
}

export async function reportBossOutcome(bossKey: string, outcome: "success" | "retry", note?: string): Promise<void> {
  await repo.createBossAttempt(bossKey, outcome, note);
  if (outcome === "success") {
    const boss = allBosses().find((b) => b.key === bossKey);
    if (boss) await repo.awardXp("boss_defeated", `boss:${bossKey}`, boss.xpReward);
  }
}
