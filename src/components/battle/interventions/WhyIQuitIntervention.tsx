"use client";
import { useLiveQuery } from "dexie-react-hooks";
import { Button } from "@/components/ui/Button";
import { getDB } from "@/lib/db/db";
import { CURRENT_USER_ID } from "@/lib/db/repo";
import { formatCurrency } from "@/lib/domain/calculations";
import { Heart } from "lucide-react";

export function WhyIQuitIntervention({
  onDone,
  moneySaved,
  currency,
  streakDays,
}: {
  onDone: () => void;
  moneySaved: number;
  currency: string;
  streakDays: number;
}) {
  const reasons = useLiveQuery(() => getDB().reasonsForQuitting.where({ userId: CURRENT_USER_ID }).toArray(), []) ?? [];
  const message = useLiveQuery(() => getDB().futureSelfMessages.get(CURRENT_USER_ID), []);

  return (
    <div className="flex flex-col gap-4 py-2">
      <div className="flex items-center gap-2">
        <Heart className="text-[var(--danger)]" size={22} />
        <p className="text-lg font-semibold">Why you started this</p>
      </div>

      {message?.message && (
        <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--accent-soft)] p-4 text-sm italic text-[var(--accent-strong)]">
          &ldquo;{message.message}&rdquo;
        </div>
      )}

      {reasons.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {reasons.map((r) => (
            <span
              key={r.id}
              className="rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-1.5 text-xs font-medium"
            >
              {r.customText || r.label}
            </span>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 text-center">
        <div className="rounded-[var(--radius-md)] border border-[var(--border)] p-3">
          <p className="text-xl font-bold tabular-nums">{streakDays}</p>
          <p className="text-xs text-[var(--fg-subtle)]">days smoke-free</p>
        </div>
        <div className="rounded-[var(--radius-md)] border border-[var(--border)] p-3">
          <p className="text-xl font-bold tabular-nums">{formatCurrency(moneySaved, currency)}</p>
          <p className="text-xs text-[var(--fg-subtle)]">saved so far</p>
        </div>
      </div>

      <Button size="lg" onClick={onDone}>
        I remember why
      </Button>
    </div>
  );
}
