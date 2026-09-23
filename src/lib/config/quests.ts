import type { SkillKey } from "@/lib/domain/types";

export interface QuestTemplate {
  key: string;
  scope: "daily" | "weekly";
  title: string;
  description: string;
  xpReward: number;
  skill?: SkillKey;
}

// Daily quest pool. A small subset (see game/quests.ts) is drawn each day so
// the player sees ~4-5 quests, never an overwhelming list.
export const DAILY_QUEST_POOL: QuestTemplate[] = [
  {
    key: "stay_smoke_free_today",
    scope: "daily",
    title: "Stay smoke-free today",
    description: "Get through today without a cigarette.",
    xpReward: 30,
    skill: "discipline",
  },
  {
    key: "use_one_coping_skill",
    scope: "daily",
    title: "Use one coping skill",
    description: "Practice a coping tool on purpose — even if no craving hits.",
    xpReward: 20,
    skill: "mind",
  },
  {
    key: "review_a_plan",
    scope: "daily",
    title: "Review one trigger plan",
    description: "Reread one of your IF-THEN plans.",
    xpReward: 15,
    skill: "discipline",
  },
  {
    key: "short_walk",
    scope: "daily",
    title: "Take a short walk",
    description: "Get outside or just move for a few minutes.",
    xpReward: 20,
    skill: "recovery",
  },
  {
    key: "write_a_reason",
    scope: "daily",
    title: "Write one reason it was worth it today",
    description: "A single sentence is enough.",
    xpReward: 20,
    skill: "mind",
  },
  {
    key: "check_savings",
    scope: "daily",
    title: "Check your savings",
    description: "See how close you are to a reward.",
    xpReward: 15,
    skill: "wealth",
  },
];

export const WEEKLY_QUEST_POOL: QuestTemplate[] = [
  {
    key: "log_three_cravings",
    scope: "weekly",
    title: "Log three cravings accurately",
    description: "Honest logging, even the easy ones, sharpens your trigger intelligence.",
    xpReward: 150,
    skill: "mind",
  },
  {
    key: "practice_two_tools",
    scope: "weekly",
    title: "Practice two different coping tools",
    description: "Try something outside your usual go-to.",
    xpReward: 150,
    skill: "resistance",
  },
  {
    key: "identify_strongest_trigger",
    scope: "weekly",
    title: "Identify your strongest trigger",
    description: "Check Progress to see which trigger shows up most.",
    xpReward: 120,
    skill: "mind",
  },
  {
    key: "create_if_then_plan",
    scope: "weekly",
    title: "Create one IF-THEN plan",
    description: "Prepare for a specific situation before it happens.",
    xpReward: 150,
    skill: "discipline",
  },
  {
    key: "add_reward_goal",
    scope: "weekly",
    title: "Add a reward goal",
    description: "Turn saved money into something concrete you want.",
    xpReward: 120,
    skill: "wealth",
  },
];
