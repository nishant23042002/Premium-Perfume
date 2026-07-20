import { cn } from "@/lib/utils";

export function Divider({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center gap-3", className)}>
      <span className="h-px w-12 bg-accent/60" />
      <span className="h-1.5 w-1.5 rotate-45 bg-accent" />
      <span className="h-px w-12 bg-accent/60" />
    </div>
  );
}
