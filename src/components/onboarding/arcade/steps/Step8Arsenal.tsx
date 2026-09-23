"use client";
import { Icon } from "@/components/onboarding/arcade/Icon";
import { cn } from "@/lib/utils";
import type { InterventionKey, TreatmentKind } from "@/lib/domain/types";

const WEAPONS: { key: InterventionKey; emoji: string; label: string; sub: string; wide?: boolean }[] = [
  { key: "water", emoji: "💧", label: "Cold ice water", sub: "30s duration" },
  { key: "breathing_2", emoji: "🌬️", label: "Box breathing", sub: "2 min duration" },
  { key: "distraction_tap", emoji: "🎮", label: "Quick game", sub: "3 min duration" },
  { key: "walk_5", emoji: "🚶", label: "Brisk walk", sub: "5 min duration" },
  { key: "urge_surf", emoji: "🌊", label: "Urge surfing", sub: "4 min duration" },
  { key: "social_support", emoji: "👥", label: "Call a friend", sub: "SOS peer lifeline" },
  { key: "oral_substitute", emoji: "🍬", label: "Chew gum / mints", sub: "Oral substitute • Instant", wide: true },
];

const SUPPORT_OPTIONS: { key: TreatmentKind; label: string }[] = [
  { key: "patch", label: "Nicotine patch" },
  { key: "gum", label: "Nicotine gum" },
  { key: "lozenge", label: "Lozenges" },
  { key: "prescription", label: "Prescriptions" },
  { key: "other", label: "Cold turkey" },
];

export function Step8Arsenal({
  arsenal,
  onToggleWeapon,
  treatments,
  onToggleTreatment,
}: {
  arsenal: InterventionKey[];
  onToggleWeapon: (key: InterventionKey) => void;
  treatments: TreatmentKind[];
  onToggleTreatment: (key: TreatmentKind) => void;
}) {
  return (
    <div className="flex flex-col gap-6 pb-4">
      <div className="flex flex-col gap-1">
        <h1 className="font-ma-heading text-ma-headline-lg text-ma-on-surface tracking-tight">Build your coping kit</h1>
        <p className="font-ma-body text-ma-body-md text-ma-on-surface-variant">
          Pick 3 to 5 quick tools ready to deploy when a craving hits.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="font-ma-body text-ma-label-sm uppercase tracking-widest text-ma-outline">Quick-Response Tools</span>
          <span className="font-ma-body text-ma-label-sm text-ma-primary-fixed bg-ma-primary-container/20 px-2 py-0.5 rounded-full font-semibold">
            {arsenal.length} Selected
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {WEAPONS.map((w) => {
            const active = arsenal.includes(w.key);
            return (
              <button
                key={w.key}
                type="button"
                aria-pressed={active}
                onClick={() => onToggleWeapon(w.key)}
                className={cn(
                  "flex items-center gap-2 p-3 rounded-xl text-left transition-all active:scale-[0.98]",
                  w.wide && "col-span-2",
                  active
                    ? "bg-ma-primary-container/20 border border-ma-primary/30 text-ma-on-surface"
                    : "bg-ma-surface-container-high/60 border border-transparent text-ma-on-surface-variant hover:bg-ma-surface-container"
                )}
              >
                <span className="text-[24px]">{w.emoji}</span>
                <div className="flex flex-col flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-ma-heading text-[14px] text-ma-on-surface font-semibold">{w.label}</span>
                    {active && <Icon name="check_circle" filled size={16} className="text-ma-primary" />}
                  </div>
                  <span className={cn("font-ma-body text-[12px]", active ? "text-ma-primary-fixed-dim" : "text-ma-outline")}>
                    {w.sub}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-0.5">
          <span className="font-ma-body text-ma-label-sm uppercase tracking-widest text-ma-outline">Tactical Support</span>
          <span className="font-ma-heading text-[15px] text-ma-on-surface font-semibold">Are you using any quit aids?</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {SUPPORT_OPTIONS.map((s) => {
            const active = treatments.includes(s.key);
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => onToggleTreatment(s.key)}
                className={cn(
                  "px-4 py-2 rounded-full font-ma-body text-ma-label-md transition-all active:scale-95",
                  active
                    ? "bg-ma-secondary-container/30 text-ma-secondary-fixed border border-ma-secondary/40 inline-flex items-center gap-1.5"
                    : "bg-ma-surface-container-high text-ma-on-surface-variant hover:text-ma-on-surface"
                )}
              >
                {active && <span className="w-1.5 h-1.5 rounded-full bg-ma-secondary" />}
                {s.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
