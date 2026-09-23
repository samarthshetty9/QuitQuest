import type { TriggerKey } from "@/lib/domain/types";

export interface TriggerDef {
  key: TriggerKey;
  label: string;
  emoji: string;
}

export const TRIGGERS: TriggerDef[] = [
  { key: "morning", label: "Morning", emoji: "☀️" },
  { key: "coffee", label: "Coffee / Tea", emoji: "☕" },
  { key: "after_food", label: "After Food", emoji: "🍽️" },
  { key: "stress", label: "Stress", emoji: "😥" },
  { key: "anger", label: "Anger", emoji: "😠" },
  { key: "boredom", label: "Boredom", emoji: "🥱" },
  { key: "driving", label: "Driving", emoji: "🚗" },
  { key: "alcohol", label: "Alcohol", emoji: "🍺" },
  { key: "parties", label: "Parties", emoji: "🎉" },
  { key: "other_smokers", label: "Other Smokers", emoji: "🚬" },
  { key: "work_break", label: "Work Break", emoji: "💼" },
  { key: "phone_calls", label: "Phone Calls", emoji: "📞" },
  { key: "loneliness", label: "Loneliness", emoji: "😔" },
  { key: "anxiety", label: "Anxiety", emoji: "😰" },
  { key: "celebration", label: "Celebration", emoji: "🎊" },
  { key: "late_night", label: "Late Night", emoji: "🌙" },
  { key: "habit_autopilot", label: "Habit / Autopilot", emoji: "🔁" },
  { key: "cannabis", label: "Cannabis / High", emoji: "🌿" },
  { key: "unknown", label: "Not Sure", emoji: "❓" },
  { key: "custom", label: "Something Else", emoji: "✏️" },
];

export function triggerLabel(key: TriggerKey, customLabel?: string): string {
  if (key === "custom" && customLabel) return customLabel;
  return TRIGGERS.find((t) => t.key === key)?.label ?? key;
}
