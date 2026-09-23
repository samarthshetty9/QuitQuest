"use client";
import { Icon } from "@/components/onboarding/arcade/Icon";
import type { ReasonKey } from "@/lib/domain/types";

const REASON_ICON: Record<string, string> = {
  health: "favorite",
  freedom: "lock_open",
  money: "account_balance_wallet",
  family: "diversity_1",
  fitness: "bolt",
  control: "psychology",
  smell: "auto_awesome",
  personal_promise: "handshake",
};

const REASON_COLOR = ["text-ma-secondary", "text-ma-primary", "text-ma-tertiary"];

const REASON_LABEL: Record<string, string> = {
  health: "Health",
  freedom: "Freedom",
  money: "Financial",
  family: "Family",
  fitness: "Fitness",
  control: "Clarity",
  smell: "Freshness",
  personal_promise: "Promise",
};

export function Step9Review({
  nickname,
  quitTiming,
  futureDaysOffset,
  yearlyWealth,
  timeSalvagedDays,
  reasons,
  customReasons,
  futureSelfMessage,
  arsenalLabels,
}: {
  nickname: string;
  quitTiming: "now" | "future";
  futureDaysOffset: number;
  yearlyWealth: string;
  timeSalvagedDays: string;
  reasons: ReasonKey[];
  customReasons: string[];
  futureSelfMessage: string;
  arsenalCount: number;
  arsenalLabels: string[];
}) {
  const name = nickname.trim() || "there";

  return (
    <div className="flex flex-col w-full pb-8">
      <div className="relative flex flex-col items-center justify-center text-center mt-2 mb-6">
        <div className="relative flex items-center justify-center w-24 h-24 mb-3">
          <div className="absolute inset-0 rounded-full bg-ma-primary/20 blur-xl animate-pulse" />
          <div className="relative w-20 h-20 rounded-full bg-ma-surface-container-high/90 border border-ma-outline-variant/30 flex flex-col items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.6)] backdrop-blur-md">
            <Icon name="local_fire_department" filled size={36} className="text-ma-primary" />
          </div>
        </div>
        <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-ma-surface-container-high/70 border border-ma-outline-variant/30 shadow-sm mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-ma-secondary" />
          <span className="font-ma-body text-ma-label-sm text-ma-secondary uppercase tracking-wider font-semibold">Level 1 Ready</span>
        </div>
        <h1 className="font-ma-heading text-ma-display-lg-mobile text-ma-on-surface font-extrabold tracking-tight mb-1">
          You&apos;re all set, {name}!
        </h1>
        <p className="font-ma-body text-ma-body-md text-ma-on-surface-variant max-w-[340px] leading-relaxed">
          {quitTiming === "now"
            ? "Your smoke-free journey begins the moment you tap Start."
            : `Your plan is set. Preparation begins now — your quit day arrives in ${futureDaysOffset} day${futureDaysOffset === 1 ? "" : "s"}.`}
        </p>
      </div>

      <div className="relative w-full rounded-xl bg-ma-surface-container/70 border border-ma-outline-variant/30 backdrop-blur-xl p-4 shadow-[0_12px_36px_rgba(0,0,0,0.5)] mb-4 overflow-hidden">
        <div className="flex items-center justify-between pb-2 border-b border-ma-outline-variant/30 mb-3">
          <div className="flex items-center gap-1">
            <Icon name="assignment" className="text-ma-primary" size={18} />
            <span className="font-ma-heading text-ma-headline-sm text-ma-on-surface font-bold">Your Plan Overview</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="rounded-lg bg-ma-surface-container-highest/60 p-2 flex flex-col">
            <span className="font-ma-body text-ma-label-sm text-ma-secondary font-bold tracking-wide uppercase mb-1 flex items-center gap-1">
              <Icon name="savings" size={15} />
              {yearlyWealth} saved
            </span>
            <span className="font-ma-body text-ma-body-sm text-ma-on-surface-variant">per year</span>
          </div>
          <div className="rounded-lg bg-ma-surface-container-highest/60 p-2 flex flex-col">
            <span className="font-ma-body text-ma-label-sm text-ma-tertiary font-bold tracking-wide uppercase mb-1 flex items-center gap-1">
              <Icon name="schedule" size={15} />
              {timeSalvagedDays} days
            </span>
            <span className="font-ma-body text-ma-body-sm text-ma-on-surface-variant">regained / year</span>
          </div>
        </div>

        {(reasons.length > 0 || customReasons.length > 0) && (
          <div className="mb-3">
            <span className="font-ma-body text-ma-label-sm text-ma-outline uppercase tracking-wider block mb-1.5 font-semibold">Your Anchors</span>
            <div className="flex flex-wrap gap-1.5">
              {reasons.map((r, i) => (
                <span
                  key={r}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-ma-surface-container-highest/80 text-ma-on-surface font-ma-body text-ma-label-sm"
                >
                  <Icon name={REASON_ICON[r] ?? "favorite"} size={14} className={REASON_COLOR[i % REASON_COLOR.length]} />
                  {REASON_LABEL[r] ?? r}
                </span>
              ))}
              {customReasons.map((r) => (
                <span
                  key={r}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-ma-surface-container-highest/80 text-ma-on-surface font-ma-body text-ma-label-sm"
                >
                  {r}
                </span>
              ))}
            </div>
          </div>
        )}

        {arsenalLabels.length > 0 && (
          <div className="mb-3">
            <span className="font-ma-body text-ma-label-sm text-ma-outline uppercase tracking-wider block mb-1.5 font-semibold">Your First Aid</span>
            <div className="flex flex-wrap gap-1.5">
              {arsenalLabels.map((label, i) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-ma-surface-container-high/90 text-ma-on-surface font-ma-body text-ma-label-sm"
                >
                  <Icon name="bolt" size={13} className={REASON_COLOR[i % REASON_COLOR.length]} />
                  {label}
                </span>
              ))}
            </div>
          </div>
        )}

        {futureSelfMessage.trim() && (
          <div className="rounded-lg bg-ma-surface-container-lowest/70 border border-ma-outline-variant/30 p-2 flex items-start gap-2">
            <Icon name="format_quote" size={16} className="text-ma-primary shrink-0 mt-0.5" />
            <div className="flex flex-col flex-1">
              <span className="font-ma-body text-ma-label-sm text-ma-primary uppercase font-bold tracking-wider mb-0.5">Your Message</span>
              <p className="font-ma-body text-ma-body-sm text-ma-on-surface italic leading-snug">&ldquo;{futureSelfMessage.trim()}&rdquo;</p>
            </div>
          </div>
        )}
      </div>

      <div className="w-full rounded-xl bg-ma-surface-container/60 border border-ma-outline-variant/30 p-4 shadow-md mb-4">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-full bg-ma-secondary-container/40 flex items-center justify-center shrink-0 text-ma-secondary font-bold font-ma-heading text-ma-label-lg">
            20m
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="font-ma-body text-ma-label-sm text-ma-secondary font-bold uppercase tracking-wider mb-0.5">First Milestone</span>
            <p className="font-ma-body text-ma-body-sm text-ma-on-surface leading-snug">
              In 20 minutes, your heart rate and blood pressure drop to normal levels.
            </p>
          </div>
        </div>
      </div>

      <div className="w-full rounded-lg bg-ma-surface-container-high/40 p-3 flex items-center gap-2 text-ma-on-surface-variant shadow-sm">
        <Icon name="info" className="text-ma-primary" size={18} />
        <span className="font-ma-body text-ma-body-sm">You can adjust your baseline, targets, and arsenal anytime in the Vault.</span>
      </div>
    </div>
  );
}
