"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/onboarding/Chip";
import { IntensityPicker, intensityColor } from "@/components/battle/IntensityPicker";
import { InterventionRunner } from "@/components/battle/InterventionRunner";
import { useGameData } from "@/hooks/useGameData";
import { TRIGGERS } from "@/lib/config/triggers";
import { interventionDef } from "@/lib/config/interventions";
import { rankInterventionsForTrigger } from "@/lib/domain/personalization";
import {
  startCravingBattle,
  beginIntervention,
  completeIntervention,
  finishCravingBattle,
} from "@/lib/game/engine";
import { formatCurrency } from "@/lib/domain/calculations";
import { compareToContextBaseline, comparisonMessage } from "@/lib/domain/situational";
import type { InterventionKey, TriggerKey, SituationalContext } from "@/lib/domain/types";

const TRIGGER_TO_CONTEXT: Partial<Record<TriggerKey, SituationalContext>> = {
  alcohol: "drinking",
  cannabis: "high",
};

type Step = "intensity" | "trigger" | "recommend" | "intervention" | "reassess" | "interstitial" | "complete";

export function CravingFlow() {
  const router = useRouter();
  const data = useGameData();
  const [step, setStep] = useState<Step>("intensity");
  const [startingIntensity, setStartingIntensity] = useState<number | null>(null);
  const [trigger, setTrigger] = useState<TriggerKey | null>(null);
  const [cravingEventId, setCravingEventId] = useState<string | null>(null);
  const [currentIntensity, setCurrentIntensity] = useState<number>(0);
  const [activeIntervention, setActiveIntervention] = useState<InterventionKey | null>(null);
  const [activeResultId, setActiveResultId] = useState<string | null>(null);
  const [activeStartedAt, setActiveStartedAt] = useState<number>(0);
  const [chain, setChain] = useState<Array<{ intervention: InterventionKey; before: number; after: number }>>([]);
  const [interstitialTone, setInterstitialTone] = useState<"turning" | "strong">("turning");
  const [finalXp, setFinalXp] = useState(0);

  const isDriving = trigger === "driving";
  const currency = data.profile?.currency ?? "INR";

  const rankedInterventions = useMemo(() => {
    if (!trigger) return [];
    // Exclude the in-progress event's own (still-forming) results from personalization input.
    const history = data.cravingEvents.filter((e) => e.id !== cravingEventId);
    return rankInterventionsForTrigger(history, trigger, isDriving);
  }, [trigger, data.cravingEvents, cravingEventId, isDriving]);

  const orderedTriggers = useMemo(() => {
    const counts = new Map<TriggerKey, number>();
    for (const e of data.cravingEvents) counts.set(e.trigger, (counts.get(e.trigger) ?? 0) + 1);
    return [...TRIGGERS].sort((a, b) => (counts.get(b.key) ?? 0) - (counts.get(a.key) ?? 0));
  }, [data.cravingEvents]);

  async function selectTrigger(key: TriggerKey) {
    setTrigger(key);
    if (startingIntensity === null) return;
    const event = await startCravingBattle({ startingIntensity, trigger: key });
    setCravingEventId(event.id);
    setCurrentIntensity(startingIntensity);
    setStep("recommend");
  }

  async function chooseIntervention(key: InterventionKey) {
    if (!cravingEventId) return;
    const result = await beginIntervention(cravingEventId, key, currentIntensity);
    setActiveIntervention(key);
    setActiveResultId(result.id);
    setActiveStartedAt(Date.now());
    setStep("intervention");
  }

  async function onInterventionDone() {
    setStep("reassess");
  }

  async function submitReassess(rating: number) {
    if (!cravingEventId || !activeResultId || !activeIntervention) return;
    const duration = Math.max(1, Math.round((Date.now() - activeStartedAt) / 1000));
    await completeIntervention(cravingEventId, activeResultId, rating, duration);
    setChain((c) => [...c, { intervention: activeIntervention, before: currentIntensity, after: rating }]);
    const before = currentIntensity;
    setCurrentIntensity(rating);

    if (rating <= 2) {
      await finish("resolved");
      return;
    }
    const reduction = before - rating;
    if (reduction >= 3) {
      setInterstitialTone("turning");
      setStep("interstitial");
    } else {
      setInterstitialTone("strong");
      setStep("interstitial");
    }
  }

  async function finish(outcome: "resolved" | "abandoned") {
    if (!cravingEventId) return;
    const result = await finishCravingBattle(cravingEventId, outcome);
    setFinalXp(result.xpAwarded);
    setStep("complete");
  }

  function goSmoked() {
    if (cravingEventId) {
      router.push(`/battle/slip?cravingEventId=${cravingEventId}`);
    } else {
      router.push("/battle/slip");
    }
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
        {step !== "intensity" && step !== "complete" && (
          <button onClick={goSmoked} className="text-sm font-medium text-[var(--danger)]">
            I smoked
          </button>
        )}
      </div>

      {isDriving && step !== "intensity" && step !== "complete" && (
        <div className="mb-4 flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--danger)] bg-[var(--danger-soft)] px-4 py-3 text-sm font-medium text-[var(--danger)]">
          <AlertTriangle size={18} className="shrink-0" />
          If you&apos;re currently driving, don&apos;t interact with the screen. Pull over first, or just listen.
        </div>
      )}

      {step === "intensity" && (
        <div className="flex flex-1 flex-col gap-6">
          <div>
            <h1 className="text-2xl font-bold">How strong is it?</h1>
            <p className="mt-1 text-[var(--fg-muted)]">Tap the number that feels right.</p>
          </div>
          <IntensityPicker value={startingIntensity ?? undefined} onChange={setStartingIntensity} />
          <Button
            size="xl"
            className="mt-auto"
            disabled={startingIntensity === null}
            onClick={() => setStep("trigger")}
          >
            Continue
          </Button>
        </div>
      )}

      {step === "trigger" && (
        <div className="flex flex-1 flex-col gap-6">
          <div>
            <h1 className="text-2xl font-bold">What triggered it?</h1>
            <p className="mt-1 text-[var(--fg-muted)]">Pick the closest match.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {orderedTriggers.map((t) => (
              <Chip key={t.key} selected={trigger === t.key} onClick={() => selectTrigger(t.key)}>
                <span>{t.emoji}</span> {t.label}
              </Chip>
            ))}
          </div>
        </div>
      )}

      {step === "recommend" && trigger && (
        <div className="flex flex-1 flex-col gap-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--fg-subtle)]">Craving Battle</p>
            <div className="mt-1 flex items-center gap-3">
              <span
                className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
                style={{ background: intensityColor(currentIntensity) }}
              >
                {currentIntensity}
              </span>
              <span className="text-lg font-bold capitalize">{trigger.replace(/_/g, " ")}</span>
            </div>
          </div>

          {rankedInterventions[0] && (
            <button
              onClick={() => chooseIntervention(rankedInterventions[0].intervention)}
              className="rounded-[var(--radius-lg)] border-2 border-[var(--accent)] bg-[var(--accent-soft)] px-5 py-4 text-left transition-transform active:scale-[0.99]"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--accent-strong)]">
                {rankedInterventions[0].reason === "personalized" ? "Worked well for you before" : "Recommended"}
              </p>
              <p className="mt-1 flex items-center gap-2 text-lg font-bold">
                <span>{interventionDef(rankedInterventions[0].intervention).emoji}</span>
                {interventionDef(rankedInterventions[0].intervention).label}
              </p>
            </button>
          )}

          <div>
            <p className="mb-2 text-sm font-semibold text-[var(--fg-muted)]">Choose your move</p>
            <div className="grid grid-cols-2 gap-2.5">
              {rankedInterventions.slice(1, 7).map((r) => {
                const def = interventionDef(r.intervention);
                return (
                  <button
                    key={r.intervention}
                    onClick={() => chooseIntervention(r.intervention)}
                    className="flex flex-col items-start gap-1 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3 text-left transition-colors hover:border-[var(--accent)]"
                  >
                    <span className="text-xl">{def.emoji}</span>
                    <span className="text-sm font-semibold">{def.shortLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {step === "intervention" && activeIntervention && trigger && (
        <div className="flex flex-1 flex-col">
          <InterventionRunner
            intervention={activeIntervention}
            trigger={trigger}
            moneySaved={data.stats?.moneySaved ?? 0}
            currency={currency}
            streakDays={data.stats?.currentStreakDays ?? 0}
            onDone={onInterventionDone}
          />
        </div>
      )}

      {step === "reassess" && (
        <div className="flex flex-1 flex-col gap-6">
          <div>
            <h1 className="text-2xl font-bold">How strong is it now?</h1>
            <p className="mt-1 text-[var(--fg-muted)]">Be honest — this helps us learn what works for you.</p>
          </div>
          <IntensityPicker onChange={submitReassess} />
        </div>
      )}

      {step === "interstitial" && (
        <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
          {interstitialTone === "turning" ? (
            <>
              <p className="text-2xl font-bold">Battle turning in your favour.</p>
              <p className="max-w-xs text-[var(--fg-muted)]">
                Intensity dropped from {chain[chain.length - 1]?.before} to {chain[chain.length - 1]?.after}.
              </p>
              <div className="flex w-full max-w-xs flex-col gap-3">
                <Button size="lg" onClick={() => finish("resolved")}>
                  I&apos;m good, finish
                </Button>
                <Button size="lg" variant="secondary" onClick={() => setStep("recommend")}>
                  Keep going
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-2xl font-bold">Still strong. That&apos;s okay.</p>
              <p className="max-w-xs text-[var(--fg-muted)]">
                It hasn&apos;t let up much yet — let&apos;s try a different approach.
              </p>
              <Button size="lg" onClick={() => setStep("recommend")}>
                Try another method
              </Button>
            </>
          )}
        </div>
      )}

      {step === "complete" && (
        <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
          <div className="animate-pop-in">
            <p className="text-3xl font-black text-[var(--success)]">CRAVING DEFEATED</p>
          </div>
          <div className="flex gap-6 text-sm">
            <div>
              <p className="text-xs text-[var(--fg-subtle)]">Started</p>
              <p className="text-xl font-bold tabular-nums">{startingIntensity}/10</p>
            </div>
            <div>
              <p className="text-xs text-[var(--fg-subtle)]">Now</p>
              <p className="text-xl font-bold tabular-nums">{currentIntensity}/10</p>
            </div>
          </div>
          {trigger && (
            <p className="text-sm text-[var(--fg-muted)]">
              Trigger: <span className="font-semibold capitalize text-[var(--fg)]">{trigger.replace(/_/g, " ")}</span>
            </p>
          )}
          {trigger && TRIGGER_TO_CONTEXT[trigger] && (
            <p className="max-w-xs text-sm font-medium text-[var(--success)]">
              {comparisonMessage(
                TRIGGER_TO_CONTEXT[trigger]!,
                0,
                compareToContextBaseline(
                  0,
                  TRIGGER_TO_CONTEXT[trigger] === "drinking"
                    ? data.profile?.cigsWhenDrinkingBaseline
                    : data.profile?.cigsWhenHighBaseline
                )
              )}
            </p>
          )}
          {chain.length > 0 && (
            <p className="text-sm text-[var(--fg-muted)]">
              What helped: <span className="font-semibold text-[var(--fg)]">{interventionDef(chain[chain.length - 1].intervention).label}</span>
            </p>
          )}
          <p className="rounded-full bg-[var(--gold-soft)] px-4 py-1.5 text-sm font-bold text-[var(--gold)]">
            +{finalXp} XP
          </p>
          {data.stats && (
            <p className="text-xs text-[var(--fg-subtle)]">
              {formatCurrency(data.stats.moneySaved, currency)} saved so far &middot; {data.stats.cravingsDefeated} cravings defeated
            </p>
          )}
          <Button size="lg" onClick={() => router.push("/")}>
            Done
          </Button>
        </div>
      )}
    </div>
  );
}
