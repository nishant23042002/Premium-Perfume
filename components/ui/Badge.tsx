import { cn } from "@/lib/utils";

type Tone = "accent" | "ink" | "secondary" | "secondary-solid";

const toneClasses: Record<Tone, string> = {
  accent: "bg-accent/15 text-accent-dark border-accent/40",
  ink: "bg-ink/5 text-ink border-ink/25",
  secondary: "bg-secondary/10 text-secondary border-secondary/40",
  // A solid, opaque backing with light text — for badges that float directly
  // on top of product photography, where the translucent `secondary` tone's
  // dark-on-light-tint text doesn't have reliable contrast against whatever
  // colors happen to be in the photo underneath.
  "secondary-solid": "bg-secondary text-ivory border-secondary",
};

export function Badge({
  tone = "accent",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center border px-2.5 py-1 font-sans text-[11px] font-medium uppercase tracking-[0.12em]",
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
