"use client";
import { useState } from "react";
import { Icon } from "@/components/onboarding/arcade/Icon";
import { cn } from "@/lib/utils";
import type { TriggerKey } from "@/lib/domain/types";

interface TriggerOption {
  key: TriggerKey;
  label: string;
  emoji: string;
}

const CATEGORIES: { title: string; icon: string; options: TriggerOption[] }[] = [
  {
    title: "Routine",
    icon: "schedule",
    options: [
      { key: "morning", label: "Morning", emoji: "☀️" },
      { key: "coffee", label: "Coffee / Tea", emoji: "☕" },
      { key: "after_food", label: "After meals", emoji: "🍽️" },
      { key: "driving", label: "Driving", emoji: "🚗" },
    ],
  },
  {
    title: "Emotional",
    icon: "psychology",
    options: [
      { key: "stress", label: "Stress", emoji: "😥" },
      { key: "anxiety", label: "Anxiety", emoji: "😰" },
      { key: "boredom", label: "Boredom", emoji: "🥱" },
      { key: "anger", label: "Anger", emoji: "😠" },
    ],
  },
  {
    title: "Social",
    icon: "groups",
    options: [
      { key: "alcohol", label: "Social drinks", emoji: "🍻" },
      { key: "work_break", label: "Work breaks", emoji: "💼" },
      { key: "other_smokers", label: "Around smokers", emoji: "🚬" },
      { key: "late_night", label: "Late night", emoji: "🌙" },
    ],
  },
];

export function Step5Triggers({
  triggers,
  onToggle,
  customTriggers,
  onAddCustom,
}: {
  triggers: TriggerKey[];
  onToggle: (key: TriggerKey) => void;
  customTriggers: string[];
  onAddCustom: (label: string) => void;
}) {
  const [customText, setCustomText] = useState("");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 pt-1">
        <h1 className="font-ma-heading text-ma-headline-lg text-ma-on-surface tracking-tight">What triggers your cravings?</h1>
        <p className="font-ma-body text-ma-body-md text-ma-on-surface-variant">Select all that apply.</p>
      </div>

      <div className="flex flex-col gap-6">
        {CATEGORIES.map((cat) => {
          const count = cat.options.filter((o) => triggers.includes(o.key)).length;
          return (
            <div key={cat.title} className="flex flex-col gap-2">
              <div className="flex items-center justify-between px-0.5">
                <span className="font-ma-body text-ma-label-sm uppercase tracking-wider text-ma-outline font-bold flex items-center gap-1.5">
                  <Icon name={cat.icon} size={14} /> {cat.title}
                </span>
                {count > 0 && <span className="font-ma-body text-ma-label-sm text-ma-on-surface-variant">{count} selected</span>}
              </div>
              <div className="flex flex-wrap gap-2">
                {cat.options.map((opt) => {
                  const active = triggers.includes(opt.key);
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => onToggle(opt.key)}
                      className={cn(
                        "inline-flex items-center gap-2 px-3 py-2.5 rounded-full transition-all active:scale-95",
                        active
                          ? "bg-ma-primary-container/30 text-ma-primary-fixed shadow-md"
                          : "bg-ma-surface-container text-ma-on-surface hover:bg-ma-surface-container-high shadow-sm"
                      )}
                    >
                      <span className="text-base">{opt.emoji}</span>
                      <span className={cn("font-ma-body", active ? "font-ma-heading text-ma-headline-sm font-medium" : "text-ma-body-md")}>
                        {opt.label}
                      </span>
                      {active && <Icon name="check_circle" size={16} className="text-ma-primary ml-0.5" />}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-1">
        {customTriggers.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {customTriggers.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full font-ma-body text-ma-label-md bg-ma-primary-container/30 text-ma-primary-fixed font-semibold"
              >
                {t}
              </span>
            ))}
          </div>
        )}
        <div className="relative w-full rounded-xl bg-ma-surface-container p-1 flex items-center shadow-inner">
          <input
            className="w-full bg-transparent px-3 py-2.5 text-ma-on-surface placeholder:text-ma-outline font-ma-body text-ma-body-md focus:outline-none"
            placeholder="+ Add custom trigger..."
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
          />
          <button
            type="button"
            onClick={() => {
              if (customText.trim()) {
                onAddCustom(customText.trim());
                setCustomText("");
              }
            }}
            className="h-10 px-3 rounded-lg bg-ma-surface-container-highest hover:bg-ma-surface-bright text-ma-primary font-ma-body text-ma-label-md font-semibold flex items-center gap-1 transition-all active:scale-95 shrink-0"
          >
            <Icon name="add" size={16} />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
}
