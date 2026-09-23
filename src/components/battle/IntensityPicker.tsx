"use client";
import { cn } from "@/lib/utils";

export function IntensityPicker({ value, onChange }: { value?: number; onChange: (v: number) => void }) {
  return (
    <div className="grid grid-cols-5 gap-2.5">
      {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          onClick={() => onChange(n)}
          aria-pressed={value === n}
          className={cn(
            "flex h-14 min-w-[44px] items-center justify-center rounded-[var(--radius-md)] border text-lg font-bold transition-all",
            value === n
              ? "scale-105 border-transparent text-white"
              : "border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--fg)] hover:border-[var(--accent)]"
          )}
          style={value === n ? { background: intensityColor(n) } : undefined}
        >
          {n}
        </button>
      ))}
    </div>
  );
}

export function intensityColor(n: number): string {
  if (n <= 3) return "var(--success)";
  if (n <= 6) return "var(--gold)";
  return "var(--danger)";
}
