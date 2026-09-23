"use client";
import { Icon } from "@/components/onboarding/arcade/Icon";
import { cn } from "@/lib/utils";
import type { ReasonKey } from "@/lib/domain/types";

interface DriverOption {
  key: ReasonKey;
  emoji: string;
  label: string;
  sub: string;
}

export function Step6CoreDrivers({
  reasons,
  onToggle,
  moneySavedPreview,
}: {
  reasons: ReasonKey[];
  onToggle: (key: ReasonKey) => void;
  moneySavedPreview: string;
}) {
  const DRIVERS: DriverOption[] = [
    { key: "health", emoji: "🧬", label: "Vital Health", sub: "Cell repair & energy" },
    { key: "freedom", emoji: "🔓", label: "Freedom", sub: "Break the mental loop" },
    { key: "money", emoji: "💰", label: "Financial Savings", sub: `Save ${moneySavedPreview}+ every year` },
    { key: "family", emoji: "👪", label: "Family & Loved Ones", sub: "Be present for those who matter" },
    { key: "fitness", emoji: "⚡", label: "Fitness & Stamina", sub: "Breathe deeper, run easier" },
    { key: "control", emoji: "🧠", label: "Mental Clarity", sub: "Reclaim focus and calm" },
  ];

  return (
    <div className="flex flex-col gap-5 pb-8">
      <div className="flex flex-col gap-1">
        <h1 className="font-ma-heading text-ma-display-lg-mobile text-ma-on-surface tracking-tight">Why are you quitting?</h1>
        <p className="font-ma-body text-ma-body-md text-ma-on-surface-variant leading-relaxed">
          Select what matters most to keep you anchored.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {DRIVERS.map((d) => {
          const active = reasons.includes(d.key);
          return (
            <div
              key={d.key}
              role="checkbox"
              aria-checked={active}
              tabIndex={0}
              onClick={() => onToggle(d.key)}
              onKeyDown={(e) => e.key === "Enter" && onToggle(d.key)}
              className={cn(
                "relative p-4 rounded-xl flex items-center justify-between cursor-pointer transition-all",
                active ? "bg-ma-primary/15 shadow-md hover:bg-ma-primary/20" : "bg-ma-surface-container-low shadow-sm hover:bg-ma-surface-container"
              )}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-ma-surface-container-high flex items-center justify-center shrink-0 text-[20px]">
                  {d.emoji}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-ma-heading text-ma-headline-sm text-ma-on-surface truncate font-semibold">{d.label}</span>
                  <span className="font-ma-body text-ma-body-sm text-ma-on-surface-variant truncate">{d.sub}</span>
                </div>
              </div>
              <div
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center shrink-0 ml-2 transition-all",
                  active ? "bg-ma-primary text-ma-on-primary shadow-sm" : "bg-ma-surface-container-highest text-ma-outline"
                )}
              >
                <Icon name={active ? "check" : "add"} size={16} className={active ? "font-bold" : undefined} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
