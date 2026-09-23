// Core domain types for QuitQuest. Event-sourced where practical so derived
// stats (money saved, cigarettes avoided, streaks) can always be recomputed
// from the underlying log rather than trusted cached counters alone.

export type ID = string;
export type ISODateTime = string; // canonical UTC ISO timestamp

export type TriggerKey =
  | "morning"
  | "coffee"
  | "after_food"
  | "stress"
  | "anger"
  | "boredom"
  | "driving"
  | "alcohol"
  | "parties"
  | "other_smokers"
  | "work_break"
  | "phone_calls"
  | "loneliness"
  | "anxiety"
  | "celebration"
  | "late_night"
  | "habit_autopilot"
  | "cannabis"
  | "unknown"
  | "custom";

export interface CustomTrigger {
  id: ID;
  label: string;
}

export type InterventionKey =
  | "delay_2"
  | "delay_5"
  | "delay_10"
  | "breathing_1"
  | "breathing_2"
  | "breathing_5"
  | "water"
  | "move_2"
  | "walk_5"
  | "walk_10"
  | "stairs"
  | "stretch"
  | "distraction_tap"
  | "distraction_memory"
  | "distraction_puzzle"
  | "distraction_search"
  | "distraction_trivia"
  | "oral_substitute"
  | "hand_substitute"
  | "urge_surf"
  | "talk_back"
  | "why_i_quit"
  | "change_environment"
  | "social_support";

export type ReasonKey =
  | "health"
  | "control"
  | "family"
  | "fitness"
  | "money"
  | "appearance"
  | "smell"
  | "freedom"
  | "productivity"
  | "personal_promise"
  | "custom";

export interface UserProfile {
  id: ID;
  nickname: string;
  createdAt: ISODateTime;
  smokingStatus: "smoker" | "quit" | "relapsed";
  cigarettesPerDayBaseline: number;
  cigarettesPerPack: number;
  pricePerPack: number;
  currency: string; // ISO 4217 code, e.g. "INR", "USD"
  yearsSmoked: number;
  minutesToFirstCigarette: number; // approx time of first cigarette after waking, in minutes
  previousQuitAttempts: number;
  longestPreviousQuitDays: number;
  minutesPerSmokingEvent: number; // user-estimated, for time-saved calc
  onboardingComplete: boolean;
  demoMode: boolean;
  commonTriggers?: TriggerKey[];
  /** Typical cigarettes smoked in a drinking session, used as a baseline for situational check-ins. Undefined/null = not applicable or not answered. */
  cigsWhenDrinkingBaseline?: number | null;
  /** Typical cigarettes smoked in a cannabis/"high" session, used as a baseline for situational check-ins. */
  cigsWhenHighBaseline?: number | null;
}

export interface QuitAttempt {
  id: ID;
  userId: ID;
  quitDateTime: ISODateTime; // when this attempt began/begins
  startedAt: ISODateTime; // when the record was created
  active: boolean; // only one active attempt at a time
  endedAt?: ISODateTime;
  endReason?: "slip_restart" | "manual_restart";
}

export interface Trigger {
  key: TriggerKey;
  label: string;
  customId?: ID;
}

export interface ReasonForQuitting {
  id: ID;
  userId: ID;
  key: ReasonKey;
  label: string;
  customText?: string;
}

export interface CravingEvent {
  id: ID;
  userId: ID;
  quitAttemptId: ID;
  createdAt: ISODateTime;
  startingIntensity: number; // 1-10
  endingIntensity?: number;
  trigger: TriggerKey;
  customTriggerLabel?: string;
  location?: "driving" | "work" | "home" | "social" | "other";
  interventions: CravingInterventionResult[];
  outcome: "resolved" | "smoked" | "abandoned" | "in_progress";
  slipEventId?: ID;
  effectivenessRating?: number; // 1-5 user rating of the battle overall
  notes?: string;
}

export interface CravingInterventionResult {
  id: ID;
  cravingEventId: ID;
  intervention: InterventionKey;
  startedAt: ISODateTime;
  completedAt?: ISODateTime;
  durationSeconds?: number;
  intensityBefore: number;
  intensityAfter?: number;
  skipped?: boolean;
}

export interface SlipEvent {
  id: ID;
  userId: ID;
  quitAttemptId: ID;
  occurredAt: ISODateTime;
  cigaretteCount: number;
  trigger: TriggerKey;
  customTriggerLabel?: string;
  cravingIntensity?: number;
  context?: string;
  learnings: SlipLearningTag[];
  note?: string;
  followUpPlanId?: ID;
  cravingEventId?: ID;
}

export type SlipLearningTag =
  | "unexpected_trigger"
  | "social_pressure"
  | "stress"
  | "alcohol"
  | "availability"
  | "no_coping_plan"
  | "strong_withdrawal"
  | "just_one_thought"
  | "other";

export type XPSourceKey =
  | "smoke_free_day"
  | "craving_logged"
  | "coping_action_completed"
  | "craving_battle_completed"
  | "high_intensity_craving_passed"
  | "daily_quest"
  | "weekly_quest"
  | "if_then_plan_created"
  | "slip_reflection"
  | "new_trigger_identified"
  | "milestone"
  | "boss_defeated"
  | "achievement_unlocked"
  | "context_checkin_good";

export interface XPEvent {
  id: ID;
  userId: ID;
  createdAt: ISODateTime;
  amount: number;
  source: XPSourceKey;
  dedupeKey: string; // used to prevent double-awarding for the same real event
  meta?: Record<string, unknown>;
}

export type SkillKey = "mind" | "resistance" | "recovery" | "wealth" | "discipline";

export interface Quest {
  id: ID;
  userId: ID;
  date: string; // yyyy-MM-dd in user's local time, the day the quest was issued
  scope: "daily" | "weekly";
  key: string; // template key
  title: string;
  description: string;
  xpReward: number;
  skill?: SkillKey;
  completed: boolean;
  completedAt?: ISODateTime;
  weekStart?: string; // for weekly quests, yyyy-MM-dd (Mon)
}

export interface AchievementUnlock {
  id: ID;
  userId: ID;
  achievementKey: string;
  unlockedAt: ISODateTime;
}

export interface CollectionProgress {
  id: ID;
  userId: ID;
  collectionKey: string;
  itemKey: string;
  progressCount: number;
  masteredAt?: ISODateTime;
}

export interface JourneyProgress {
  userId: ID;
  currentChapterKey: string;
  currentNodeKey: string;
  completedNodeKeys: string[];
}

export interface BossAttempt {
  id: ID;
  userId: ID;
  bossKey: string;
  attemptedAt: ISODateTime;
  outcome: "success" | "retry" | "in_progress";
  note?: string;
}

export interface RewardGoal {
  id: ID;
  userId: ID;
  title: string;
  emoji: string;
  targetCost: number;
  notes?: string;
  priority: number;
  createdAt: ISODateTime;
  unlockedAt?: ISODateTime;
  imageDataUrl?: string;
}

export interface IfThenPlan {
  id: ID;
  userId: ID;
  trigger: TriggerKey;
  customTriggerLabel?: string;
  ifText: string;
  thenText: string;
  createdAt: ISODateTime;
  active: boolean;
  timesSurfaced: number;
  timesHelped: number;
}

export interface SupportContact {
  id: ID;
  userId: ID;
  name: string;
  phone?: string;
  relationship?: string;
}

export type TreatmentKind =
  | "patch"
  | "gum"
  | "lozenge"
  | "prescription"
  | "counselling"
  | "other";

export interface TreatmentLog {
  id: ID;
  userId: ID;
  kind: TreatmentKind;
  label: string;
  loggedAt: ISODateTime;
  note?: string;
}

export interface DailySnapshot {
  id: ID;
  userId: ID;
  date: string; // yyyy-MM-dd
  smokeFree: boolean;
  cigarettesSmoked: number;
  cravingsLogged: number;
  cravingsResolved: number;
}

export interface CopingPreference {
  userId: ID;
  favoriteInterventions: InterventionKey[];
  talkBackResponses: TalkBackResponse[];
}

export interface TalkBackResponse {
  id: ID;
  thoughtKey: string;
  customThought?: string;
  responseText: string;
  isUserCreated: boolean;
  timesUsed: number;
}

export interface AppSettings {
  userId: ID;
  theme: "system" | "light" | "dark";
  reducedMotion: boolean;
  notificationsEnabled: boolean;
  currency: string;
  demoMode: boolean;
}

export interface DataSchemaVersion {
  key: "schema";
  version: number;
}

export interface FutureSelfMessage {
  userId: ID;
  message: string;
  updatedAt: ISODateTime;
}

/** A situation known to change smoking behavior — currently drinking or cannabis use. */
export type SituationalContext = "drinking" | "high";

/**
 * A quick log of cigarettes smoked during a specific situational context
 * (e.g. "I'm out drinking"). Purely an informational/motivational record —
 * it does not itself change streak accounting. If cigaretteCount > 0, the
 * logging action that created it is also responsible for creating a real
 * SlipEvent so streak/lifetime stats still derive correctly from the full
 * event history; this record just adds the situational baseline comparison.
 */
export interface ContextCheckIn {
  id: ID;
  userId: ID;
  context: SituationalContext;
  cigaretteCount: number;
  loggedAt: ISODateTime;
  note?: string;
}
