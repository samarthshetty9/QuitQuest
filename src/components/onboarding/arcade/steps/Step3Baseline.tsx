"use client";
import { Icon } from "@/components/onboarding/arcade/Icon";
import { cn } from "@/lib/utils";

const WAKING_OPTIONS: { key: "critical" | "high" | "medium" | "low"; label: string }[] = [
  { key: "critical", label: "< 5 min" },
  { key: "high", label: "15 min" },
  { key: "medium", label: "30 min" },
  { key: "low", label: "60+ min" },
];

const CIG_PRESETS = [5, 10, 15, 20];

export function Step3Baseline({
  cigarettesPerDay,
  onSetCigsPerDay,
  cigarettesPerPack,
  onSetCigsPerPack,
  pricePerPack,
  onSetPricePerPack,
  currency,
  onSetCurrency,
  yearsSmoked,
  onSetYearsSmoked,
  wakingUrgency,
  onSetWakingUrgency,
  minutesPerSmokingEvent,
  onSetMinutesPerSmokingEvent,
}: {
  cigarettesPerDay: number;
  onSetCigsPerDay: (v: number) => void;
  cigarettesPerPack: number;
  onSetCigsPerPack: (v: number) => void;
  pricePerPack: number;
  onSetPricePerPack: (v: number) => void;
  currency: string;
  onSetCurrency: (v: string) => void;
  yearsSmoked: number;
  onSetYearsSmoked: (v: number) => void;
  wakingUrgency: "critical" | "high" | "medium" | "low";
  onSetWakingUrgency: (v: "critical" | "high" | "medium" | "low") => void;
  minutesPerSmokingEvent: number;
  onSetMinutesPerSmokingEvent: (v: number) => void;
}) {
  const cigs = Math.max(1, cigarettesPerDay || 1);
  const packSize = Math.max(1, cigarettesPerPack || 20);
  const packPrice = Math.max(0.1, pricePerPack || 10);
  const minPerSmoke = Math.max(1, minutesPerSmokingEvent || 6);

  const costPerCig = packPrice / packSize;
  const yearlySpend = Math.round(costPerCig * cigs * 365);
  const totalMinPerYear = cigs * minPerSmoke * 365;
  const daysGained = (totalMinPerYear / 1440).toFixed(1);

  const currencySymbol = currency === "USD" ? "$" : currency === "GBP" ? "£" : currency === "EUR" ? "€" : currency === "INR" ? "₹" : "$";

  return (
    <div className="flex flex-col gap-6 pb-6">
      <div className="flex flex-col gap-1">
        <h2 className="font-ma-heading text-ma-headline-lg text-ma-on-surface">Your smoking baseline</h2>
        <p className="font-ma-body text-ma-body-md text-ma-on-surface-variant">
          Calculate your projected savings and health recovery milestones in real time.
        </p>
      </div>

      {/* Live projection */}
      <div className="relative overflow-hidden rounded-xl bg-ma-surface-container-high p-4 shadow-xl">
        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 rounded-lg bg-ma-surface-container-lowest/80 flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-ma-secondary">
              <Icon name="savings" size={18} />
              <span className="font-ma-body text-ma-label-sm uppercase tracking-wide">Annual savings</span>
            </div>
            <div className="pt-2">
              <div className="font-ma-heading text-ma-numeric-stat text-ma-secondary-fixed tracking-tight">
                {currencySymbol}
                {yearlySpend.toLocaleString()}
              </div>
              <p className="font-ma-body text-ma-body-sm text-ma-on-surface-variant">/ year</p>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-ma-surface-container-lowest/80 flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-ma-tertiary">
              <Icon name="timelapse" size={18} />
              <span className="font-ma-body text-ma-label-sm uppercase tracking-wide">Time reclaimed</span>
            </div>
            <div className="pt-2">
              <div className="font-ma-heading text-ma-numeric-stat text-ma-tertiary-fixed tracking-tight">{daysGained} days</div>
              <p className="font-ma-body text-ma-body-sm text-ma-on-surface-variant">/ year</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cigarettes per day */}
      <div className="rounded-xl bg-ma-surface-container p-4 shadow-md flex flex-col gap-3">
        <label className="font-ma-body text-ma-label-lg text-ma-on-surface flex items-center gap-2">
          <Icon name="smoking_rooms" className="text-ma-primary" size={20} />
          Cigarettes per day
        </label>
        <div className="flex items-center gap-3 bg-ma-surface-container-low p-2 rounded-lg">
          <button
            type="button"
            aria-label="Decrease daily count"
            onClick={() => onSetCigsPerDay(Math.max(1, cigs - 1))}
            className="w-12 h-12 rounded-lg bg-ma-surface-container-highest hover:bg-ma-surface-bright active:scale-95 transition-all flex items-center justify-center text-ma-on-surface"
          >
            <Icon name="remove" size={20} />
          </button>
          <div className="flex-1 text-center">
            <input
              className="w-full bg-transparent text-center font-ma-heading text-ma-numeric-stat text-ma-on-surface focus:outline-none"
              max={100}
              min={1}
              type="number"
              value={cigs}
              onChange={(e) => onSetCigsPerDay(Math.max(1, Number(e.target.value) || 1))}
            />
          </div>
          <button
            type="button"
            aria-label="Increase daily count"
            onClick={() => onSetCigsPerDay(cigs + 1)}
            className="w-12 h-12 rounded-lg bg-ma-surface-container-highest hover:bg-ma-surface-bright active:scale-95 transition-all flex items-center justify-center text-ma-on-surface"
          >
            <Icon name="add" size={20} />
          </button>
        </div>
        <div className="flex items-center gap-2">
          {CIG_PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onSetCigsPerDay(p)}
              className={cn(
                "flex-1 py-2 rounded-full font-ma-body text-ma-label-sm transition-all active:scale-95",
                cigs === p
                  ? "text-ma-on-primary font-bold bg-ma-primary-container shadow-[0_0_12px_rgba(148,125,255,0.4)]"
                  : "text-ma-on-surface-variant bg-ma-surface-container-low hover:bg-ma-surface-container-highest"
              )}
            >
              {p === 20 ? "20+" : p}
            </button>
          ))}
        </div>
      </div>

      {/* Pack anatomy */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-ma-surface-container p-4 shadow-md flex flex-col justify-between gap-1">
          <label className="font-ma-body text-ma-label-md text-ma-on-surface-variant">Cigarettes per pack</label>
          <div className="flex items-center bg-ma-surface-container-low rounded-lg px-3 h-12">
            <input
              className="w-full bg-transparent font-ma-heading text-ma-headline-sm text-ma-on-surface focus:outline-none"
              type="number"
              value={cigarettesPerPack}
              onChange={(e) => onSetCigsPerPack(Math.max(1, Number(e.target.value) || 1))}
            />
            <span className="font-ma-body text-ma-body-sm text-ma-outline shrink-0">pcs</span>
          </div>
        </div>
        <div className="rounded-xl bg-ma-surface-container p-4 shadow-md flex flex-col justify-between gap-1">
          <label className="font-ma-body text-ma-label-md text-ma-on-surface-variant">Price per pack</label>
          <div className="flex items-center bg-ma-surface-container-low rounded-lg px-2 h-12 gap-1">
            <span className="font-ma-heading text-ma-headline-sm text-ma-secondary pl-1">{currencySymbol}</span>
            <input
              className="w-full bg-transparent font-ma-heading text-ma-headline-sm text-ma-on-surface focus:outline-none"
              step={0.5}
              type="number"
              value={pricePerPack}
              onChange={(e) => onSetPricePerPack(Math.max(0, Number(e.target.value) || 0))}
            />
            <select
              className="bg-ma-surface-container-highest text-ma-on-surface font-ma-body text-ma-label-sm rounded-lg py-1 px-1.5 focus:outline-none shrink-0"
              value={currency}
              onChange={(e) => onSetCurrency(e.target.value)}
            >
              <option value="INR">INR</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="CAD">CAD</option>
            </select>
          </div>
        </div>
      </div>

      {/* Years smoked + waking urgency */}
      <div className="rounded-xl bg-ma-surface-container p-4 shadow-md flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <label className="font-ma-body text-ma-label-md text-ma-on-surface flex items-center gap-1.5">
              <Icon name="history" className="text-ma-primary" size={18} />
              Years smoking
            </label>
            <span className="font-ma-heading text-ma-headline-sm text-ma-primary-fixed bg-ma-surface-container-highest px-2 py-0.5 rounded-full">
              {yearsSmoked} {yearsSmoked === 1 ? "year" : "years"}
            </span>
          </div>
          <input
            className="w-full accent-[color:var(--ma-primary)] h-2 bg-ma-surface-container-highest rounded-lg cursor-pointer"
            max={40}
            min={1}
            type="range"
            value={yearsSmoked}
            onChange={(e) => onSetYearsSmoked(Number(e.target.value))}
          />
          <div className="flex justify-between font-ma-body text-ma-label-sm text-ma-outline px-1">
            <span>1 yr</span>
            <span>10 yrs</span>
            <span>25 yrs</span>
            <span>40+ yrs</span>
          </div>
        </div>
        <div className="flex flex-col gap-2 pt-1">
          <span className="font-ma-body text-ma-label-md text-ma-on-surface flex items-center gap-1.5">
            <Icon name="alarm" className="text-ma-outline" size={18} />
            First smoke of the day
          </span>
          <div className="grid grid-cols-4 gap-2">
            {WAKING_OPTIONS.map((opt) => {
              const active = wakingUrgency === opt.key;
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => onSetWakingUrgency(opt.key)}
                  className={cn(
                    "py-2.5 px-1 rounded-lg text-center transition-all font-ma-body text-ma-label-md",
                    active
                      ? "bg-ma-primary-container text-ma-on-primary font-bold shadow-sm"
                      : "bg-ma-surface-container-low hover:bg-ma-surface-container-highest text-ma-on-surface"
                  )}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Minutes per smoke */}
      <div className="rounded-xl bg-ma-surface-container p-4 shadow-md flex items-center justify-between gap-4">
        <div className="flex flex-col flex-1">
          <label className="font-ma-body text-ma-label-lg text-ma-on-surface flex items-center gap-1.5">
            <Icon name="timer" className="text-ma-tertiary" size={18} />
            Minutes spent per smoke
          </label>
          <p className="font-ma-body text-ma-body-sm text-ma-outline pt-0.5">
            Calculates deep life-hours regained for sleep, passions, and focus.
          </p>
        </div>
        <div className="flex items-center bg-ma-surface-container-low rounded-lg px-3 h-12 w-28 shrink-0">
          <input
            className="w-full bg-transparent font-ma-heading text-ma-headline-sm text-ma-on-surface text-center focus:outline-none"
            max={30}
            min={1}
            type="number"
            value={minutesPerSmokingEvent}
            onChange={(e) => onSetMinutesPerSmokingEvent(Math.max(1, Number(e.target.value) || 1))}
          />
          <span className="font-ma-body text-ma-body-sm text-ma-outline shrink-0">min</span>
        </div>
      </div>
    </div>
  );
}
