import type { SituationalContext } from "@/lib/domain/types";

export type ContextComparisonTone = "zero" | "better" | "same" | "worse" | "no_baseline";

export interface ContextComparison {
  tone: ContextComparisonTone;
  baseline?: number;
}

const CONTEXT_LABEL: Record<SituationalContext, string> = {
  drinking: "while drinking",
  high: "while high",
};

export function contextLabel(context: SituationalContext): string {
  return CONTEXT_LABEL[context];
}

/**
 * Compares a logged cigarette count against the user's own baseline for a
 * situational context (e.g. "how many do you usually smoke when drinking").
 * Never judges an above-baseline count beyond stating the fact — the copy
 * calling this should stay calm/non-judgmental per the app's tone.
 */
export function compareToContextBaseline(cigaretteCount: number, baseline: number | null | undefined): ContextComparison {
  const count = Math.max(0, cigaretteCount);
  if (baseline === null || baseline === undefined || baseline < 0) {
    return count === 0 ? { tone: "zero" } : { tone: "no_baseline" };
  }
  if (count === 0) return { tone: "zero", baseline };
  if (count < baseline) return { tone: "better", baseline };
  if (count === baseline) return { tone: "same", baseline };
  return { tone: "worse", baseline };
}

/** Whether this comparison is worth a small XP reward — at or below a real baseline, or zero with no baseline set. */
export function isGoodContextOutcome(comparison: ContextComparison): boolean {
  return comparison.tone === "zero" || comparison.tone === "better" || comparison.tone === "same";
}

export function comparisonMessage(context: SituationalContext, cigaretteCount: number, comparison: ContextComparison): string {
  const label = contextLabel(context);
  const count = Math.max(0, cigaretteCount);
  switch (comparison.tone) {
    case "zero":
      return comparison.baseline
        ? `0 cigarettes ${label} — down from your usual ${comparison.baseline}.`
        : `0 cigarettes ${label}. That's a win.`;
    case "better":
      return `${count} ${count === 1 ? "cigarette" : "cigarettes"} ${label} — down from your usual ${comparison.baseline}.`;
    case "same":
      return `${count} ${count === 1 ? "cigarette" : "cigarettes"} ${label} — about the same as usual.`;
    case "worse":
      return `${count} ${count === 1 ? "cigarette" : "cigarettes"} ${label}, more than your usual ${comparison.baseline}. Logged — no judgment, just data.`;
    case "no_baseline":
      return `${count} ${count === 1 ? "cigarette" : "cigarettes"} ${label}. Logged.`;
  }
}
