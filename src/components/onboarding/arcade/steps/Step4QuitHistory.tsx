"use client";
import { Icon } from "@/components/onboarding/arcade/Icon";
import { cn } from "@/lib/utils";

const ATTEMPT_OPTIONS: { key: "first" | "1-2" | "3-5" | "5+"; label: string }[] = [
  { key: "first", label: "First time" },
  { key: "1-2", label: "1 – 2 times" },
  { key: "3-5", label: "3 – 5 times" },
  { key: "5+", label: "5+ times" },
];

const UNITS: Array<"DAYS" | "WEEKS" | "MONTHS"> = ["DAYS", "WEEKS", "MONTHS"];

export function Step4QuitHistory({
  attemptsBucket,
  onSetAttemptsBucket,
  streakValue,
  onSetStreakValue,
  streakUnit,
  onSetStreakUnit,
}: {
  attemptsBucket: "first" | "1-2" | "3-5" | "5+";
  onSetAttemptsBucket: (v: "first" | "1-2" | "3-5" | "5+") => void;
  streakValue: number;
  onSetStreakValue: (v: number) => void;
  streakUnit: "DAYS" | "WEEKS" | "MONTHS";
  onSetStreakUnit: (v: "DAYS" | "WEEKS" | "MONTHS") => void;
}) {
  const formattedStreak = `${streakValue} ${streakUnit.charAt(0) + streakUnit.slice(1).toLowerCase()}`;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-ma-heading text-ma-display-lg-mobile text-ma-on-surface font-extrabold tracking-tight">
          Have you tried quitting before?
        </h1>
        <p className="font-ma-body text-ma-body-md text-ma-on-surface-variant">Past attempts are experience, not failure.</p>
      </div>

      <div className="flex flex-col gap-3 p-4 rounded-xl bg-ma-surface-container-low shadow-sm">
        <div className="flex items-center justify-between">
          <label className="font-ma-heading text-ma-headline-sm text-ma-on-surface flex items-center gap-2">
            <Icon name="history" className="text-ma-primary" size={18} />
            Previous quit attempts
          </label>
          <span className="font-ma-body text-ma-label-sm text-ma-on-surface-variant">Select record</span>
        </div>
        <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Previous quit attempts">
          {ATTEMPT_OPTIONS.map((opt) => {
            const selected = attemptsBucket === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => onSetAttemptsBucket(opt.key)}
                className={cn(
                  "flex items-center justify-center gap-2 p-3 rounded-lg transition-all active:scale-[0.98]",
                  selected
                    ? "bg-ma-primary-container text-ma-on-primary-container shadow-[0_4px_16px_rgba(148,125,255,0.35)]"
                    : "bg-ma-surface-container-high text-ma-on-surface-variant hover:text-ma-on-surface"
                )}
              >
                <span className={cn("font-ma-body text-ma-label-md", selected && "font-bold")}>{opt.label}</span>
                {selected && <Icon name="check" size={18} />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-3 p-4 rounded-xl bg-ma-surface-container-low shadow-sm">
        <label className="font-ma-heading text-ma-headline-sm text-ma-on-surface flex items-center gap-2">
          <Icon name="verified_user" className="text-ma-primary" size={18} />
          Longest streak
        </label>
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3 p-1 rounded-xl bg-ma-surface-container-highest/70">
            <button
              type="button"
              aria-label="Decrease streak days"
              onClick={() => onSetStreakValue(Math.max(1, streakValue - 1))}
              className="w-12 h-12 rounded-lg bg-ma-surface-container flex items-center justify-center text-ma-on-surface hover:bg-ma-surface-bright active:scale-90 transition-all"
            >
              <Icon name="remove" size={20} />
            </button>
            <div className="flex-1 flex flex-col items-center justify-center py-1">
              <div className="flex items-baseline gap-1.5">
                <span className="font-ma-heading text-ma-numeric-stat text-ma-on-surface font-extrabold tracking-tight">{streakValue}</span>
                <span className="font-ma-heading text-ma-headline-sm text-ma-primary font-bold">{streakUnit}</span>
              </div>
              <span className="font-ma-body text-ma-label-sm text-ma-on-surface-variant">Personal record</span>
            </div>
            <button
              type="button"
              aria-label="Increase streak days"
              onClick={() => onSetStreakValue(streakValue + 1)}
              className="w-12 h-12 rounded-lg bg-ma-primary text-ma-on-primary flex items-center justify-center hover:opacity-90 active:scale-90 shadow-[0_0_12px_rgba(202,190,255,0.4)] transition-all"
            >
              <Icon name="add" size={20} />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-1">
            {UNITS.map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => onSetStreakUnit(u)}
                className={cn(
                  "py-2 px-2 rounded-lg font-ma-body text-ma-label-md font-semibold text-center transition-all",
                  streakUnit === u
                    ? "bg-ma-primary-container text-ma-on-primary-container shadow-sm"
                    : "bg-ma-surface-container-high text-ma-on-surface-variant hover:text-ma-on-surface"
                )}
              >
                {u.charAt(0) + u.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-xl bg-ma-surface-container p-4 shadow-md">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-ma-secondary-container/20 text-ma-secondary flex items-center justify-center shrink-0">
            <Icon name="verified" size={20} />
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-ma-body text-ma-label-lg text-ma-on-surface font-semibold">Strength in Experience</span>
            <p className="font-ma-body text-ma-body-sm text-ma-on-surface-variant leading-relaxed">
              You&apos;ve proven you can go <span className="font-semibold text-ma-secondary">{formattedStreak}</span> before.
              We&apos;ll tailor extra support around your toughest milestones.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
