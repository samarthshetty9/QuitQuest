"use client";
import { Button } from "@/components/ui/Button";

const ORAL_SUGGESTIONS = ["Sugar-free gum", "A mint", "A crunchy snack", "Carrots, celery, or an apple", "A glass of water", "A straw or toothpick"];
const HAND_SUGGESTIONS = ["A stress ball", "A pen or pencil — try doodling", "A coin to fidget with", "A fidget item", "Holding a water bottle", "Typing a quick note"];

export function SubstituteIntervention({ kind, onDone }: { kind: "oral" | "hand"; onDone: () => void }) {
  const suggestions = kind === "oral" ? ORAL_SUGGESTIONS : HAND_SUGGESTIONS;
  return (
    <div className="flex flex-col gap-4 py-2">
      <p className="text-lg font-semibold">{kind === "oral" ? "Give your mouth something to do" : "Give your hands something to do"}</p>
      <ul className="grid grid-cols-2 gap-2">
        {suggestions.map((s) => (
          <li key={s} className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-3 text-sm">
            {s}
          </li>
        ))}
      </ul>
      <Button size="lg" onClick={onDone}>
        Got it, continue
      </Button>
    </div>
  );
}
