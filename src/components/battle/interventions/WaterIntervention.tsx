"use client";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Droplet } from "lucide-react";

export function WaterIntervention({ onDone }: { onDone: () => void }) {
  const [gone, setGone] = useState(false);
  return (
    <div className="flex flex-col items-center gap-6 py-8 text-center">
      <Droplet size={56} className="text-[var(--accent)]" />
      {!gone ? (
        <>
          <p className="text-lg font-semibold">Get a glass of water.</p>
          <p className="max-w-xs text-sm text-[var(--fg-muted)]">Get up, pour a glass, and come back. Take your time.</p>
          <Button size="lg" onClick={() => setGone(true)}>
            I&apos;m getting it
          </Button>
        </>
      ) : (
        <>
          <p className="text-lg font-semibold">Welcome back.</p>
          <Button size="lg" onClick={onDone}>
            I&apos;m back
          </Button>
        </>
      )}
    </div>
  );
}
