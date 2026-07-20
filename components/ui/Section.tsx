import { cn } from "@/lib/utils";

const toneClasses = {
  ivory: "bg-ivory text-ink",
  "ivory-2": "bg-ivory-2 text-ink",
} as const;

export function Section({
  tone = "ivory",
  className,
  children,
}: {
  tone?: keyof typeof toneClasses;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn("py-16 sm:py-24", toneClasses[tone], className)}>
      {children}
    </section>
  );
}
