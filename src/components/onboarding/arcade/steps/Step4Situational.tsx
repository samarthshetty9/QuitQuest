"use client";
import { Icon } from "@/components/onboarding/arcade/Icon";
import { cn } from "@/lib/utils";

interface SituationCardProps {
  emoji: string;
  title: string;
  helper: string;
  value: number | null;
  onChange: (v: number | null) => void;
}

function SituationCard({ emoji, title, helper, value, onChange }: SituationCardProps) {
  const applies = value !== null;

  return (
    <div className="rounded-xl bg-ma-surface-container p-4 shadow-md flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <label className="font-ma-body text-ma-label-lg text-ma-on-surface flex items-center gap-2 flex-1">
          <span className="text-[20px]">{emoji}</span>
          {title}
        </label>
      </div>
      <p className="font-ma-body text-ma-body-sm text-ma-on-surface-variant">{helper}</p>
      <div className="flex items-center gap-2" role="radiogroup" aria-label={`${title} applicability`}>
        <button
          type="button"
          aria-pressed={applies}
          onClick={() => !applies && onChange(3)}
          className={cn(
            "flex-1 px-3 py-1.5 rounded-full font-ma-body text-ma-label-sm transition-all active:scale-95",
            applies
              ? "bg-ma-primary-container text-ma-on-primary-container font-semibold"
              : "bg-ma-surface-container-high text-ma-on-surface-variant hover:text-ma-on-surface"
          )}
        >
          This applies to me
        </button>
        <button
          type="button"
          aria-pressed={!applies}
          onClick={() => applies && onChange(null)}
          className={cn(
            "flex-1 px-3 py-1.5 rounded-full font-ma-body text-ma-label-sm transition-all active:scale-95",
            !applies
              ? "bg-ma-primary-container text-ma-on-primary-container font-semibold"
              : "bg-ma-surface-container-high text-ma-on-surface-variant hover:text-ma-on-surface"
          )}
        >
          Doesn&apos;t apply
        </button>
      </div>

      {applies && (
        <div className="flex items-center gap-3 bg-ma-surface-container-low p-2 rounded-lg">
          <button
            type="button"
            aria-label={`Decrease ${title}`}
            onClick={() => onChange(Math.max(0, value - 1))}
            className="w-12 h-12 rounded-lg bg-ma-surface-container-highest hover:bg-ma-surface-bright active:scale-95 transition-all flex items-center justify-center text-ma-on-surface"
          >
            <Icon name="remove" size={20} />
          </button>
          <div className="flex-1 text-center">
            <input
              className="w-full bg-transparent text-center font-ma-heading text-ma-numeric-stat text-ma-on-surface focus:outline-none"
              max={60}
              min={0}
              type="number"
              value={value}
              onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
            />
            <span className="font-ma-body text-ma-label-sm text-ma-outline">cigarettes, typically</span>
          </div>
          <button
            type="button"
            aria-label={`Increase ${title}`}
            onClick={() => onChange(value + 1)}
            className="w-12 h-12 rounded-lg bg-ma-surface-container-highest hover:bg-ma-surface-bright active:scale-95 transition-all flex items-center justify-center text-ma-on-surface"
          >
            <Icon name="add" size={20} />
          </button>
        </div>
      )}
    </div>
  );
}

export function Step4Situational({
  cigsWhenDrinking,
  onSetCigsWhenDrinking,
  cigsWhenHigh,
  onSetCigsWhenHigh,
}: {
  cigsWhenDrinking: number | null;
  onSetCigsWhenDrinking: (v: number | null) => void;
  cigsWhenHigh: number | null;
  onSetCigsWhenHigh: (v: number | null) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-ma-heading text-ma-display-lg-mobile text-ma-on-surface tracking-tight">
          Any situations worth planning for?
        </h1>
        <p className="font-ma-body text-ma-body-md text-ma-on-surface-variant">
          Some situations make you smoke more than usual. Totally optional — this just helps the app tell you when
          you&apos;re doing better than your own average.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <SituationCard
          emoji="🍺"
          title="When you're drinking"
          helper="How many cigarettes do you usually smoke in a typical drinking session?"
          value={cigsWhenDrinking}
          onChange={onSetCigsWhenDrinking}
        />
        <SituationCard
          emoji="🌿"
          title="When you're high"
          helper="How many cigarettes do you usually smoke in a typical session?"
          value={cigsWhenHigh}
          onChange={onSetCigsWhenHigh}
        />
      </div>

      <div className="flex items-center gap-3 p-4 rounded-xl bg-ma-surface-container-low shadow-sm">
        <div className="w-9 h-9 rounded-full bg-ma-secondary-container/20 flex items-center justify-center shrink-0 text-ma-secondary">
          <Icon name="info" size={18} />
        </div>
        <p className="font-ma-body text-ma-body-sm text-ma-on-surface-variant">
          You can log an actual drinking or high session anytime from Home — we&apos;ll compare it to what you told
          us here, no judgment either way.
        </p>
      </div>
    </div>
  );
}
