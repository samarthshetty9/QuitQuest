"use client";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { TALK_BACK_THOUGHTS } from "@/lib/config/talkback";
import { getCopingPreferences, saveCopingPreferences } from "@/lib/db/repo";
import { makeId } from "@/lib/domain/id";

export function TalkBackIntervention({ onDone }: { onDone: () => void }) {
  const [pickedKey, setPickedKey] = useState<string | null>(null);
  const [customThought, setCustomThought] = useState("");
  const [showCustom, setShowCustom] = useState(false);

  const picked = TALK_BACK_THOUGHTS.find((t) => t.key === pickedKey);

  async function saveHelpful() {
    if (!picked) return;
    const prefs = await getCopingPreferences();
    await saveCopingPreferences({
      ...prefs,
      talkBackResponses: [
        ...prefs.talkBackResponses,
        {
          id: makeId("tb"),
          thoughtKey: picked.key,
          responseText: picked.response,
          isUserCreated: false,
          timesUsed: (prefs.talkBackResponses.find((r) => r.thoughtKey === picked.key)?.timesUsed ?? 0) + 1,
        },
      ].filter(
        (r, i, arr) => arr.findIndex((x) => x.thoughtKey === r.thoughtKey) === i || r.isUserCreated
      ),
    });
    onDone();
  }

  if (showCustom) {
    return (
      <div className="flex flex-col gap-4 py-4">
        <p className="text-lg font-semibold">What&apos;s the thought?</p>
        <textarea
          className="min-h-[80px] w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--bg-elevated)] p-3 text-sm"
          value={customThought}
          onChange={(e) => setCustomThought(e.target.value)}
          placeholder="Type the thought that's driving this craving..."
        />
        <Button
          size="lg"
          disabled={!customThought.trim()}
          onClick={async () => {
            const prefs = await getCopingPreferences();
            await saveCopingPreferences({
              ...prefs,
              talkBackResponses: [
                ...prefs.talkBackResponses,
                {
                  id: makeId("tb"),
                  thoughtKey: "custom",
                  customThought,
                  responseText: "",
                  isUserCreated: true,
                  timesUsed: 1,
                },
              ],
            });
            onDone();
          }}
        >
          Save and continue
        </Button>
      </div>
    );
  }

  if (!picked) {
    return (
      <div className="flex flex-col gap-3 py-2">
        <p className="mb-1 text-lg font-semibold">Which thought is loudest right now?</p>
        {TALK_BACK_THOUGHTS.map((t) => (
          <button
            key={t.key}
            onClick={() => setPickedKey(t.key)}
            className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3 text-left text-sm font-medium transition-colors hover:border-[var(--accent)]"
          >
            &ldquo;{t.thought}&rdquo;
          </button>
        ))}
        <button onClick={() => setShowCustom(true)} className="text-sm font-medium text-[var(--accent)] underline">
          It&apos;s something else
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 py-4">
      <p className="text-sm text-[var(--fg-subtle)]">&ldquo;{picked.thought}&rdquo;</p>
      <div className="rounded-[var(--radius-md)] border border-[var(--accent)] bg-[var(--accent-soft)] p-4">
        <p className="text-base font-medium text-[var(--accent-strong)]">{picked.response}</p>
      </div>
      <Button size="lg" onClick={saveHelpful}>
        That helps
      </Button>
    </div>
  );
}
