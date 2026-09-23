import { cn } from "@/lib/utils";

export function Chip({
  selected,
  onClick,
  children,
  className,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "flex min-h-[44px] items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition-colors",
        selected
          ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent-strong)]"
          : "border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--fg-muted)] hover:border-[var(--accent)]",
        className
      )}
    >
      {children}
    </button>
  );
}
