"use client";
import { Icon } from "@/components/onboarding/arcade/Icon";

const CHIPS = [
  { label: "⚡ 3-minute rule", insert: "Remember: cravings peak within 3 minutes and then fade. Wait it out." },
  { label: "🫁 Lungs healing", insert: "My lungs and body are actively healing right now. Don't interrupt progress." },
  { label: "💰 Remember the savings", insert: "Think of the money saved and the long-term freedom you promised yourself." },
];

export function Step7FutureSelf({
  message,
  onChange,
}: {
  message: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-6 pb-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-ma-headline-lg text-ma-on-surface font-ma-heading tracking-tight">A message to your future self</h1>
        <p className="text-ma-body-md text-ma-on-surface-variant font-ma-body">
          When you feel an intense craving, we&apos;ll show you this reminder.
        </p>
      </div>

      <div className="flex flex-col rounded-xl bg-ma-surface-container-low shadow-xl relative overflow-hidden">
        <div className="p-4 pb-2 flex items-center gap-2">
          <Icon name="format_quote" className="text-ma-primary shrink-0" size={20} />
          <p className="text-ma-label-lg text-ma-primary-fixed font-ma-body">Remind me that&hellip;</p>
        </div>
        <div className="px-4 pb-4 flex flex-col gap-2">
          <div className="relative rounded-lg bg-ma-surface-container-highest/40 p-3 focus-within:bg-ma-surface-container-highest/70 transition-all">
            <textarea
              className="w-full bg-transparent resize-none text-ma-on-surface text-ma-body-md font-ma-body focus:outline-none placeholder:text-ma-outline/60 leading-relaxed selection:bg-ma-primary selection:text-ma-on-primary"
              maxLength={300}
              placeholder="Write something only future-you will read at the critical moment..."
              rows={4}
              value={message}
              onChange={(e) => onChange(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-end pt-1 px-1">
            <span className="text-ma-outline text-ma-label-sm font-ma-body">{message.length} / 300</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-ma-label-sm font-ma-body text-ma-outline tracking-wider">Tap to insert inspiration</span>
        <div className="flex flex-wrap gap-2">
          {CHIPS.map((chip) => (
            <button
              key={chip.label}
              type="button"
              onClick={() => onChange(chip.insert)}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-full bg-ma-surface-container hover:bg-ma-surface-container-high text-ma-on-surface text-ma-body-sm font-ma-body active:scale-95 transition-all shadow-sm"
            >
              <span>{chip.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
