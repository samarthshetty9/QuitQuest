import { getHours, isAfter, subDays, format } from "date-fns";
import type { CravingEvent, TriggerKey } from "@/lib/domain/types";
import { triggerLabel } from "@/lib/config/triggers";

export const MIN_EVENTS_FOR_INSIGHT = 5;
export const MIN_EVENTS_FOR_TIME_WINDOW_INSIGHT = 5;
export const MIN_EVENTS_FOR_TREND_INSIGHT = 6;

export interface Insight {
  key: string;
  text: string;
}

/**
 * Deterministic, no-AI insight generation. Every insight requires a minimum
 * sample size so we never claim a "pattern" from one or two data points.
 */
export function generateInsights(events: CravingEvent[], now: Date): Insight[] {
  const insights: Insight[] = [];
  if (events.length < MIN_EVENTS_FOR_INSIGHT) return insights;

  // Most common time window
  if (events.length >= MIN_EVENTS_FOR_TIME_WINDOW_INSIGHT) {
    const windowCounts = new Map<string, number>();
    for (const e of events) {
      const h = getHours(new Date(e.createdAt));
      const w = timeWindowLabel(h);
      windowCounts.set(w, (windowCounts.get(w) ?? 0) + 1);
    }
    const top = [...windowCounts.entries()].sort((a, b) => b[1] - a[1])[0];
    if (top && top[1] / events.length >= 0.3) {
      insights.push({
        key: "top_time_window",
        text: `Most of your cravings happen ${top[0]}.`,
      });
    }
  }

  // Trigger distribution
  const triggerCounts = new Map<TriggerKey, number>();
  for (const e of events) triggerCounts.set(e.trigger, (triggerCounts.get(e.trigger) ?? 0) + 1);
  const topTrigger = [...triggerCounts.entries()].sort((a, b) => b[1] - a[1])[0];
  if (topTrigger && topTrigger[1] >= MIN_EVENTS_FOR_INSIGHT) {
    const pct = Math.round((topTrigger[1] / events.length) * 100);
    insights.push({
      key: "top_trigger",
      text: `${triggerLabel(topTrigger[0])} accounts for ${pct}% of your logged cravings.`,
    });
  }

  // Frequency trend over the last two weeks vs the two weeks before that
  if (events.length >= MIN_EVENTS_FOR_TREND_INSIGHT) {
    const twoWeeksAgo = subDays(now, 14);
    const fourWeeksAgo = subDays(now, 28);
    const recent = events.filter((e) => isAfter(new Date(e.createdAt), twoWeeksAgo));
    const prior = events.filter(
      (e) => isAfter(new Date(e.createdAt), fourWeeksAgo) && !isAfter(new Date(e.createdAt), twoWeeksAgo)
    );
    if (recent.length >= 3 && prior.length >= 3) {
      if (recent.length < prior.length) {
        insights.push({
          key: "frequency_declining",
          text: "Your logged cravings have become less frequent over the last two weeks.",
        });
      } else if (recent.length > prior.length * 1.3) {
        insights.push({
          key: "frequency_rising",
          text: "You've logged more cravings in the last two weeks than the two before — that's worth noticing, not worrying about.",
        });
      }
    }
  }

  // Day-of-week pattern
  const dayCounts = new Map<string, number>();
  for (const e of events) {
    const d = new Date(e.createdAt);
    const key = `${format(d, "EEEE")}-${timeWindowLabel(getHours(d))}`;
    dayCounts.set(key, (dayCounts.get(key) ?? 0) + 1);
  }
  const topDay = [...dayCounts.entries()].sort((a, b) => b[1] - a[1])[0];
  if (topDay && topDay[1] >= 3 && topDay[1] / events.length >= 0.2) {
    const [day, window] = topDay[0].split("-");
    insights.push({
      key: "top_day_window",
      text: `${day} ${window} has been your most common craving period.`,
    });
  }

  return insights;
}

function timeWindowLabel(hour: number): string {
  if (hour < 5) return "late at night";
  if (hour < 11) return "in the morning";
  if (hour < 14) return "around midday";
  if (hour < 17) return "in the afternoon";
  if (hour < 21) return "in the evening";
  return "late at night";
}
