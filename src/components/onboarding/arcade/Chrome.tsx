"use client";
import { Icon } from "@/components/onboarding/arcade/Icon";
import { cn } from "@/lib/utils";

export function ChromeHeader({
  step,
  totalSteps,
  onBack,
  onClose,
  avatarInitial,
}: {
  step: number;
  totalSteps: number;
  onBack: () => void;
  onClose: () => void;
  avatarInitial?: string;
}) {
  const pct = Math.round((step / totalSteps) * 100);
  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-ma-surface/85 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
      <div className="h-20 px-5 flex items-center justify-between gap-3 max-w-[480px] mx-auto w-full">
        <button
          aria-label="Previous step"
          onClick={onBack}
          className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-ma-surface-container/60 hover:bg-ma-surface-container flex items-center justify-center text-ma-on-surface-variant hover:text-ma-on-surface transition-colors"
        >
          <Icon name="arrow_back_ios_new" size={20} />
        </button>
        <div className="flex-1 flex flex-col items-center justify-center gap-1 px-2">
          <div className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-ma-surface-container-high/80 backdrop-blur-md shadow-inner">
            <span className="w-1.5 h-1.5 rounded-full bg-ma-primary animate-pulse shadow-[0_0_8px_#cabeff]" />
            <span className="font-ma-body text-ma-label-sm text-ma-primary-fixed uppercase tracking-wider">
              Step {step} of {totalSteps}
            </span>
          </div>
          <div className="w-full max-w-[140px] h-1.5 bg-ma-surface-container-highest/60 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-ma-inverse-primary to-ma-primary shadow-[0_0_10px_#947dff] transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            aria-label="Quick exit quest"
            onClick={onClose}
            className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-ma-surface-container/60 hover:bg-ma-surface-container flex items-center justify-center text-ma-on-surface-variant hover:text-ma-error transition-colors"
          >
            <Icon name="close" size={20} />
          </button>
          <div className="w-8 h-8 rounded-full bg-ma-primary flex items-center justify-center shrink-0 text-ma-on-primary font-ma-heading text-xs font-bold">
            {avatarInitial ? avatarInitial.toUpperCase() : <Icon name="person" size={18} />}
          </div>
        </div>
      </div>
    </header>
  );
}

export function ChromeFooter({
  ctaLabel,
  onContinue,
  onSkip,
  disabled,
}: {
  ctaLabel: string;
  onContinue: () => void;
  onSkip?: () => void;
  disabled?: boolean;
}) {
  return (
    <footer className="fixed bottom-0 inset-x-0 z-50 bg-ma-surface/90 backdrop-blur-xl pb-[calc(env(safe-area-inset-bottom,0px)+1.25rem)] shadow-[0_-8px_32px_rgba(0,0,0,0.6)]">
      <div className="max-w-[480px] mx-auto w-full px-5 pt-3 flex flex-col gap-2">
        <button
          type="button"
          onClick={onContinue}
          disabled={disabled}
          className={cn(
            "w-full h-14 min-h-[54px] rounded-full bg-gradient-to-r from-ma-primary-container via-ma-primary to-ma-primary-fixed-dim text-ma-on-primary-container font-ma-body text-ma-label-lg font-bold flex items-center justify-center gap-2 shadow-[0_8px_24px_-2px_rgba(148,125,255,0.45)] hover:opacity-95 active:scale-[0.98] transition-all",
            disabled && "opacity-40 pointer-events-none"
          )}
        >
          <span>{ctaLabel}</span>
          <Icon name="arrow_forward" size={20} />
        </button>
        <div className="flex items-center justify-between px-2 pt-1">
          <button
            type="button"
            onClick={onSkip}
            className="min-h-[44px] flex items-center justify-center font-ma-body text-ma-label-md text-ma-on-surface-variant hover:text-ma-on-surface transition-colors"
          >
            Skip for now
          </button>
          <span className="font-ma-body text-ma-label-sm text-ma-outline flex items-center gap-1">
            <Icon name="shield" size={14} className="text-ma-secondary" />
            Private &amp; Secure
          </span>
        </div>
      </div>
    </footer>
  );
}

export function ChromeShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-ma-surface font-ma-body text-ma-body-md text-ma-on-surface antialiased min-h-dvh relative flex flex-col selection:bg-ma-primary selection:text-ma-on-primary">
      <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_80%_45%_at_50%_0%,rgba(148,125,255,0.18),rgba(17,19,25,0))]" />
      {children}
    </div>
  );
}

export function ChromeMain({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex-1 flex flex-col relative w-full pt-20 pb-36 px-5 max-w-[480px] mx-auto bg-ma-surface z-10">
      <div className="flex flex-col w-full">{children}</div>
    </main>
  );
}
