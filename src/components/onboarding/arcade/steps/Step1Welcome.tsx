"use client";
import { Icon } from "@/components/onboarding/arcade/Icon";
import { cn } from "@/lib/utils";

export function Step1Welcome({
  nickname,
  onChange,
  onContinue,
}: {
  nickname: string;
  onChange: (v: string) => void;
  onContinue: () => void;
}) {
  const hasValue = nickname.trim().length > 0;

  return (
    <div className="flex flex-col w-full max-w-[440px] mx-auto px-5 pb-[calc(env(safe-area-inset-bottom,0px)+1.25rem)]">
      {/* Progress Header */}
      <div className="flex items-center justify-between pt-4 pb-2">
        <div className="flex flex-col gap-1 w-full max-w-[200px]">
          <div className="flex items-center justify-between text-ma-on-surface-variant font-ma-body text-ma-label-sm">
            <span className="tracking-wider uppercase">Step 1 of 10</span>
            <span className="text-ma-primary font-bold">10%</span>
          </div>
          <div className="h-1.5 w-full bg-ma-surface-container-high rounded-full overflow-hidden relative">
            <div className="h-full bg-gradient-to-r from-ma-primary-container to-ma-primary rounded-full w-[10%] relative shadow-[0_0_12px_rgba(202,190,255,0.7)]" />
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-ma-surface-container-high px-3 py-1.5 rounded-full shadow-sm">
          <Icon name="shield" filled className="text-ma-secondary text-sm" size={16} />
          <span className="font-ma-body text-ma-label-sm text-ma-secondary tracking-wider uppercase">Lvl 1 Pioneer</span>
        </div>
      </div>

      {/* Hero Identity */}
      <div className="relative flex flex-col items-center text-center mt-6 mb-4">
        <div className="absolute -top-4 w-40 h-40 bg-ma-primary-container/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center">
          <div className="relative w-24 h-24 rounded-2xl bg-ma-surface-container-high flex items-center justify-center p-0.5 shadow-2xl">
            <div className="w-full h-full rounded-2xl bg-gradient-to-b from-ma-surface-container-highest to-ma-surface-container flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-ma-primary/10 via-transparent to-transparent opacity-80" />
              <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-ma-primary/15 text-ma-primary">
                <Icon name="local_fire_department" filled size={28} />
                <div className="absolute inset-0 rounded-xl bg-ma-primary/20 blur-sm animate-pulse" />
              </div>
              <span className="relative mt-1 font-ma-body text-ma-label-sm uppercase tracking-wider text-ma-secondary">
                LVL 01
              </span>
            </div>
          </div>
        </div>
        <h1 className="font-ma-heading text-ma-display-lg-mobile text-ma-on-surface mt-5 tracking-tight font-extrabold">
          Quit<span className="text-ma-primary">Quest</span>
        </h1>
        <p className="font-ma-body text-ma-body-md text-ma-on-surface-variant max-w-[280px] mt-1.5">
          Turn craving resistance into progress.
        </p>
      </div>

      {/* Setup card */}
      <div className="mt-4 bg-ma-surface-container rounded-2xl p-5 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-ma-primary/30 to-transparent" />
        <div className="flex items-center justify-between mb-3">
          <label className="font-ma-heading text-ma-headline-sm text-ma-on-surface font-semibold" htmlFor="player-handle">
            What&apos;s your name?
          </label>
        </div>
        <div className="relative flex items-center rounded-xl bg-ma-surface-container-lowest transition-all duration-300 focus-within:ring-2 focus-within:ring-ma-primary/60">
          <div className="pl-3.5 pr-1 flex items-center justify-center">
            <div
              className={cn(
                "w-9 h-9 rounded-lg flex items-center justify-center font-ma-heading text-ma-headline-sm font-bold shadow-inner transition-colors",
                hasValue ? "bg-ma-primary-container text-ma-on-primary-container" : "bg-ma-surface-container-high text-ma-outline"
              )}
            >
              {hasValue ? nickname.trim().charAt(0).toUpperCase() : <Icon name="swords" size={20} />}
            </div>
          </div>
          <input
            autoComplete="off"
            autoFocus
            className="w-full h-14 bg-transparent px-3 font-ma-body text-ma-body-lg text-ma-on-surface placeholder:text-ma-outline focus:outline-none"
            id="player-handle"
            maxLength={16}
            placeholder="Sam or nickname"
            type="text"
            value={nickname}
            onChange={(e) => onChange(e.target.value)}
          />
          <div className="pr-3.5 flex items-center gap-1">
            <Icon name="sports_esports" className="text-ma-outline" size={18} />
          </div>
        </div>
        <div className="mt-4 pt-3.5 flex items-start gap-3 border-t border-ma-surface-variant/40">
          <div className="w-6 h-6 rounded-md bg-ma-secondary-container/30 flex items-center justify-center shrink-0">
            <Icon name="lock" filled className="text-ma-secondary" size={14} />
          </div>
          <p className="font-ma-body text-ma-body-sm text-ma-on-surface-variant">Stored privately on your device.</p>
        </div>
      </div>

      {/* Perk cards */}
      <div className="grid grid-cols-2 gap-3 mt-3">
        <div className="bg-ma-surface-container-low rounded-xl p-3.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-ma-surface-container-high flex items-center justify-center shrink-0 text-ma-tertiary">
            <Icon name="savings" size={20} />
          </div>
          <div className="flex flex-col">
            <span className="font-ma-heading text-sm text-ma-on-surface font-semibold">Savings tracker</span>
            <span className="font-ma-body text-ma-body-sm text-ma-on-surface-variant">Live financial tally</span>
          </div>
        </div>
        <div className="bg-ma-surface-container-low rounded-xl p-3.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-ma-surface-container-high flex items-center justify-center shrink-0 text-ma-secondary">
            <Icon name="favorite" size={20} />
          </div>
          <div className="flex flex-col">
            <span className="font-ma-heading text-sm text-ma-on-surface font-semibold">Health recovery</span>
            <span className="font-ma-body text-ma-body-sm text-ma-on-surface-variant">Body organ regeneration</span>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-6 mb-2 flex flex-col gap-3">
        <button
          type="button"
          onClick={onContinue}
          className="w-full h-14 rounded-xl bg-ma-primary text-ma-on-primary font-ma-heading text-ma-headline-sm font-bold flex items-center justify-center gap-2 shadow-[0_8px_24px_-2px_rgba(148,125,255,0.45)] transition-all duration-200 active:scale-[0.98] hover:brightness-110"
        >
          <span>Continue</span>
          <Icon name="arrow_forward" size={20} />
        </button>
      </div>
    </div>
  );
}
