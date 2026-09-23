import { getDB, SCHEMA_VERSION } from "@/lib/db/db";
import { makeId } from "@/lib/domain/id";
import { nowISO } from "@/lib/time/clock";
import type {
  UserProfile,
  QuitAttempt,
  CravingEvent,
  CravingInterventionResult,
  SlipEvent,
  XPEvent,
  Quest,
  AchievementUnlock,
  RewardGoal,
  IfThenPlan,
  SupportContact,
  TreatmentLog,
  CopingPreference,
  AppSettings,
  ReasonForQuitting,
  FutureSelfMessage,
  TriggerKey,
  XPSourceKey,
  ContextCheckIn,
  SituationalContext,
} from "@/lib/domain/types";
import { XP_AWARDS, DAILY_XP_CAPS } from "@/lib/config/xp";

const CURRENT_USER_ID = "local-user";
export { CURRENT_USER_ID };

// ---------- User profile ----------

export async function getUserProfile(): Promise<UserProfile | undefined> {
  return getDB().userProfile.get(CURRENT_USER_ID);
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  await getDB().userProfile.put(profile);
}

// ---------- Quit attempts ----------

export async function getActiveQuitAttempt(): Promise<QuitAttempt | undefined> {
  const attempts = await getDB().quitAttempts.where({ userId: CURRENT_USER_ID }).toArray();
  return attempts.find((a) => a.active);
}

export async function getAllQuitAttempts(): Promise<QuitAttempt[]> {
  return getDB().quitAttempts.where({ userId: CURRENT_USER_ID }).toArray();
}

export async function createQuitAttempt(quitDateTimeISO: string): Promise<QuitAttempt> {
  const db = getDB();
  const existing = await getActiveQuitAttempt();
  if (existing) {
    await db.quitAttempts.update(existing.id, { active: false, endedAt: nowISO(), endReason: "manual_restart" });
  }
  const attempt: QuitAttempt = {
    id: makeId("qa"),
    userId: CURRENT_USER_ID,
    quitDateTime: quitDateTimeISO,
    startedAt: nowISO(),
    active: true,
  };
  await db.quitAttempts.put(attempt);
  return attempt;
}

// ---------- XP ----------

export async function getAllXpEvents(): Promise<XPEvent[]> {
  return getDB().xpEvents.where({ userId: CURRENT_USER_ID }).toArray();
}

/**
 * Awards XP idempotently by dedupeKey, and enforces a per-day cap on
 * repetitive sources so a player can't farm XP by spamming the same action.
 * Returns the created event, or null if it was a duplicate/capped no-op.
 */
export async function awardXp(
  source: XPSourceKey,
  dedupeKey: string,
  amountOverride?: number,
  meta?: Record<string, unknown>,
  atISO?: string
): Promise<XPEvent | null> {
  const db = getDB();
  const existing = await db.xpEvents.where({ dedupeKey }).first();
  if (existing) return null;

  const createdAt = atISO ?? nowISO();

  const cap = DAILY_XP_CAPS[source];
  if (cap) {
    const day = createdAt.slice(0, 10);
    const sameDayOfSource = await db.xpEvents
      .where({ userId: CURRENT_USER_ID, source })
      .filter((e) => e.createdAt.slice(0, 10) === day)
      .count();
    if (sameDayOfSource >= cap) return null;
  }

  const amount = amountOverride ?? XP_AWARDS[source];
  const event: XPEvent = {
    id: makeId("xp"),
    userId: CURRENT_USER_ID,
    createdAt,
    amount,
    source,
    dedupeKey,
    meta,
  };
  await db.xpEvents.put(event);
  return event;
}

// ---------- Craving events ----------

export async function getAllCravingEvents(): Promise<CravingEvent[]> {
  return getDB().cravingEvents.where({ userId: CURRENT_USER_ID }).toArray();
}

export async function createCravingEvent(input: {
  quitAttemptId: string;
  startingIntensity: number;
  trigger: TriggerKey;
  customTriggerLabel?: string;
  location?: CravingEvent["location"];
}): Promise<CravingEvent> {
  const event: CravingEvent = {
    id: makeId("cr"),
    userId: CURRENT_USER_ID,
    quitAttemptId: input.quitAttemptId,
    createdAt: nowISO(),
    startingIntensity: input.startingIntensity,
    trigger: input.trigger,
    customTriggerLabel: input.customTriggerLabel,
    location: input.location,
    interventions: [],
    outcome: "in_progress",
  };
  await getDB().cravingEvents.put(event);
  return event;
}

export async function updateCravingEvent(id: string, patch: Partial<CravingEvent>): Promise<void> {
  await getDB().cravingEvents.update(id, patch);
}

export async function addInterventionResult(
  cravingEventId: string,
  result: CravingInterventionResult
): Promise<void> {
  const db = getDB();
  const event = await db.cravingEvents.get(cravingEventId);
  if (!event) return;
  await db.cravingEvents.update(cravingEventId, {
    interventions: [...event.interventions, result],
  });
}

export async function updateInterventionResult(
  cravingEventId: string,
  resultId: string,
  patch: Partial<CravingInterventionResult>
): Promise<void> {
  const db = getDB();
  const event = await db.cravingEvents.get(cravingEventId);
  if (!event) return;
  const interventions = event.interventions.map((r) => (r.id === resultId ? { ...r, ...patch } : r));
  await db.cravingEvents.update(cravingEventId, { interventions });
}

// ---------- Slips ----------

export async function getAllSlips(): Promise<SlipEvent[]> {
  return getDB().slipEvents.where({ userId: CURRENT_USER_ID }).toArray();
}

export async function createSlip(input: Omit<SlipEvent, "id" | "userId">): Promise<SlipEvent> {
  const slip: SlipEvent = { ...input, id: makeId("sl"), userId: CURRENT_USER_ID };
  await getDB().slipEvents.put(slip);
  return slip;
}

// ---------- Quests ----------

export async function getQuestsForDate(dateKey: string): Promise<Quest[]> {
  return getDB().quests.where({ userId: CURRENT_USER_ID, date: dateKey, scope: "daily" }).toArray();
}

export async function getQuestsForWeek(weekStartKey: string): Promise<Quest[]> {
  return getDB().quests.where({ userId: CURRENT_USER_ID, weekStart: weekStartKey }).toArray();
}

export async function getAllQuests(): Promise<Quest[]> {
  return getDB().quests.where({ userId: CURRENT_USER_ID }).toArray();
}

export async function putQuests(quests: Quest[]): Promise<void> {
  await getDB().quests.bulkPut(quests);
}

export async function completeQuest(questId: string): Promise<void> {
  await getDB().quests.update(questId, { completed: true, completedAt: nowISO() });
}

// ---------- Achievements ----------

export async function getUnlockedAchievements(): Promise<AchievementUnlock[]> {
  return getDB().achievementUnlocks.where({ userId: CURRENT_USER_ID }).toArray();
}

export async function unlockAchievement(key: string): Promise<AchievementUnlock | null> {
  const db = getDB();
  const existing = await db.achievementUnlocks.where({ userId: CURRENT_USER_ID, achievementKey: key }).first();
  if (existing) return null;
  const unlock: AchievementUnlock = { id: makeId("ach"), userId: CURRENT_USER_ID, achievementKey: key, unlockedAt: nowISO() };
  await db.achievementUnlocks.put(unlock);
  return unlock;
}

// ---------- Boss attempts ----------

export async function getBossAttempts(): Promise<import("@/lib/domain/types").BossAttempt[]> {
  return getDB().bossAttempts.where({ userId: CURRENT_USER_ID }).toArray();
}

export async function createBossAttempt(
  bossKey: string,
  outcome: "success" | "retry" | "in_progress",
  note?: string
): Promise<import("@/lib/domain/types").BossAttempt> {
  const attempt: import("@/lib/domain/types").BossAttempt = {
    id: makeId("boss"),
    userId: CURRENT_USER_ID,
    bossKey,
    attemptedAt: nowISO(),
    outcome,
    note,
  };
  await getDB().bossAttempts.put(attempt);
  return attempt;
}

// ---------- Reward goals ----------

export async function getRewardGoals(): Promise<RewardGoal[]> {
  return getDB().rewardGoals.where({ userId: CURRENT_USER_ID }).toArray();
}

export async function createRewardGoal(input: Omit<RewardGoal, "id" | "userId" | "createdAt">): Promise<RewardGoal> {
  const goal: RewardGoal = { ...input, id: makeId("rw"), userId: CURRENT_USER_ID, createdAt: nowISO() };
  await getDB().rewardGoals.put(goal);
  return goal;
}

export async function updateRewardGoal(id: string, patch: Partial<RewardGoal>): Promise<void> {
  await getDB().rewardGoals.update(id, patch);
}

export async function deleteRewardGoal(id: string): Promise<void> {
  await getDB().rewardGoals.delete(id);
}

// ---------- IF-THEN plans ----------

export async function getIfThenPlans(): Promise<IfThenPlan[]> {
  return getDB().ifThenPlans.where({ userId: CURRENT_USER_ID }).toArray();
}

export async function createIfThenPlan(
  input: Omit<IfThenPlan, "id" | "userId" | "createdAt" | "timesSurfaced" | "timesHelped">
): Promise<IfThenPlan> {
  const plan: IfThenPlan = {
    ...input,
    id: makeId("pl"),
    userId: CURRENT_USER_ID,
    createdAt: nowISO(),
    timesSurfaced: 0,
    timesHelped: 0,
  };
  await getDB().ifThenPlans.put(plan);
  return plan;
}

export async function updateIfThenPlan(id: string, patch: Partial<IfThenPlan>): Promise<void> {
  await getDB().ifThenPlans.update(id, patch);
}

export async function deleteIfThenPlan(id: string): Promise<void> {
  await getDB().ifThenPlans.delete(id);
}

// ---------- Support contacts ----------

export async function getSupportContacts(): Promise<SupportContact[]> {
  return getDB().supportContacts.where({ userId: CURRENT_USER_ID }).toArray();
}

export async function createSupportContact(input: Omit<SupportContact, "id" | "userId">): Promise<SupportContact> {
  const contact: SupportContact = { ...input, id: makeId("sc"), userId: CURRENT_USER_ID };
  await getDB().supportContacts.put(contact);
  return contact;
}

export async function deleteSupportContact(id: string): Promise<void> {
  await getDB().supportContacts.delete(id);
}

// ---------- Treatment logs ----------

export async function getTreatmentLogs(): Promise<TreatmentLog[]> {
  return getDB().treatmentLogs.where({ userId: CURRENT_USER_ID }).toArray();
}

export async function createTreatmentLog(input: Omit<TreatmentLog, "id" | "userId">): Promise<TreatmentLog> {
  const log: TreatmentLog = { ...input, id: makeId("tl"), userId: CURRENT_USER_ID };
  await getDB().treatmentLogs.put(log);
  return log;
}

// ---------- Coping preferences ----------

export async function getCopingPreferences(): Promise<CopingPreference> {
  const existing = await getDB().copingPreferences.get(CURRENT_USER_ID);
  return existing ?? { userId: CURRENT_USER_ID, favoriteInterventions: [], talkBackResponses: [] };
}

export async function saveCopingPreferences(prefs: CopingPreference): Promise<void> {
  await getDB().copingPreferences.put(prefs);
}

// ---------- Settings ----------

export async function getAppSettings(): Promise<AppSettings> {
  const existing = await getDB().appSettings.get(CURRENT_USER_ID);
  return (
    existing ?? {
      userId: CURRENT_USER_ID,
      theme: "system",
      reducedMotion: false,
      notificationsEnabled: false,
      currency: "INR",
      demoMode: false,
    }
  );
}

export async function saveAppSettings(settings: AppSettings): Promise<void> {
  await getDB().appSettings.put(settings);
}

// ---------- Reasons for quitting ----------

export async function getReasons(): Promise<ReasonForQuitting[]> {
  return getDB().reasonsForQuitting.where({ userId: CURRENT_USER_ID }).toArray();
}

export async function saveReasons(reasons: ReasonForQuitting[]): Promise<void> {
  const db = getDB();
  await db.reasonsForQuitting.where({ userId: CURRENT_USER_ID }).delete();
  await db.reasonsForQuitting.bulkPut(reasons);
}

// ---------- Future self message ----------

export async function getFutureSelfMessage(): Promise<FutureSelfMessage | undefined> {
  return getDB().futureSelfMessages.get(CURRENT_USER_ID);
}

export async function saveFutureSelfMessage(message: string): Promise<void> {
  await getDB().futureSelfMessages.put({ userId: CURRENT_USER_ID, message, updatedAt: nowISO() });
}

// ---------- Situational context check-ins ----------

export async function getContextCheckIns(): Promise<ContextCheckIn[]> {
  return getDB().contextCheckIns.where({ userId: CURRENT_USER_ID }).toArray();
}

export async function createContextCheckIn(input: {
  id?: string;
  context: SituationalContext;
  cigaretteCount: number;
  note?: string;
}): Promise<ContextCheckIn> {
  const checkIn: ContextCheckIn = {
    id: input.id ?? makeId("ctx"),
    userId: CURRENT_USER_ID,
    context: input.context,
    cigaretteCount: input.cigaretteCount,
    loggedAt: nowISO(),
    note: input.note,
  };
  await getDB().contextCheckIns.put(checkIn);
  return checkIn;
}

// ---------- Bulk export/import/reset ----------

export interface ExportedData {
  schemaVersion: number;
  exportedAt: string;
  tables: Record<string, unknown[]>;
}

const TABLE_NAMES = [
  "userProfile",
  "quitAttempts",
  "cravingEvents",
  "slipEvents",
  "xpEvents",
  "quests",
  "achievementUnlocks",
  "collectionProgress",
  "journeyProgress",
  "bossAttempts",
  "rewardGoals",
  "ifThenPlans",
  "supportContacts",
  "treatmentLogs",
  "dailySnapshots",
  "copingPreferences",
  "appSettings",
  "reasonsForQuitting",
  "futureSelfMessages",
  "customTriggers",
  "contextCheckIns",
] as const;

export async function exportAllData(): Promise<ExportedData> {
  const db = getDB();
  const tables: Record<string, unknown[]> = {};
  for (const name of TABLE_NAMES) {
    tables[name] = await (db as unknown as Record<string, { toArray: () => Promise<unknown[]> }>)[name].toArray();
  }
  return { schemaVersion: SCHEMA_VERSION, exportedAt: nowISO(), tables };
}

/**
 * Always clears every known table first, even ones missing from the import
 * payload (e.g. an older export that predates a table added in a later
 * schema version) — otherwise data from a newer schema already on this
 * device would survive a restore from an older export and end up mixed with
 * it, rather than the restore being a clean full replacement.
 */
export async function importAllData(data: ExportedData): Promise<void> {
  const db = getDB();
  await db.transaction("rw", db.tables, async () => {
    for (const name of TABLE_NAMES) {
      const rows = data.tables[name];
      const table = (db as unknown as Record<string, { clear: () => Promise<void>; bulkPut: (r: unknown[]) => Promise<unknown> }>)[name];
      await table.clear();
      if (Array.isArray(rows) && rows.length) await table.bulkPut(rows);
    }
  });
}

export async function resetAllData(): Promise<void> {
  const db = getDB();
  await db.transaction("rw", db.tables, async () => {
    for (const name of TABLE_NAMES) {
      await (db as unknown as Record<string, { clear: () => Promise<void> }>)[name].clear();
    }
  });
}
