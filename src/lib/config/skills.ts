import type { SkillKey } from "@/lib/domain/types";

export interface SkillDef {
  key: SkillKey;
  label: string;
  emoji: string;
  description: string;
}

export const SKILLS: SkillDef[] = [
  {
    key: "mind",
    label: "Mind",
    emoji: "🧠",
    description: "Grows from urge surfing, reframing thoughts, and reflecting on what you learn.",
  },
  {
    key: "resistance",
    label: "Resistance",
    emoji: "🛡️",
    description: "Grows from craving battles, especially the difficult, high-intensity ones.",
  },
  {
    key: "recovery",
    label: "Recovery",
    emoji: "🌱",
    description: "Grows from sustained smoke-free time. Not a precise biological measure.",
  },
  {
    key: "wealth",
    label: "Wealth",
    emoji: "💰",
    description: "Grows from money saved and progress toward your reward goals.",
  },
  {
    key: "discipline",
    label: "Discipline",
    emoji: "🎯",
    description: "Grows from quests, check-ins, and keeping your routines going.",
  },
];

// XP required per skill level uses the same style of curve as the main level,
// just gentler, since 5 skills accumulate XP in parallel.
export function skillXpForLevel(level: number): number {
  const l = Math.max(1, level);
  return Math.round(40 + 12 * l + 1.4 * l * l);
}

export interface SkillLevelInfo {
  level: number;
  xpIntoLevel: number;
  xpForNextLevel: number;
  totalXp: number;
}

export function skillLevelInfo(totalXp: number): SkillLevelInfo {
  let level = 1;
  let remaining = totalXp;
  while (level < 50) {
    const need = skillXpForLevel(level);
    if (remaining < need) break;
    remaining -= need;
    level++;
  }
  return { level, xpIntoLevel: remaining, xpForNextLevel: skillXpForLevel(level), totalXp };
}

export const SKILL_UNLOCKS: Record<SkillKey, Array<{ level: number; label: string }>> = {
  mind: [
    { level: 3, label: "Urge Surf tool unlocked in Arsenal" },
    { level: 7, label: "Custom talk-back responses" },
    { level: 12, label: "Deeper trigger insights" },
  ],
  resistance: [
    { level: 3, label: "Boss battles unlocked" },
    { level: 7, label: "Trigger Mastery collection tracking" },
    { level: 12, label: "Legendary craving-battle badge" },
  ],
  recovery: [
    { level: 3, label: "Recovery info timeline expands" },
    { level: 7, label: "Extended streak milestones" },
    { level: 12, label: "Veteran status" },
  ],
  wealth: [
    { level: 3, label: "Multiple reward goals" },
    { level: 7, label: "Reward goal priority ranking" },
    { level: 12, label: "Wealth-focused weekly quests" },
  ],
  discipline: [
    { level: 3, label: "Weekly quests unlocked" },
    { level: 7, label: "Streak-safe quest variety" },
    { level: 12, label: "Discipline badge" },
  ],
};
