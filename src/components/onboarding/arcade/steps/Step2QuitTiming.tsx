"use client";
import { Icon } from "@/components/onboarding/arcade/Icon";
import { cn } from "@/lib/utils";

export function Step2QuitTiming({
  quitTiming,
  onSetTiming,
  futureDaysOffset,
  onSetDaysOffset,
}: {
  quitTiming: "now" | "future";
  onSetTiming: (v: "now" | "future") => void;
  futureDaysOffset: number;
  onSetDaysOffset: (v: number) => void;
}) {
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + futureDaysOffset);
  const dateLabel = targetDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 mb-2">
        <h1 className="font-ma-heading text-ma-display-lg-mobile text-ma-on-surface tracking-tight">When are you quitting?</h1>
        <p className="font-ma-body text-ma-body-md text-ma-on-surface-variant">Pick your starting point.</p>
      </div>

      <div className="flex flex-col gap-4" role="radiogroup" aria-label="Quit date launch window">
        {/* Right now */}
        <div
          role="radio"
          aria-checked={quitTiming === "now"}
          tabIndex={0}
          onClick={() => onSetTiming("now")}
          onKeyDown={(e) => e.key === "Enter" && onSetTiming("now")}
          className={cn(
            "group relative flex flex-col p-4 rounded-xl transition-all cursor-pointer active:scale-[0.99] overflow-hidden",
            quitTiming === "now" ? "bg-ma-surface-container-high shadow-lg" : "bg-ma-surface-container shadow-md"
          )}
          style={quitTiming === "now" ? { boxShadow: "0 8px 24px -4px rgba(148, 125, 255, 0.25)" } : undefined}
        >
          {quitTiming === "now" && (
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-ma-primary/10 via-ma-primary-container/5 to-transparent" />
          )}
          <div className="relative z-10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                  quitTiming === "now" ? "bg-ma-primary shadow-md" : "bg-ma-surface-container-high"
                )}
              >
                <Icon name="bolt" size={24} className={quitTiming === "now" ? "text-ma-on-primary" : "text-ma-on-surface-variant"} />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <span className="font-ma-heading text-ma-headline-sm text-ma-on-surface font-bold">Right now</span>
                  <span className="px-1 py-0.5 rounded-md bg-ma-primary-container text-ma-on-primary-container font-ma-body text-ma-label-sm font-semibold">
                    Starts immediately
                  </span>
                </div>
                <p className="font-ma-body text-ma-body-sm text-ma-on-surface-variant mt-0.5">
                  Your smoke-free clock starts ticking right away.
                </p>
              </div>
            </div>
            <div
              className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center shrink-0 shadow-sm transition-all",
                quitTiming === "now" ? "bg-ma-primary" : "bg-ma-surface-container-highest"
              )}
            >
              {quitTiming === "now" && <Icon name="check" size={16} className="text-ma-on-primary" />}
            </div>
          </div>
        </div>

        {/* Future date */}
        <div
          role="radio"
          aria-checked={quitTiming === "future"}
          tabIndex={0}
          onClick={() => onSetTiming("future")}
          onKeyDown={(e) => e.key === "Enter" && onSetTiming("future")}
          className={cn(
            "group relative flex flex-col p-4 rounded-xl transition-all cursor-pointer active:scale-[0.99] overflow-hidden",
            quitTiming === "future" ? "bg-ma-surface-container-high shadow-lg" : "bg-ma-surface-container shadow-md"
          )}
          style={quitTiming === "future" ? { boxShadow: "0 8px 24px -4px rgba(148, 125, 255, 0.25)" } : undefined}
        >
          <div className="relative z-10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                  quitTiming === "future" ? "bg-ma-primary shadow-md" : "bg-ma-surface-container-high"
                )}
              >
                <Icon name="calendar_today" size={24} className={quitTiming === "future" ? "text-ma-on-primary" : "text-ma-on-surface-variant"} />
              </div>
              <div className="flex flex-col">
                <span className="font-ma-heading text-ma-headline-sm text-ma-on-surface font-bold">Pick a date</span>
                <p className="font-ma-body text-ma-body-sm text-ma-on-surface-variant mt-0.5">
                  Take a few days to prepare your environment.
                </p>
              </div>
            </div>
            <div
              className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all",
                quitTiming === "future" ? "bg-ma-primary" : "bg-ma-surface-container-highest"
              )}
            >
              {quitTiming === "future" && <Icon name="check" size={16} className="text-ma-on-primary" />}
            </div>
          </div>
          {quitTiming === "future" && (
            <div
              className="relative z-10 flex flex-col gap-3 mt-4 pt-4 bg-ma-surface-container-low p-3 rounded-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <span className="font-ma-body text-ma-label-sm text-ma-outline uppercase tracking-wider">Target Launch Date</span>
                <span className="font-ma-body text-ma-label-sm text-ma-secondary font-semibold">{futureDaysOffset} Days of Prep</span>
              </div>
              <div className="flex items-center justify-between gap-2 bg-ma-surface-container-high p-1 rounded-lg">
                <button
                  type="button"
                  aria-label="Decrease target date"
                  onClick={() => onSetDaysOffset(Math.max(1, futureDaysOffset - 1))}
                  className="w-10 h-10 rounded-md bg-ma-surface-container hover:bg-ma-surface-bright flex items-center justify-center text-ma-on-surface active:scale-95 transition-all"
                >
                  <Icon name="remove" size={20} />
                </button>
                <div className="flex flex-col items-center">
                  <span className="font-ma-heading text-ma-headline-sm text-ma-on-surface">{dateLabel}</span>
                  <span className="font-ma-body text-ma-body-sm text-ma-outline">Locks at 00:00 AM</span>
                </div>
                <button
                  type="button"
                  aria-label="Increase target date"
                  onClick={() => onSetDaysOffset(Math.min(14, futureDaysOffset + 1))}
                  className="w-10 h-10 rounded-md bg-ma-surface-container hover:bg-ma-surface-bright flex items-center justify-center text-ma-on-surface active:scale-95 transition-all"
                >
                  <Icon name="add" size={20} />
                </button>
              </div>
              <div className="flex items-center justify-around gap-1 pt-1">
                {[2, 3, 7].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => onSetDaysOffset(d)}
                    className={cn(
                      "px-2 py-1 rounded-full font-ma-body text-ma-label-sm transition-colors",
                      futureDaysOffset === d
                        ? "bg-ma-primary-container/30 text-ma-primary-fixed font-semibold"
                        : "bg-ma-surface-container text-ma-on-surface-variant hover:text-ma-on-surface"
                    )}
                  >
                    {d === 3 ? "+3 Days (Best)" : `+${d} Days`}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
