import type { ReasonKey } from "@/lib/domain/types";

export interface ReasonDef {
  key: ReasonKey;
  label: string;
  emoji: string;
}

export const REASONS: ReasonDef[] = [
  { key: "health", label: "Health", emoji: "🧬" },
  { key: "control", label: "Control", emoji: "🎛️" },
  { key: "family", label: "Family", emoji: "👪" },
  { key: "fitness", label: "Fitness", emoji: "🏃" },
  { key: "money", label: "Money", emoji: "💰" },
  { key: "appearance", label: "Appearance", emoji: "✨" },
  { key: "smell", label: "Smell", emoji: "👃" },
  { key: "freedom", label: "Freedom", emoji: "🔓" },
  { key: "productivity", label: "Productivity", emoji: "⚡" },
  { key: "personal_promise", label: "A Promise to Myself", emoji: "🤝" },
  { key: "custom", label: "Something Else", emoji: "✏️" },
];
