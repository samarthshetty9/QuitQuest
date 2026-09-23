"use client";
import type { InterventionKey, TriggerKey } from "@/lib/domain/types";
import { interventionDef } from "@/lib/config/interventions";
import { TimerIntervention } from "@/components/battle/interventions/TimerIntervention";
import { BreathingIntervention } from "@/components/battle/interventions/BreathingIntervention";
import { WaterIntervention } from "@/components/battle/interventions/WaterIntervention";
import { UrgeSurfIntervention } from "@/components/battle/interventions/UrgeSurfIntervention";
import { TalkBackIntervention } from "@/components/battle/interventions/TalkBackIntervention";
import { WhyIQuitIntervention } from "@/components/battle/interventions/WhyIQuitIntervention";
import { EnvironmentIntervention } from "@/components/battle/interventions/EnvironmentIntervention";
import { SocialSupportIntervention } from "@/components/battle/interventions/SocialSupportIntervention";
import { SubstituteIntervention } from "@/components/battle/interventions/SubstituteIntervention";
import { DistractionRouter } from "@/components/battle/interventions/DistractionRouter";

const EXTERNAL_DISTRACTIONS = [
  "Listen to a favourite song",
  "Watch something funny for a few minutes",
  "Read something",
  "Tidy one small thing for 5 minutes",
  "Take a shower",
  "Work on a small task",
  "Call or message someone",
];

export function InterventionRunner({
  intervention,
  trigger,
  moneySaved,
  currency,
  streakDays,
  onDone,
}: {
  intervention: InterventionKey;
  trigger: TriggerKey;
  moneySaved: number;
  currency: string;
  streakDays: number;
  onDone: () => void;
}) {
  const def = interventionDef(intervention);

  switch (def.category) {
    case "delay":
      return (
        <TimerIntervention
          durationSeconds={def.durationSeconds ?? 300}
          title={def.label}
          subtitle="Cravings often rise and fall. Give this one a few minutes before deciding anything."
          onDone={onDone}
        />
      );
    case "breathing":
      return <BreathingIntervention durationSeconds={def.durationSeconds ?? 60} onDone={onDone} />;
    case "water":
      return <WaterIntervention onDone={onDone} />;
    case "move":
      return (
        <TimerIntervention
          durationSeconds={def.durationSeconds ?? 300}
          title={def.label}
          subtitle="Simple movement changes your state. Timer-based is enough — no fitness tracking needed."
          onDone={onDone}
        />
      );
    case "distraction":
      return (
        <div className="flex flex-col gap-4">
          <DistractionRouter intervention={intervention} onDone={onDone} />
          <details className="mt-2 text-xs text-[var(--fg-subtle)]">
            <summary className="cursor-pointer font-medium">Prefer something else?</summary>
            <ul className="mt-2 list-disc space-y-1 pl-4">
              {EXTERNAL_DISTRACTIONS.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </details>
        </div>
      );
    case "oral":
      return <SubstituteIntervention kind="oral" onDone={onDone} />;
    case "hand":
      return <SubstituteIntervention kind="hand" onDone={onDone} />;
    case "urge_surf":
      return <UrgeSurfIntervention onDone={onDone} />;
    case "talk_back":
      return <TalkBackIntervention onDone={onDone} />;
    case "why_i_quit":
      return <WhyIQuitIntervention onDone={onDone} moneySaved={moneySaved} currency={currency} streakDays={streakDays} />;
    case "environment":
      return <EnvironmentIntervention trigger={trigger} onDone={onDone} />;
    case "social":
      return <SocialSupportIntervention onDone={onDone} />;
    default:
      return null;
  }
}
