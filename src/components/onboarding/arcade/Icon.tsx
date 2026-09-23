import { cn } from "@/lib/utils";

export function Icon({
  name,
  className,
  filled,
  size,
}: {
  name: string;
  className?: string;
  filled?: boolean;
  size?: number;
}) {
  return (
    <span
      className={cn("material-symbols-outlined select-none", className)}
      style={{
        fontSize: size ? `${size}px` : undefined,
        fontVariationSettings: filled ? "'FILL' 1" : undefined,
      }}
      aria-hidden
    >
      {name}
    </span>
  );
}
