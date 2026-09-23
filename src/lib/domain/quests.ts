import { DAILY_QUEST_POOL, WEEKLY_QUEST_POOL, type QuestTemplate } from "@/lib/config/quests";
import type { Quest } from "@/lib/domain/types";

const DAILY_QUEST_COUNT = 4;
const WEEKLY_QUEST_COUNT = 3;

function seededHash(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h << 5) - h + input.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function seededShuffle<T>(items: T[], seed: string): T[] {
  const arr = [...items];
  let s = seededHash(seed);
  for (let i = arr.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export type NewQuest = Omit<Quest, "id" | "completed" | "completedAt">;

/** Deterministic per day: same day always yields the same quest set for a user. */
export function generateDailyQuests(userId: string, dateKey: string): NewQuest[] {
  const picked = seededShuffle(DAILY_QUEST_POOL, `${userId}:${dateKey}`).slice(0, DAILY_QUEST_COUNT);
  return picked.map((t) => templateToQuest(t, userId, dateKey, "daily"));
}

/** Deterministic per ISO week: weekStartKey should be the Monday of the week, yyyy-MM-dd. */
export function generateWeeklyQuests(userId: string, weekStartKey: string): NewQuest[] {
  const picked = seededShuffle(WEEKLY_QUEST_POOL, `${userId}:${weekStartKey}`).slice(0, WEEKLY_QUEST_COUNT);
  return picked.map((t) => ({ ...templateToQuest(t, userId, weekStartKey, "weekly"), weekStart: weekStartKey }));
}

function templateToQuest(
  t: QuestTemplate,
  userId: string,
  dateKey: string,
  scope: "daily" | "weekly"
): NewQuest {
  return {
    userId,
    date: dateKey,
    scope,
    key: t.key,
    title: t.title,
    description: t.description,
    xpReward: t.xpReward,
    skill: t.skill,
  };
}
