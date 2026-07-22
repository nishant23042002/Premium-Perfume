import { cn } from "@/lib/utils";

export function AdminCard({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-admin-border bg-admin-surface shadow-sm shadow-black/[0.02]",
        className,
      )}
    >
      {children}
    </div>
  );
}
