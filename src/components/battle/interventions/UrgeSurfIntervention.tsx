"use client";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/onboarding/Chip";

const LOCATIONS = ["Mouth", "Throat", "Chest", "Stomach", "Hands", "Head", "General restlessness", "Other"];
const STEPS = [
  "Notice the sensation without trying to change it yet.",
  "Describe it to yourself — sharp, heavy, buzzing, tight — without judging it as good or bad.",
  "Breathe slowly. You don't have to fight it or obey it.",
  "Notice whether it's changing at all — even slightly.",
];

export function UrgeSurfIntervention({ onDone }: { onDone: () => void }) {
  const [location, setLocation] = useState<string | null>(null);
  const [step, setStep] = useState(0);

  if (!location) {
    return (
      <div className="flex flex-col gap-4 py-4 text-center">
        <p className="text-lg font-semibold">Where do you feel it?</p>
        <div className="flex flex-wrap justify-center gap-2">
          {LOCATIONS.map((loc) => (
            <Chip key={loc} selected={false} onClick={() => setLocation(loc)}>
              {loc}
            </Chip>
          ))}
        </div>
      </div>
    );
  }

  if (step < STEPS.length) {
    return (
      <div className="flex flex-col items-center gap-8 py-8 text-center">
        <div className="flex h-32 w-full max-w-xs items-end justify-center gap-1" aria-hidden>
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="w-2 rounded-full bg-[var(--accent)]"
              style={{
                height: `${30 + Math.sin(i * 0.5 + step) * 25 + 25}%`,
                animationName: "wave",
                animationDuration: "2s",
                animationTimingFunction: "ease-in-out",
                animationIterationCount: "infinite",
                animationDelay: `${i * 0.06}s`,
                opacity: 0.8,
              }}
            />
          ))}
        </div>
        <p className="max-w-xs text-base">{STEPS[step]}</p>
        <Button size="lg" onClick={() => setStep((s) => s + 1)}>
          {step === STEPS.length - 1 ? "I'm noticing it" : "Next"}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 py-8 text-center">
      <p className="text-lg font-semibold">You surfed it — you didn&apos;t have to obey it.</p>
      <p className="max-w-xs text-sm text-[var(--fg-muted)]">
        Cravings often rise and fall on their own. Not every one disappears immediately, and that&apos;s alright.
      </p>
      <Button size="lg" onClick={onDone}>
        Continue
      </Button>
    </div>
  );
}
