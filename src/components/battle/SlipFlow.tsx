"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/onboarding/Chip";
import { Field, inputClass } from "@/components/onboarding/Field";
import { IntensityPicker } from "@/components/battle/IntensityPicker";
import { useGameData } from "@/hooks/useGameData";
import { TRIGGERS } from "@/lib/config/triggers";
import { logSlip } from "@/lib/game/engine";
import { updateCravingEvent } from "@/lib/db/repo";
import { formatCurrency } from "@/lib/domain/calculations";
import { compareToContextBaseline, comparisonMessage } from "@/lib/domain/situational";
import type { SlipLearningTag, TriggerKey, SituationalContext } from "@/lib/domain/types";
import { CheckCircle2, Circle } from "lucide-react";

const TRIGGER_TO_CONTEXT: Partial<Record<TriggerKey, SituationalContext>> = {
  alcohol: "drinking",
  cannabis: "high",
};

const LEARNING_OPTIONS: { key: SlipLearningTag; label: string }[] = [
  { key: "unexpected_trigger", label: "Unexpected trigger" },
  { key: "social_pressure", label: "Social pressure" },
  { key: "stress", label: "Stress" },
  { key: "alcohol", label: "Alcohol" },
  { key: "availability", label: "Cigarettes were easily available" },
  { key: "no_coping_plan", label: "Didn't use a coping plan" },
  { key: "strong_withdrawal", label: "Strong withdrawal" },
  { key: "just_one_thought", label: 'Thought "just one"' },
  { key: "other", label: "Other" },
];

export function SlipFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cravingEventId = searchParams.get("cravingEventId");
  const data = useGameData();

  const [step, setStep] = useState<"details" | "reflection" | "done">("details");
  const [cigaretteCount, setCigaretteCount] = useState(1);
  const [trigger, setTrigger] = useState<TriggerKey>("stress");
  const [context, setContext] = useState("");
  const [intensity, setIntensity] = useState<number | undefined>(undefined);
  const [learnings, setLearnings] = useState<SlipLearningTag[]>([]);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function toggleLearning(key: SlipLearningTag) {
    setLearnings((ls) => (ls.includes(key) ? ls.filter((l) => l !== key) : [...ls, key]));
  }

  async function submit() {
    setSubmitting(true);
    try {
      const result = await logSlip({
        cigaretteCount,
        trigger,
        context: context.trim() || undefined,
        cravingIntensity: intensity,
        learnings,
        note: note.trim() || undefined,
      });
      if (cravingEventId) {
        await updateCravingEvent(cravingEventId, {
          outcome: "smoked",
          slipEventId: result.slipId,
          endingIntensity: intensity,
        });
      }
      setStep("done");
    } finally {
      setSubmitting(false);
    }
  }

  if (step === "done") {
    const currency = data.profile?.currency ?? "INR";
    return (
      <div className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center gap-6 px-6 text-center">
        <p className="text-2xl font-bold">You logged a slip.</p>
        <p className="max-w-sm text-[var(--fg-muted)]">
          You smoked. That&apos;s logged now — learn from it, and continue. Your progress below is still yours.
        </p>
        {TRIGGER_TO_CONTEXT[trigger] && (
          <p className="max-w-sm text-sm font-medium text-[var(--fg-muted)]">
            {comparisonMessage(
              TRIGGER_TO_CONTEXT[trigger]!,
              cigaretteCount,
              compareToContextBaseline(
                cigaretteCount,
                TRIGGER_TO_CONTEXT[trigger] === "drinking"
                  ? data.profile?.cigsWhenDrinkingBaseline
                  : data.profile?.cigsWhenHighBaseline
              )
            )}
          </p>
        )}
        <div className="grid w-full max-w-xs grid-cols-2 gap-3 text-left">
          <StatBox label="Current streak" value={`${data.stats?.currentStreakDays ?? 0}d`} />
          <StatBox label="Lifetime smoke-free" value={`${data.stats?.lifetimeSmokeFreeDays ?? 0}d`} />
          <StatBox label="Level" value={`${data.stats?.level ?? 1}`} />
          <StatBox label="Total XP" value={`${data.stats?.totalXp ?? 0}`} />
          <StatBox label="Money saved" value={formatCurrency(data.stats?.moneySaved ?? 0, currency)} />
          <StatBox label="Cravings defeated" value={`${data.stats?.cravingsDefeated ?? 0}`} />
        </div>
        <Button size="lg" onClick={() => router.push("/")}>
          Continue
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col px-5 py-6">
      {step === "details" && (
        <div className="flex flex-1 flex-col gap-5">
          <div>
            <h1 className="text-2xl font-bold">Log what happened</h1>
            <p className="mt-1 text-[var(--fg-muted)]">No judgment — just the facts, so we can learn from it.</p>
          </div>
          <Field label="How many cigarettes?">
            <input
              type="number"
              min={1}
              className={inputClass}
              value={cigaretteCount}
              onChange={(e) => setCigaretteCount(Math.max(1, Number(e.target.value)))}
            />
          </Field>
          <div>
            <p className="mb-2 text-sm font-semibold">What triggered it?</p>
            <div className="flex flex-wrap gap-2">
              {TRIGGERS.map((t) => (
                <Chip key={t.key} selected={trigger === t.key} onClick={() => setTrigger(t.key)}>
                  <span>{t.emoji}</span> {t.label}
                </Chip>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold">How strong was the craving? (optional)</p>
            <IntensityPicker value={intensity} onChange={setIntensity} />
          </div>
          <Field label="Context (optional)">
            <input className={inputClass} value={context} onChange={(e) => setContext(e.target.value)} placeholder="Where were you, what was happening?" />
          </Field>
          <Button size="lg" onClick={() => setStep("reflection")}>
            Continue
          </Button>
        </div>
      )}

      {step === "reflection" && (
        <div className="flex flex-1 flex-col gap-5">
          <div>
            <h1 className="text-2xl font-bold">What can we learn from this?</h1>
            <p className="mt-1 text-[var(--fg-muted)]">Select what applies.</p>
          </div>
          <ul className="space-y-2">
            {LEARNING_OPTIONS.map((opt) => (
              <li key={opt.key}>
                <button
                  onClick={() => toggleLearning(opt.key)}
                  className="flex w-full items-center gap-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3 text-left text-sm"
                >
                  {learnings.includes(opt.key) ? (
                    <CheckCircle2 size={20} className="shrink-0 text-[var(--success)]" />
                  ) : (
                    <Circle size={20} className="shrink-0 text-[var(--fg-subtle)]" />
                  )}
                  {opt.label}
                </button>
              </li>
            ))}
          </ul>
          <Field label="Anything else worth noting? (optional)">
            <textarea className={inputClass + " min-h-[80px]"} value={note} onChange={(e) => setNote(e.target.value)} />
          </Field>
          <Button size="lg" disabled={submitting} onClick={submit}>
            {submitting ? "Saving..." : "Save and continue"}
          </Button>
        </div>
      )}
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--border)] p-3">
      <p className="text-lg font-bold tabular-nums">{value}</p>
      <p className="text-[11px] text-[var(--fg-subtle)]">{label}</p>
    </div>
  );
}
