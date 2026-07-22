import { cn, formatInr } from "@/lib/utils";

export function Price({
  value,
  compareAtValue,
  className,
  size = "md",
}: {
  value: number;
  compareAtValue?: number;
  className?: string;
  size?: "sm" | "md";
}) {
  return (
    <span className={cn("inline-flex items-baseline gap-2 font-sans", className)}>
      <span className={cn("font-semibold text-ink", size === "md" ? "text-lg" : "text-sm")}>
        {formatInr(value)}
      </span>
      {compareAtValue && compareAtValue > value && (
        <span className={cn("text-ink/40 line-through", size === "md" ? "text-sm" : "text-xs")}>
          {formatInr(compareAtValue)}
        </span>
      )}
    </span>
  );
}
