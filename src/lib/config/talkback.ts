export interface TalkBackThought {
  key: string;
  thought: string;
  response: string;
}

export const TALK_BACK_THOUGHTS: TalkBackThought[] = [
  {
    key: "need_one",
    thought: "I need one.",
    response: "That's the craving talking, not a fact. It will pass whether or not you act on it.",
  },
  {
    key: "one_wont_matter",
    thought: "One cigarette won't matter.",
    response: "One cigarette is how every relapse starts. The version of you who quit already knows this one matters.",
  },
  {
    key: "cant_focus",
    thought: "I can't focus until I smoke.",
    response: "The discomfort is withdrawal, not a focus problem. It fades faster than it feels like it will right now.",
  },
  {
    key: "deserve_one",
    thought: "I'm stressed and deserve one.",
    response: "You deserve relief — a cigarette just isn't actually relief, it's a habit loop. Pick a real one instead.",
  },
  {
    key: "already_made_it",
    thought: "I've already made it this far so one is fine.",
    response: "The distance you've covered is exactly what makes it worth protecting, not spending.",
  },
  {
    key: "too_strong",
    thought: "This craving is too strong.",
    response: "Strong cravings still peak and fade, usually within minutes. You've gotten through strong ones before.",
  },
];
