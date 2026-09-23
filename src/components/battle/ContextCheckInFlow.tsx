"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useGameData } from "@/hooks/useGameData";
import { logContextCheckIn } from "@/lib/game/engine";
import { compareToContextBaseline, comparisonMessage, isGoodContextOutcome } from "@/lib/domain/situational";
import type { SituationalContext } from "@/lib/domain/types";

const CONTEXT_OPTIONS: { key: SituationalContext; emoji: string; label: string; sub: string }[] = [
  { key: "drinking", emoji: "🍺", label: "I'm drinking", sub: "Log a drinking session" },
  { key: "high", emoji: "🌿", label: "I'm high", sub: "Log a session" },
];

export function ContextCheckInFlow() {
  const router = useRouter();
  const data = useGameData();
  const [step, setStep] = useState<"context" | "count" | "done">("context");
  const [context, setContext] = useState<SituationalContext | null>(null);
  const [count, setCount] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [xpAwarded, setXpAwarded] = useState(0);

  const baseline =
    context === "drinking"
      ? data.profile?.cigsWhenDrinkingBaseline
      : context === "high"
        ? data.profile?.cigsWhenHighBaseline
        : undefined;

  const comparison = context ? compareToContextBaseline(count, baseline) : null;

  async function submit() {
    if (!context) return;
    setSubmitting(true);
    try {
      const result = await logContextCheckIn({ context, cigaretteCount: count });
      setXpAwarded(result.xpAwarded);
      setStep("done");
    } finally {
      setSubmitting(false);
    }
  }

  if (step === "done" && context && comparison) {
    const good = isGoodContextOutcome(comparison);
    return (
      <div className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center gap-6 px-6 text-center">
        <p className={`text-2xl font-bold ${good ? "text-[var(--success)]" : "text-[var(--fg)]"}`}>
          {good ? "Logged — nice work." : "Logged."}
        </p>
        <p className="max-w-sm text-lg text-[var(--fg-muted)]">{comparisonMessage(context, count, comparison)}</p>
        {xpAwarded > 0 && (
          <p className="rounded-full bg-[var(--gold-soft)] px-4 py-1.5 text-sm font-bold text-[var(--gold)]">
            +{xpAwarded} XP
          </p>
        )}
        <Button size="lg" onClick={() => router.push("/")}>
          Done
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col px-5 py-6">
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => router.push("/")}
          aria-label="Close"
          className="rounded-full p-2 text-[var(--fg-subtle)] hover:bg-[var(--accent-soft)]"
        >
          <X size={22} />
        </button>
      </div>

      {step === "context" && (
        <div className="flex flex-1 flex-col gap-6">
          <div>
            <h1 className="text-2xl font-bold">What&apos;s going on?</h1>
            <p className="mt-1 text-[var(--fg-muted)]">Log a session anytime — even if it&apos;s zero.</p>
          </div>
          <div className="flex flex-col gap-3">
            {CONTEXT_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                onClick={() => {
                  setContext(opt.key);
                  setCount(0);
                  setStep("count");
                }}
                className="flex items-center gap-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-elevated)] px-5 py-4 text-left transition-transform hover:border-[var(--accent)] active:scale-[0.99]"
              >
                <span className="text-3xl">{opt.emoji}</span>
                <div>
                  <p className="text-lg font-bold">{opt.label}</p>
                  <p className="text-sm text-[var(--fg-muted)]">{opt.sub}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === "count" && context && (
        <div className="flex flex-1 flex-col gap-6">
          <div>
            <h1 className="text-2xl font-bold">How many cigarettes?</h1>
            <p className="mt-1 text-[var(--fg-muted)]">
              {typeof baseline === "number" && baseline > 0
                ? `Your usual for this is ${baseline}. Zero counts too.`
                : "No judgment — zero counts too."}
            </p>
          </div>
          <div className="flex items-center justify-center gap-6">
            <button
              aria-label="Decrease count"
              onClick={() => setCount((c) => Math.max(0, c - 1))}
              className="flex h-14 w-14 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] text-2xl font-bold transition-transform active:scale-95"
            >
              −
            </button>
            <span className="w-20 text-center text-6xl font-black tabular-nums">{count}</span>
            <button
              aria-label="Increase count"
              onClick={() => setCount((c) => c + 1)}
              className="flex h-14 w-14 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] text-2xl font-bold transition-transform active:scale-95"
            >
              +
            </button>
          </div>
          {comparison && (
            <p className="text-center text-sm font-medium text-[var(--fg-muted)]">
              {comparisonMessage(context, count, comparison)}
            </p>
          )}
          <Button size="lg" className="mt-auto" disabled={submitting} onClick={submit}>
            {submitting ? "Saving..." : "Save"}
          </Button>
        </div>
      )}
    </div>
  );
}
