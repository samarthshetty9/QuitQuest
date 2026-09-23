export interface BossDef {
  key: string;
  label: string;
  emoji: string;
  description: string;
  eligibility: string; // human-readable description of when it unlocks
  xpReward: number;
}

export interface ChapterDef {
  key: string;
  order: number;
  title: string;
  subtitle: string;
  description: string;
  dayRangeLabel: string; // human label, e.g. "Day 0"
  minDay: number; // days since quit date, inclusive, used to gate the chapter
  bosses: BossDef[];
}

export const CHAPTERS: ChapterDef[] = [
  {
    key: "decision",
    order: 1,
    title: "The Decision",
    subtitle: "Day 0",
    description: "Quit preparation. You've made the call — now you're getting ready.",
    dayRangeLabel: "Day 0",
    minDay: 0,
    bosses: [],
  },
  {
    key: "breaking_the_loop",
    order: 2,
    title: "Breaking the Loop",
    subtitle: "Days 1-3",
    description: "The earliest hours and days, when old habits fire the loudest.",
    dayRangeLabel: "Days 1-3",
    minDay: 1,
    bosses: [
      {
        key: "morning_autopilot",
        label: "Morning Autopilot",
        emoji: "☀️",
        description: "Complete a full morning routine without smoking.",
        eligibility: "Log a morning-trigger craving that ends without a slip.",
        xpReward: 120,
      },
    ],
  },
  {
    key: "first_week",
    order: 3,
    title: "The First Week",
    subtitle: "Days 4-7",
    description: "Building the evidence that you can get through a whole week.",
    dayRangeLabel: "Days 4-7",
    minDay: 4,
    bosses: [
      {
        key: "coffee_trigger",
        label: "Coffee Trigger",
        emoji: "☕",
        description: "Get through your coffee routine without smoking.",
        eligibility: "Resolve a coffee-trigger craving.",
        xpReward: 120,
      },
      {
        key: "after_meal_trigger",
        label: "After-Meal Trigger",
        emoji: "🍽️",
        description: "Use a substitute behaviour after three separate meals.",
        eligibility: "Resolve three after_food-trigger cravings.",
        xpReward: 150,
      },
    ],
  },
  {
    key: "breaking_patterns",
    order: 4,
    title: "Breaking Patterns",
    subtitle: "Weeks 2-4",
    description: "The routines that used to include a cigarette start to reshape themselves.",
    dayRangeLabel: "Weeks 2-4",
    minDay: 8,
    bosses: [
      {
        key: "stress_test",
        label: "Stress Test",
        emoji: "🔥",
        description: "Successfully navigate a strong stress craving.",
        eligibility: "Resolve a stress-trigger craving that started at 7+ intensity.",
        xpReward: 180,
      },
    ],
  },
  {
    key: "new_normal",
    order: 5,
    title: "The New Normal",
    subtitle: "Months 1-3",
    description: "Smoke-free stops being a constant effort and starts being how things are.",
    dayRangeLabel: "Months 1-3",
    minDay: 30,
    bosses: [
      {
        key: "social_circle",
        label: "Social Circle",
        emoji: "🥂",
        description: "Get through a social situation around other smokers without smoking.",
        eligibility: "Resolve a parties or other_smokers craving.",
        xpReward: 180,
      },
    ],
  },
  {
    key: "identity",
    order: 6,
    title: "Identity",
    subtitle: "Months 3-6",
    description: "Less 'a smoker who's quitting' and more just... who you are now.",
    dayRangeLabel: "Months 3-6",
    minDay: 90,
    bosses: [
      {
        key: "night_out",
        label: "Night Out",
        emoji: "🌟",
        description: "Get through a night out, including alcohol, without smoking.",
        eligibility: "Resolve an alcohol-trigger craving.",
        xpReward: 220,
      },
    ],
  },
  {
    key: "freedom",
    order: 7,
    title: "Freedom",
    subtitle: "6-12+ Months",
    description: "Smoking isn't the thing you're resisting anymore. It's just not part of the picture.",
    dayRangeLabel: "6-12+ Months",
    minDay: 180,
    bosses: [],
  },
];

export function chapterForDay(dayCount: number): ChapterDef {
  let match = CHAPTERS[0];
  for (const c of CHAPTERS) {
    if (dayCount >= c.minDay) match = c;
  }
  return match;
}

export function allBosses(): BossDef[] {
  return CHAPTERS.flatMap((c) => c.bosses);
}
