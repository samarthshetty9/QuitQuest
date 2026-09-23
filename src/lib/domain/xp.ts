import type { XPEvent } from "@/lib/domain/types";
import { levelInfoForTotalXp, type LevelInfo } from "@/lib/config/xp";

export function totalXpFromEvents(events: XPEvent[]): number {
  return events.reduce((sum, e) => sum + e.amount, 0);
}

export function levelFromEvents(events: XPEvent[]): LevelInfo {
  return levelInfoForTotalXp(totalXpFromEvents(events));
}

/** True if an XP event with this exact dedupe key has already been recorded. */
export function isDuplicateXpEvent(existing: XPEvent[], dedupeKey: string): boolean {
  return existing.some((e) => e.dedupeKey === dedupeKey);
}
