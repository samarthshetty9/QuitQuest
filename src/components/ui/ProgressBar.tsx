import { cn } from "@/lib/utils";

export function ProgressBar({
  value,
  max,
  className,
  colorVar = "--accent",
  trackClassName,
}: {
  value: number;
  max: number;
  className?: string;
  colorVar?: string;
  trackClassName?: string;
}) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  return (
    <div
      className={cn("h-2.5 w-full overflow-hidden rounded-full bg-[var(--border)]", trackClassName, className)}
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={max}
    >
      <div
        className="h-full rounded-full transition-[width] duration-500 ease-out"
        style={{ width: `${pct}%`, background: `var(${colorVar})` }}
      />
    </div>
  );
}
