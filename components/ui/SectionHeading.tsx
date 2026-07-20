import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "center" | "left";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        align === "center" ? "items-center text-center" : "items-start text-left",
        className,
      )}
    >
      {eyebrow && (
        <span className="font-sans text-xs font-medium uppercase tracking-[0.25em] text-accent-dark">
          {eyebrow}
        </span>
      )}
      <h2 className="font-display text-3xl leading-tight sm:text-4xl">{title}</h2>
      {description && (
        <p className="max-w-xl font-sans text-base text-current/70">{description}</p>
      )}
    </div>
  );
}
