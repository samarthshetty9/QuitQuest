import type { InterventionKey, TriggerKey } from "@/lib/domain/types";

export type InterventionCategory =
  | "delay"
  | "breathing"
  | "water"
  | "move"
  | "distraction"
  | "oral"
  | "hand"
  | "urge_surf"
  | "talk_back"
  | "why_i_quit"
  | "environment"
  | "social";

export interface InterventionDef {
  key: InterventionKey;
  category: InterventionCategory;
  label: string;
  shortLabel: string;
  emoji: string;
  description: string;
  durationSeconds?: number; // guided/timed interventions
  route: string; // path within the battle flow
  safeWhileDriving: boolean;
}

export const INTERVENTIONS: InterventionDef[] = [
  {
    key: "delay_2",
    category: "delay",
    label: "Wait 2 minutes",
    shortLabel: "2-Min Delay",
    emoji: "⏱️",
    description: "Give it two minutes before deciding anything.",
    durationSeconds: 120,
    route: "delay",
    safeWhileDriving: true,
  },
  {
    key: "delay_5",
    category: "delay",
    label: "Wait 5 minutes",
    shortLabel: "5-Min Delay",
    emoji: "⏱️",
    description: "Cravings often rise and fall. Give this one a few minutes before deciding anything.",
    durationSeconds: 300,
    route: "delay",
    safeWhileDriving: true,
  },
  {
    key: "delay_10",
    category: "delay",
    label: "Wait 10 minutes",
    shortLabel: "10-Min Delay",
    emoji: "⏱️",
    description: "Ten minutes of distance from the urge to act.",
    durationSeconds: 600,
    route: "delay",
    safeWhileDriving: true,
  },
  {
    key: "breathing_1",
    category: "breathing",
    label: "1-Minute Breathing",
    shortLabel: "Breathe (1m)",
    emoji: "🫡",
    description: "A short guided breathing cycle: in for 4, out for 6.",
    durationSeconds: 60,
    route: "breathing",
    safeWhileDriving: false,
  },
  {
    key: "breathing_2",
    category: "breathing",
    label: "2-Minute Breathing",
    shortLabel: "Breathe (2m)",
    emoji: "🫡",
    description: "A longer guided breathing cycle to slow things down.",
    durationSeconds: 120,
    route: "breathing",
    safeWhileDriving: false,
  },
  {
    key: "breathing_5",
    category: "breathing",
    label: "5-Minute Breathing",
    shortLabel: "Breathe (5m)",
    emoji: "🫡",
    description: "An extended breathing session for a strong craving.",
    durationSeconds: 300,
    route: "breathing",
    safeWhileDriving: false,
  },
  {
    key: "water",
    category: "water",
    label: "Get a glass of water",
    shortLabel: "Water",
    emoji: "💧",
    description: "Get up, get a glass of water, come back.",
    route: "water",
    safeWhileDriving: true,
  },
  {
    key: "move_2",
    category: "move",
    label: "2-Minute Movement",
    shortLabel: "Move (2m)",
    emoji: "🚶",
    description: "Two minutes of simple movement — stand, stretch, pace.",
    durationSeconds: 120,
    route: "move",
    safeWhileDriving: false,
  },
  {
    key: "walk_5",
    category: "move",
    label: "5-Minute Walk",
    shortLabel: "Walk (5m)",
    emoji: "🚶",
    description: "Step away and walk for five minutes.",
    durationSeconds: 300,
    route: "move",
    safeWhileDriving: false,
  },
  {
    key: "walk_10",
    category: "move",
    label: "10-Minute Walk",
    shortLabel: "Walk (10m)",
    emoji: "🚶",
    description: "A longer walk to fully change your state.",
    durationSeconds: 600,
    route: "move",
    safeWhileDriving: false,
  },
  {
    key: "stairs",
    category: "move",
    label: "Take the Stairs",
    shortLabel: "Stairs",
    emoji: "🪩",
    description: "A quick burst up and down a flight of stairs.",
    durationSeconds: 90,
    route: "move",
    safeWhileDriving: false,
  },
  {
    key: "stretch",
    category: "move",
    label: "Stretch",
    shortLabel: "Stretch",
    emoji: "🤸",
    description: "A minute of simple stretching at your desk or wherever you are.",
    durationSeconds: 60,
    route: "move",
    safeWhileDriving: false,
  },
  {
    key: "distraction_tap",
    category: "distraction",
    label: "Tapping Challenge",
    shortLabel: "Tap Game",
    emoji: "🎮",
    description: "A fast 60-second tapping challenge to redirect attention.",
    durationSeconds: 60,
    route: "distraction/tap",
    safeWhileDriving: false,
  },
  {
    key: "distraction_memory",
    category: "distraction",
    label: "Pattern Memory",
    shortLabel: "Memory Game",
    emoji: "🧩",
    description: "Reproduce a growing sequence of tiles.",
    durationSeconds: 90,
    route: "distraction/memory",
    safeWhileDriving: false,
  },
  {
    key: "distraction_puzzle",
    category: "distraction",
    label: "Quick Puzzle",
    shortLabel: "Puzzle",
    emoji: "🧩",
    description: "A short number puzzle to occupy your mind.",
    durationSeconds: 90,
    route: "distraction/puzzle",
    safeWhileDriving: false,
  },
  {
    key: "distraction_search",
    category: "distraction",
    label: "Visual Search",
    shortLabel: "Find It",
    emoji: "🔍",
    description: "Find the targets hidden in a busy grid.",
    durationSeconds: 60,
    route: "distraction/search",
    safeWhileDriving: false,
  },
  {
    key: "distraction_trivia",
    category: "distraction",
    label: "Rapid Trivia",
    shortLabel: "Trivia",
    emoji: "❓",
    description: "A handful of quick, lightweight trivia questions.",
    durationSeconds: 90,
    route: "distraction/trivia",
    safeWhileDriving: false,
  },
  {
    key: "oral_substitute",
    category: "oral",
    label: "Oral Substitute",
    shortLabel: "Chew/Sip",
    emoji: "👄",
    description: "Sugar-free gum, mint, a crunchy snack, or water.",
    route: "oral",
    safeWhileDriving: true,
  },
  {
    key: "hand_substitute",
    category: "hand",
    label: "Hand Substitute",
    shortLabel: "Busy Hands",
    emoji: "✋",
    description: "Give your hands something to do — a pen, a coin, a fidget item.",
    route: "hand",
    safeWhileDriving: false,
  },
  {
    key: "urge_surf",
    category: "urge_surf",
    label: "Urge Surfing",
    shortLabel: "Urge Surf",
    emoji: "🌊",
    description: "Notice the craving, describe it, and watch it change without obeying it.",
    durationSeconds: 180,
    route: "urge-surf",
    safeWhileDriving: false,
  },
  {
    key: "talk_back",
    category: "talk_back",
    label: "Talk Back",
    shortLabel: "Reframe",
    emoji: "💭",
    description: "Challenge the thought that's driving the craving.",
    route: "talk-back",
    safeWhileDriving: true,
  },
  {
    key: "why_i_quit",
    category: "why_i_quit",
    label: "Why I Quit",
    shortLabel: "My Why",
    emoji: "❤️",
    description: "Revisit your reasons, your Day 0 message, and your progress.",
    route: "why-i-quit",
    safeWhileDriving: true,
  },
  {
    key: "change_environment",
    category: "environment",
    label: "Change Environment",
    shortLabel: "Move Location",
    emoji: "🚪",
    description: "Leave the space that's cueing the craving.",
    route: "environment",
    safeWhileDriving: false,
  },
  {
    key: "social_support",
    category: "social",
    label: "Talk to Someone",
    shortLabel: "Reach Out",
    emoji: "💬",
    description: "Message or call an accountability contact for five minutes.",
    route: "social",
    safeWhileDriving: false,
  },
];

export function interventionDef(key: InterventionKey): InterventionDef {
  const def = INTERVENTIONS.find((i) => i.key === key);
  if (!def) throw new Error(`Unknown intervention: ${key}`);
  return def;
}

/**
 * Deterministic, rule-based default ranking per trigger. This is the
 * fallback used before enough personal history exists to personalize.
 * Driving always filters to safeWhileDriving-only options.
 */
export const TRIGGER_DEFAULT_RANKING: Record<TriggerKey, InterventionKey[]> = {
  stress: ["breathing_2", "walk_5", "urge_surf", "talk_back", "social_support", "why_i_quit"],
  coffee: ["change_environment", "oral_substitute", "water", "walk_5", "distraction_tap"],
  after_food: ["move_2", "oral_substitute", "water", "walk_5", "change_environment"],
  driving: ["water", "oral_substitute", "delay_5", "talk_back"],
  boredom: ["distraction_tap", "distraction_memory", "walk_5", "distraction_puzzle", "social_support"],
  parties: ["change_environment", "oral_substitute", "social_support", "talk_back", "delay_5"],
  alcohol: ["change_environment", "social_support", "water", "delay_5", "talk_back"],
  cannabis: ["change_environment", "social_support", "urge_surf", "delay_5", "talk_back"],
  anger: ["breathing_2", "walk_5", "urge_surf", "talk_back", "social_support"],
  anxiety: ["breathing_2", "walk_5", "urge_surf", "talk_back", "social_support"],
  morning: ["water", "breathing_1", "walk_5", "oral_substitute", "why_i_quit"],
  other_smokers: ["change_environment", "talk_back", "delay_5", "oral_substitute", "social_support"],
  work_break: ["walk_5", "distraction_tap", "breathing_1", "oral_substitute", "hand_substitute"],
  phone_calls: ["hand_substitute", "breathing_1", "water", "oral_substitute", "walk_5"],
  loneliness: ["social_support", "why_i_quit", "distraction_tap", "urge_surf", "talk_back"],
  celebration: ["talk_back", "why_i_quit", "change_environment", "oral_substitute", "social_support"],
  late_night: ["breathing_2", "change_environment", "distraction_puzzle", "why_i_quit", "water"],
  habit_autopilot: ["change_environment", "hand_substitute", "urge_surf", "distraction_tap", "water"],
  unknown: ["breathing_2", "delay_5", "urge_surf", "distraction_tap", "why_i_quit"],
  custom: ["breathing_2", "delay_5", "urge_surf", "why_i_quit", "distraction_tap"],
};
