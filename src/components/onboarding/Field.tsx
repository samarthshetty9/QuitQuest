export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-[var(--fg)]">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-[var(--fg-subtle)]">{hint}</span>}
    </label>
  );
}

export const inputClass =
  "w-full min-h-[44px] rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--bg-elevated)] px-3.5 py-2.5 text-base text-[var(--fg)] outline-none transition-colors focus:border-[var(--accent)]";
