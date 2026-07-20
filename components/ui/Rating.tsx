import { cn } from "@/lib/utils";

function StarRow({ className }: { className?: string }) {
  return (
    <div className={cn("flex gap-0.5", className)}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} viewBox="0 0 20 20" className="h-4 w-4 fill-current">
          <path d="M10 1.5l2.6 5.6 6.1.6-4.6 4.2 1.3 6-5.4-3.1-5.4 3.1 1.3-6-4.6-4.2 6.1-.6z" />
        </svg>
      ))}
    </div>
  );
}

export function Rating({
  value,
  count,
  className,
}: {
  value: number;
  count?: number;
  className?: string;
}) {
  const percent = Math.max(0, Math.min(1, value / 5)) * 100;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative">
        <StarRow className="text-ink/15" />
        <div className="absolute inset-0 overflow-hidden" style={{ width: `${percent}%` }}>
          <StarRow className="text-accent" />
        </div>
      </div>
      {typeof count === "number" && (
        <span className="font-sans text-xs text-ink/60">({count})</span>
      )}
    </div>
  );
}
