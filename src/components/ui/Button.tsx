import { cn } from "@/lib/utils";
import { forwardRef, type ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "gold";
type Size = "sm" | "md" | "lg" | "xl";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantClasses: Record<Variant, string> = {
  primary: "bg-[var(--accent)] text-white hover:bg-[var(--accent-strong)] active:scale-[0.98]",
  secondary:
    "bg-[var(--bg-elevated)] text-[var(--fg)] border border-[var(--border)] hover:bg-[var(--accent-soft)]",
  ghost: "bg-transparent text-[var(--fg)] hover:bg-[var(--accent-soft)]",
  danger: "bg-[var(--danger)] text-white hover:opacity-90 active:scale-[0.98]",
  gold: "bg-[var(--gold)] text-black hover:opacity-90 active:scale-[0.98]",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-9 px-3 text-sm rounded-[var(--radius-sm)]",
  md: "h-11 px-4 text-sm rounded-[var(--radius-md)]",
  lg: "h-13 px-6 text-base rounded-[var(--radius-md)] min-h-[52px]",
  xl: "h-16 px-8 text-lg rounded-[var(--radius-lg)] min-h-[64px]",
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { className, variant = "primary", size = "md", ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none touch-manipulation select-none",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    />
  );
});
