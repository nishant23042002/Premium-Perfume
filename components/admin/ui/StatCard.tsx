import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminCard } from "@/components/admin/ui/AdminCard";

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "neutral",
  hint,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: "neutral" | "accent" | "danger";
  hint?: string;
}) {
  return (
    <AdminCard className="flex flex-col gap-3 p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-[0.08em] text-admin-ink-faint">{label}</span>
        <span
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg",
            tone === "accent" && "bg-admin-accent/15 text-admin-accent-dark",
            tone === "danger" && "bg-admin-danger-bg text-admin-danger",
            tone === "neutral" && "bg-admin-bg text-admin-ink-soft",
          )}
        >
          <Icon className="h-4 w-4" strokeWidth={1.75} />
        </span>
      </div>
      <span className="text-2xl font-semibold tabular-nums text-admin-ink">{value}</span>
      {hint && <span className="text-xs text-admin-ink-faint">{hint}</span>}
    </AdminCard>
  );
}
