"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChromeShell, ChromeMain, ChromeHeader, ChromeFooter } from "@/components/onboarding/arcade/Chrome";
import { Step1Welcome } from "@/components/onboarding/arcade/steps/Step1Welcome";
import { Step2QuitTiming } from "@/components/onboarding/arcade/steps/Step2QuitTiming";
import { Step3Baseline } from "@/components/onboarding/arcade/steps/Step3Baseline";
import { Step4Situational } from "@/components/onboarding/arcade/steps/Step4Situational";
import { Step4QuitHistory } from "@/components/onboarding/arcade/steps/Step4QuitHistory";
import { Step5Triggers } from "@/components/onboarding/arcade/steps/Step5Triggers";
import { Step6CoreDrivers } from "@/components/onboarding/arcade/steps/Step6CoreDrivers";
import { Step7FutureSelf } from "@/components/onboarding/arcade/steps/Step7FutureSelf";
import { Step8Arsenal } from "@/components/onboarding/arcade/steps/Step8Arsenal";
import { Step9Review } from "@/components/onboarding/arcade/steps/Step9Review";
import { makeId } from "@/lib/domain/id";
import { nowISO } from "@/lib/time/clock";
import * as repo from "@/lib/db/repo";
import type {
  TriggerKey,
  ReasonKey,
  TreatmentKind,
  InterventionKey,
  UserProfile,
} from "@/lib/domain/types";

const TOTAL_STEPS = 10;

const WAKING_MINUTES: Record<"critical" | "high" | "medium" | "low", number> = {
  critical: 3,
  high: 15,
  medium: 45,
  low: 75,
};

const ATTEMPTS_VALUE: Record<"first" | "1-2" | "3-5" | "5+", number> = {
  first: 0,
  "1-2": 2,
  "3-5": 4,
  "5+": 6,
};

const STREAK_MULTIPLIER: Record<"DAYS" | "WEEKS" | "MONTHS", number> = {
  DAYS: 1,
  WEEKS: 7,
  MONTHS: 30,
};

const ARSENAL_LABELS: Partial<Record<InterventionKey, string>> = {
  water: "Cold ice water",
  breathing_2: "Box breathing",
  distraction_tap: "Quick game",
  walk_5: "Brisk walk",
  urge_surf: "Urge surfing",
  social_support: "Call a friend",
  oral_substitute: "Chew gum / mints",
};

const STEP_CTA_LABELS: Record<number, string> = {
  2: "Continue",
  3: "Continue Quest",
  4: "Continue",
  5: "Continue Quest",
  6: "Continue",
  7: "Continue",
  8: "Continue Quest",
  9: "Continue",
};

interface WizardState {
  nickname: string;
  quitTiming: "now" | "future";
  futureDaysOffset: number;
  cigarettesPerDay: number;
  cigarettesPerPack: number;
  pricePerPack: number;
  currency: string;
  yearsSmoked: number;
  wakingUrgency: "critical" | "high" | "medium" | "low";
  minutesPerSmokingEvent: number;
  cigsWhenDrinking: number | null;
  cigsWhenHigh: number | null;
  attemptsBucket: "first" | "1-2" | "3-5" | "5+";
  streakValue: number;
  streakUnit: "DAYS" | "WEEKS" | "MONTHS";
  triggers: TriggerKey[];
  customTriggers: string[];
  reasons: ReasonKey[];
  customReasons: string[];
  futureSelfMessage: string;
  arsenal: InterventionKey[];
  treatments: TreatmentKind[];
}

function defaultCurrency(): string {
  if (typeof navigator === "undefined") return "INR";
  const lang = navigator.language || "en-IN";
  if (lang.includes("IN")) return "INR";
  if (lang.includes("GB")) return "GBP";
  if (lang.includes("US")) return "USD";
  try {
    const region = new Intl.Locale(lang).region;
    if (region === "IN") return "INR";
    if (region === "GB") return "GBP";
    if (region === "US") return "USD";
  } catch {
    // ignore
  }
  return "USD";
}

const CURRENCY_SYMBOL: Record<string, string> = { USD: "$", GBP: "£", EUR: "€", INR: "₹", CAD: "$" };

function launchConfetti(overlay: HTMLDivElement) {
  overlay.innerHTML = "";
  overlay.style.opacity = "1";
  const colors = ["#cabeff", "#4edea3", "#4cd7f6", "#947dff", "#ffffff"];
  for (let i = 0; i < 36; i++) {
    const particle = document.createElement("div");
    const color = colors[Math.floor(Math.random() * colors.length)];
    const size = Math.random() * 8 + 4;
    const x = window.innerWidth / 2;
    const y = window.innerHeight - 100;
    const destX = (Math.random() - 0.5) * window.innerWidth * 0.9;
    const destY = -Math.random() * (window.innerHeight * 0.7);
    Object.assign(particle.style, {
      position: "absolute",
      left: `${x}px`,
      top: `${y}px`,
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: "50%",
      backgroundColor: color,
      boxShadow: `0 0 12px ${color}`,
      transition: "transform 900ms cubic-bezier(0.1, 0.8, 0.3, 1), opacity 900ms ease-out",
      pointerEvents: "none",
      zIndex: "999",
    });
    overlay.appendChild(particle);
    setTimeout(() => {
      particle.style.transform = `translate(${destX}px, ${destY}px) scale(${Math.random() * 0.6 + 0.4})`;
      particle.style.opacity = "0";
    }, 20);
  }
  setTimeout(() => {
    overlay.style.opacity = "0";
  }, 1000);
}

export function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<WizardState>(() => ({
    nickname: "",
    quitTiming: "now",
    futureDaysOffset: 3,
    cigarettesPerDay: 10,
    cigarettesPerPack: 20,
    pricePerPack: 200,
    currency: defaultCurrency(),
    yearsSmoked: 5,
    wakingUrgency: "high",
    minutesPerSmokingEvent: 6,
    cigsWhenDrinking: null,
    cigsWhenHigh: null,
    attemptsBucket: "1-2",
    streakValue: 14,
    streakUnit: "DAYS",
    triggers: ["coffee"],
    customTriggers: [],
    reasons: ["health", "freedom", "money"],
    customReasons: [],
    futureSelfMessage: "",
    arsenal: ["water", "breathing_2", "distraction_tap", "oral_substitute"],
    treatments: ["gum"],
  }));

  const update = <K extends keyof WizardState>(key: K, value: WizardState[K]) =>
    setState((s) => ({ ...s, [key]: value }));

  const toggleIn = <T,>(arr: T[], value: T): T[] => (arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]);

  const canProceed = step === 1 ? state.nickname.trim().length > 0 : true;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  const { yearlyWealth, timeSalvagedDays } = useMemo(() => {
    const cigs = Math.max(1, state.cigarettesPerDay || 1);
    const packSize = Math.max(1, state.cigarettesPerPack || 20);
    const packPrice = Math.max(0.1, state.pricePerPack || 10);
    const minPerSmoke = Math.max(1, state.minutesPerSmokingEvent || 6);
    const costPerCig = packPrice / packSize;
    const yearlySpend = Math.round(costPerCig * cigs * 365);
    const totalMinPerYear = cigs * minPerSmoke * 365;
    const days = (totalMinPerYear / 1440).toFixed(1);
    const symbol = CURRENCY_SYMBOL[state.currency] ?? "$";
    return { yearlyWealth: `${symbol}${yearlySpend.toLocaleString()}`, timeSalvagedDays: days };
  }, [state.cigarettesPerDay, state.cigarettesPerPack, state.pricePerPack, state.minutesPerSmokingEvent, state.currency]);

  function goNext() {
    if (step < TOTAL_STEPS) setStep((s) => s + 1);
  }
  function goBack() {
    if (step > 1) setStep((s) => s - 1);
    else router.push("/");
  }

  async function finish() {
    setSubmitting(true);
    try {
      const quitDate =
        state.quitTiming === "now"
          ? new Date()
          : (() => {
              const d = new Date();
              d.setDate(d.getDate() + state.futureDaysOffset);
              d.setHours(0, 0, 0, 0);
              return d;
            })();
      const quitISO = quitDate.toISOString();

      const profile: UserProfile = {
        id: repo.CURRENT_USER_ID,
        nickname: state.nickname.trim() || "Rebel",
        createdAt: nowISO(),
        smokingStatus: state.quitTiming === "now" ? "quit" : "smoker",
        cigarettesPerDayBaseline: state.cigarettesPerDay,
        cigarettesPerPack: state.cigarettesPerPack,
        pricePerPack: state.pricePerPack,
        currency: state.currency,
        yearsSmoked: state.yearsSmoked,
        minutesToFirstCigarette: WAKING_MINUTES[state.wakingUrgency],
        previousQuitAttempts: ATTEMPTS_VALUE[state.attemptsBucket],
        longestPreviousQuitDays: state.streakValue * STREAK_MULTIPLIER[state.streakUnit],
        minutesPerSmokingEvent: state.minutesPerSmokingEvent,
        onboardingComplete: true,
        demoMode: false,
        commonTriggers: state.triggers,
        cigsWhenDrinkingBaseline: state.cigsWhenDrinking,
        cigsWhenHighBaseline: state.cigsWhenHigh,
      };
      await repo.saveUserProfile(profile);
      await repo.createQuitAttempt(quitISO);

      const reasons = [
        ...state.reasons.map((key) => ({
          id: makeId("reason"),
          userId: repo.CURRENT_USER_ID,
          key,
          label:
            key === "health"
              ? "Vital Health"
              : key === "freedom"
                ? "True Freedom"
                : key === "money"
                  ? "Wealth & Bank"
                  : key === "family"
                    ? "Family & Loved Ones"
                    : key === "fitness"
                      ? "Peak Fitness"
                      : key === "control"
                        ? "Mental Control"
                        : key === "smell"
                          ? "Smell & Freshness"
                          : key === "personal_promise"
                            ? "A Promise to Myself"
                            : key,
        })),
        ...state.customReasons.map((text) => ({
          id: makeId("reason"),
          userId: repo.CURRENT_USER_ID,
          key: "custom" as ReasonKey,
          label: text,
          customText: text,
        })),
      ];
      await repo.saveReasons(reasons);

      if (state.futureSelfMessage.trim()) {
        await repo.saveFutureSelfMessage(state.futureSelfMessage.trim());
      }

      await repo.saveCopingPreferences({
        userId: repo.CURRENT_USER_ID,
        favoriteInterventions: state.arsenal,
        talkBackResponses: [],
      });

      for (const t of state.treatments) {
        await repo.createTreatmentLog({
          kind: t,
          label: t.charAt(0).toUpperCase() + t.slice(1),
          loggedAt: nowISO(),
        });
      }

      await repo.saveAppSettings({
        userId: repo.CURRENT_USER_ID,
        theme: "system",
        reducedMotion: false,
        notificationsEnabled: false,
        currency: state.currency,
        demoMode: false,
      });

      router.push("/");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleFinalLaunch() {
    if (overlayRef.current) launchConfetti(overlayRef.current);
    await finish();
  }

  const ctaLabel = step === TOTAL_STEPS ? (submitting ? "Launching..." : "Start My Quest") : (STEP_CTA_LABELS[step] ?? "Continue");

  return (
    <ChromeShell>
      <div ref={overlayRef} className="pointer-events-none fixed inset-0 z-[60] overflow-hidden opacity-0 transition-opacity duration-700" />

      {step === 1 ? (
        <Step1Welcome nickname={state.nickname} onChange={(v) => update("nickname", v)} onContinue={goNext} />
      ) : (
        <>
          <ChromeHeader step={step} totalSteps={TOTAL_STEPS} onBack={goBack} onClose={() => router.push("/")} avatarInitial={state.nickname} />
          <ChromeMain>
            {step === 2 && (
              <Step2QuitTiming
                quitTiming={state.quitTiming}
                onSetTiming={(v) => update("quitTiming", v)}
                futureDaysOffset={state.futureDaysOffset}
                onSetDaysOffset={(v) => update("futureDaysOffset", v)}
              />
            )}
            {step === 3 && (
              <Step3Baseline
                cigarettesPerDay={state.cigarettesPerDay}
                onSetCigsPerDay={(v) => update("cigarettesPerDay", v)}
                cigarettesPerPack={state.cigarettesPerPack}
                onSetCigsPerPack={(v) => update("cigarettesPerPack", v)}
                pricePerPack={state.pricePerPack}
                onSetPricePerPack={(v) => update("pricePerPack", v)}
                currency={state.currency}
                onSetCurrency={(v) => update("currency", v)}
                yearsSmoked={state.yearsSmoked}
                onSetYearsSmoked={(v) => update("yearsSmoked", v)}
                wakingUrgency={state.wakingUrgency}
                onSetWakingUrgency={(v) => update("wakingUrgency", v)}
                minutesPerSmokingEvent={state.minutesPerSmokingEvent}
                onSetMinutesPerSmokingEvent={(v) => update("minutesPerSmokingEvent", v)}
              />
            )}
            {step === 4 && (
              <Step4Situational
                cigsWhenDrinking={state.cigsWhenDrinking}
                onSetCigsWhenDrinking={(v) => update("cigsWhenDrinking", v)}
                cigsWhenHigh={state.cigsWhenHigh}
                onSetCigsWhenHigh={(v) => update("cigsWhenHigh", v)}
              />
            )}
            {step === 5 && (
              <Step4QuitHistory
                attemptsBucket={state.attemptsBucket}
                onSetAttemptsBucket={(v) => update("attemptsBucket", v)}
                streakValue={state.streakValue}
                onSetStreakValue={(v) => update("streakValue", v)}
                streakUnit={state.streakUnit}
                onSetStreakUnit={(v) => update("streakUnit", v)}
              />
            )}
            {step === 6 && (
              <Step5Triggers
                triggers={state.triggers}
                onToggle={(key) => update("triggers", toggleIn(state.triggers, key))}
                customTriggers={state.customTriggers}
                onAddCustom={(label) => update("customTriggers", [...state.customTriggers, label])}
              />
            )}
            {step === 7 && (
              <Step6CoreDrivers
                reasons={state.reasons}
                onToggle={(key) => update("reasons", toggleIn(state.reasons, key))}
                moneySavedPreview={yearlyWealth}
              />
            )}
            {step === 8 && <Step7FutureSelf message={state.futureSelfMessage} onChange={(v) => update("futureSelfMessage", v)} />}
            {step === 9 && (
              <Step8Arsenal
                arsenal={state.arsenal}
                onToggleWeapon={(key) => update("arsenal", toggleIn(state.arsenal, key))}
                treatments={state.treatments}
                onToggleTreatment={(key) => update("treatments", toggleIn(state.treatments, key))}
              />
            )}
            {step === 10 && (
              <Step9Review
                nickname={state.nickname}
                quitTiming={state.quitTiming}
                futureDaysOffset={state.futureDaysOffset}
                yearlyWealth={yearlyWealth}
                timeSalvagedDays={timeSalvagedDays}
                reasons={state.reasons}
                customReasons={state.customReasons}
                futureSelfMessage={state.futureSelfMessage}
                arsenalCount={state.arsenal.length}
                arsenalLabels={state.arsenal.map((a) => ARSENAL_LABELS[a] ?? a)}
              />
            )}
          </ChromeMain>
          <ChromeFooter
            ctaLabel={ctaLabel}
            disabled={!canProceed || submitting}
            onContinue={step === TOTAL_STEPS ? handleFinalLaunch : goNext}
            onSkip={step === TOTAL_STEPS ? undefined : goNext}
          />
        </>
      )}
    </ChromeShell>
  );
}
