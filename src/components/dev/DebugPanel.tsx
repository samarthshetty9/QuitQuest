"use client";
import { useState } from "react";
import { Bug } from "lucide-react";
import { clock, isTestControlAllowed } from "@/lib/time/clock";
import { loadDemoProfile, resetToFreshInstall } from "@/lib/dev/seed";
import { awardXp } from "@/lib/db/repo";
import { makeId } from "@/lib/domain/id";
import { logSlip } from "@/lib/game/engine";

export function DebugPanel() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!isTestControlAllowed()) return null;

  async function run(fn: () => Promise<void>) {
    setBusy(true);
    try {
      await fn();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed right-4 top-4 z-50">
      {open && (
        <div className="mb-2 w-64 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-elevated)] p-3 shadow-[var(--shadow-card)]">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[var(--fg-subtle)]">Dev Debug Panel</p>
          <div className="flex flex-col gap-1.5">
            <DebugButton label="+1 day" onClick={() => run(async () => clock.advance(24 * 60 * 60 * 1000))} />
            <DebugButton label="+1 hour" onClick={() => run(async () => clock.advance(60 * 60 * 1000))} />
            <DebugButton
              label="Load demo profile"
              onClick={() => run(loadDemoProfile)}
            />
            <DebugButton
              label="Add 100 XP"
              onClick={() => run(async () => {
                await awardXp("milestone", `debug_xp:${makeId("x")}`, 100);
              })}
            />
            <DebugButton
              label="Log test slip"
              onClick={() => run(async () => {
                await logSlip({ cigaretteCount: 1, trigger: "stress", learnings: ["stress"] });
              })}
            />
            <DebugButton
              label="Reset clock"
              onClick={() => run(async () => clock.reset())}
            />
            <DebugButton
              label="Reset all data"
              danger
              onClick={() => run(async () => {
                if (confirm("Reset all local data?")) await resetToFreshInstall();
              })}
            />
          </div>
          <p className="mt-2 text-[10px] text-[var(--fg-subtle)]">Dev-only. Never shown in production builds.</p>
        </div>
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={busy}
        aria-label="Toggle dev debug panel"
        className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--fg-subtle)] shadow-[var(--shadow-card)]"
      >
        <Bug size={18} />
      </button>
    </div>
  );
}

function DebugButton({ label, onClick, danger }: { label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-[var(--radius-sm)] border border-[var(--border)] px-2.5 py-1.5 text-left text-xs font-medium ${
        danger ? "text-[var(--danger)]" : "text-[var(--fg)]"
      } hover:bg-[var(--accent-soft)]`}
    >
      {label}
    </button>
  );
}
