"use client";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, Circle } from "lucide-react";
import type { TriggerKey } from "@/lib/domain/types";

const SUGGESTIONS_BY_TRIGGER: Partial<Record<TriggerKey, string[]>> = {
  coffee: ["Drink your coffee somewhere different today", "Step outside for a minute", "Switch up your usual routine"],
  after_food: ["Stand up and leave the table", "Brush your teeth if you can", "Move to a different room"],
  parties: ["Move away from the smoking area", "Sit with non-smoking friends", "Step outside for fresh air instead"],
  alcohol: ["Stay near supportive, non-smoking people", "Switch to a non-alcoholic drink for a bit", "Step outside the smoking area"],
  other_smokers: ["Put some distance between you and the smoke", "Excuse yourself for a few minutes"],
  work_break: ["Take your break somewhere else today", "Change up your usual break routine"],
};

const DEFAULT_SUGGESTIONS = [
  "Leave the space that's cueing this craving",
  "Move to another room",
  "Remove cigarettes, lighters, or ashtrays nearby",
  "Change what you're doing right now",
];

export function EnvironmentIntervention({ trigger, onDone }: { trigger: TriggerKey; onDone: () => void }) {
  const suggestions = SUGGESTIONS_BY_TRIGGER[trigger] ?? DEFAULT_SUGGESTIONS;
  const [checked, setChecked] = useState<Set<number>>(new Set());

  return (
    <div className="flex flex-col gap-4 py-2">
      <p className="text-lg font-semibold">Change what&apos;s around you</p>
      <ul className="space-y-2">
        {suggestions.map((s, i) => (
          <li key={i}>
            <button
              onClick={() =>
                setChecked((c) => {
                  const next = new Set(c);
                  if (next.has(i)) next.delete(i);
                  else next.add(i);
                  return next;
                })
              }
              className="flex w-full items-center gap-3 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-3 text-left text-sm"
            >
              {checked.has(i) ? (
                <CheckCircle2 size={20} className="shrink-0 text-[var(--success)]" />
              ) : (
                <Circle size={20} className="shrink-0 text-[var(--fg-subtle)]" />
              )}
              {s}
            </button>
          </li>
        ))}
      </ul>
      <Button size="lg" onClick={onDone} disabled={checked.size === 0}>
        Done
      </Button>
    </div>
  );
}
