import { cn } from "@/lib/utils";

const formatInr = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

export function Price({
  value,
  compareAtValue,
  className,
}: {
  value: number;
  compareAtValue?: number;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-baseline gap-2 font-sans", className)}>
      <span className="text-lg font-semibold text-ink">{formatInr(value)}</span>
      {compareAtValue && compareAtValue > value && (
        <span className="text-sm text-ink/40 line-through">{formatInr(compareAtValue)}</span>
      )}
    </span>
  );
}
