import Dexie, { type Table } from "dexie";
import type {
  UserProfile,
  QuitAttempt,
  CravingEvent,
  SlipEvent,
  XPEvent,
  Quest,
  AchievementUnlock,
  CollectionProgress,
  JourneyProgress,
  BossAttempt,
  RewardGoal,
  IfThenPlan,
  SupportContact,
  TreatmentLog,
  DailySnapshot,
  CopingPreference,
  AppSettings,
  ReasonForQuitting,
  FutureSelfMessage,
  CustomTrigger,
  ContextCheckIn,
} from "@/lib/domain/types";

export const SCHEMA_VERSION = 2;

export class QuitQuestDB extends Dexie {
  userProfile!: Table<UserProfile, string>;
  quitAttempts!: Table<QuitAttempt, string>;
  cravingEvents!: Table<CravingEvent, string>;
  slipEvents!: Table<SlipEvent, string>;
  xpEvents!: Table<XPEvent, string>;
  quests!: Table<Quest, string>;
  achievementUnlocks!: Table<AchievementUnlock, string>;
  collectionProgress!: Table<CollectionProgress, string>;
  journeyProgress!: Table<JourneyProgress, string>;
  bossAttempts!: Table<BossAttempt, string>;
  rewardGoals!: Table<RewardGoal, string>;
  ifThenPlans!: Table<IfThenPlan, string>;
  supportContacts!: Table<SupportContact, string>;
  treatmentLogs!: Table<TreatmentLog, string>;
  dailySnapshots!: Table<DailySnapshot, string>;
  copingPreferences!: Table<CopingPreference, string>;
  appSettings!: Table<AppSettings, string>;
  reasonsForQuitting!: Table<ReasonForQuitting, string>;
  futureSelfMessages!: Table<FutureSelfMessage, string>;
  customTriggers!: Table<CustomTrigger, string>;
  contextCheckIns!: Table<ContextCheckIn, string>;

  constructor(name = "quitquest") {
    super(name);
    const v1Stores = {
      userProfile: "id",
      quitAttempts: "id, userId, active",
      cravingEvents: "id, userId, quitAttemptId, createdAt, trigger, outcome",
      slipEvents: "id, userId, quitAttemptId, occurredAt",
      xpEvents: "id, userId, createdAt, dedupeKey, source",
      quests: "id, userId, date, scope, key, weekStart, [userId+date+scope], [userId+weekStart]",
      achievementUnlocks: "id, userId, achievementKey",
      collectionProgress: "id, userId, collectionKey, itemKey",
      journeyProgress: "userId",
      bossAttempts: "id, userId, bossKey",
      rewardGoals: "id, userId, createdAt",
      ifThenPlans: "id, userId, trigger",
      supportContacts: "id, userId",
      treatmentLogs: "id, userId, loggedAt",
      dailySnapshots: "id, userId, date",
      copingPreferences: "userId",
      appSettings: "userId",
      reasonsForQuitting: "id, userId",
      futureSelfMessages: "userId",
      customTriggers: "id",
    };
    this.version(1).stores(v1Stores);
    this.version(SCHEMA_VERSION).stores({
      ...v1Stores,
      contextCheckIns: "id, userId, context, loggedAt",
    });
  }
}

let dbInstance: QuitQuestDB | null = null;

export function getDB(): QuitQuestDB {
  if (typeof window === "undefined") {
    throw new Error("QuitQuestDB can only be used in the browser");
  }
  if (!dbInstance) dbInstance = new QuitQuestDB();
  return dbInstance;
}

/** Test-only: swap in a fresh isolated DB instance (used by Vitest with fake-indexeddb). */
export function __setTestDB(db: QuitQuestDB) {
  dbInstance = db;
}
