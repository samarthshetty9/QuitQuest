export type AchievementCategory =
  | "time"
  | "craving_mastery"
  | "triggers"
  | "money"
  | "cigarettes_avoided"
  | "reflection";

export type AchievementRarity = "common" | "rare" | "epic" | "legendary" | "mythic";

export interface AchievementDef {
  key: string;
  category: AchievementCategory;
  label: string;
  description: string;
  rarity: AchievementRarity;
  xpReward: number;
  emoji: string;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  // TIME
  { key: "time_24h", category: "time", label: "First Day", description: "24 hours smoke-free.", rarity: "common", xpReward: 40, emoji: "🌅" },
  { key: "time_3d", category: "time", label: "Three Days In", description: "3 days smoke-free.", rarity: "common", xpReward: 60, emoji: "📅" },
  { key: "time_7d", category: "time", label: "One Week", description: "7 days smoke-free.", rarity: "rare", xpReward: 100, emoji: "📆" },
  { key: "time_14d", category: "time", label: "Two Weeks", description: "14 days smoke-free.", rarity: "rare", xpReward: 130, emoji: "📆" },
  { key: "time_30d", category: "time", label: "One Month", description: "30 days smoke-free.", rarity: "epic", xpReward: 200, emoji: "🏆" },
  { key: "time_90d", category: "time", label: "Three Months", description: "90 days smoke-free.", rarity: "epic", xpReward: 300, emoji: "🏆" },
  { key: "time_180d", category: "time", label: "Half a Year", description: "180 days smoke-free.", rarity: "legendary", xpReward: 450, emoji: "👑" },
  { key: "time_365d", category: "time", label: "One Year Free", description: "365 days smoke-free.", rarity: "mythic", xpReward: 800, emoji: "👑" },

  // CRAVING MASTERY
  { key: "battles_1", category: "craving_mastery", label: "First Battle", description: "Complete your first craving battle.", rarity: "common", xpReward: 30, emoji: "⚔️" },
  { key: "battles_10", category: "craving_mastery", label: "Battle-Tested", description: "Complete 10 craving battles.", rarity: "rare", xpReward: 80, emoji: "⚔️" },
  { key: "battles_25", category: "craving_mastery", label: "Seasoned Fighter", description: "Complete 25 craving battles.", rarity: "epic", xpReward: 150, emoji: "🛡️" },
  { key: "battles_50", category: "craving_mastery", label: "Veteran", description: "Complete 50 craving battles.", rarity: "epic", xpReward: 220, emoji: "🛡️" },
  { key: "battles_100", category: "craving_mastery", label: "Master of the Craving", description: "Complete 100 craving battles.", rarity: "legendary", xpReward: 400, emoji: "🏅" },

  // TRIGGERS
  { key: "trigger_coffee_first", category: "triggers", label: "Coffee, No Cigarette", description: "First coffee craving handled smoke-free.", rarity: "common", xpReward: 40, emoji: "☕" },
  { key: "trigger_social_first", category: "triggers", label: "Social, No Cigarette", description: "First social-event craving handled smoke-free.", rarity: "rare", xpReward: 60, emoji: "🥂" },
  { key: "trigger_stress_strong", category: "triggers", label: "Weathered the Storm", description: "Handled a strong (7+) stress craving smoke-free.", rarity: "epic", xpReward: 90, emoji: "⛈️" },

  // MONEY (amounts assume INR by default; label is generated dynamically for other currencies)
  { key: "money_1000", category: "money", label: "First Savings", description: "Saved 1,000 in local currency by not smoking.", rarity: "common", xpReward: 40, emoji: "💵" },
  { key: "money_5000", category: "money", label: "Real Money", description: "Saved 5,000 in local currency.", rarity: "rare", xpReward: 80, emoji: "💵" },
  { key: "money_10000", category: "money", label: "Serious Savings", description: "Saved 10,000 in local currency.", rarity: "epic", xpReward: 150, emoji: "💰" },
  { key: "money_25000", category: "money", label: "Reward-Worthy", description: "Saved 25,000 in local currency.", rarity: "legendary", xpReward: 250, emoji: "💰" },

  // CIGARETTES AVOIDED
  { key: "cigs_10", category: "cigarettes_avoided", label: "Ten Avoided", description: "10 cigarettes avoided.", rarity: "common", xpReward: 30, emoji: "🚫" },
  { key: "cigs_50", category: "cigarettes_avoided", label: "Fifty Avoided", description: "50 cigarettes avoided.", rarity: "rare", xpReward: 60, emoji: "🚫" },
  { key: "cigs_100", category: "cigarettes_avoided", label: "A Hundred Avoided", description: "100 cigarettes avoided.", rarity: "epic", xpReward: 120, emoji: "🚫" },
  { key: "cigs_500", category: "cigarettes_avoided", label: "Five Hundred Avoided", description: "500 cigarettes avoided.", rarity: "legendary", xpReward: 300, emoji: "🚫" },
  { key: "cigs_1000", category: "cigarettes_avoided", label: "A Thousand Avoided", description: "1,000 cigarettes avoided.", rarity: "mythic", xpReward: 600, emoji: "🚫" },

  // REFLECTION / LEARNING
  { key: "plan_first", category: "reflection", label: "First Plan", description: "Created your first IF-THEN plan.", rarity: "common", xpReward: 30, emoji: "📋" },
  { key: "triggers_five_understood", category: "reflection", label: "Know Your Triggers", description: "Logged cravings across five different trigger types.", rarity: "rare", xpReward: 70, emoji: "🧩" },
  { key: "slip_reflected", category: "reflection", label: "Learned From It", description: "Completed a reflection after a slip.", rarity: "common", xpReward: 30, emoji: "📝" },
];

export function achievementDef(key: string): AchievementDef | undefined {
  return ACHIEVEMENTS.find((a) => a.key === key);
}
