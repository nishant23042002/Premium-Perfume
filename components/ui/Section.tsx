import { cn } from "@/lib/utils";
import { Reveal } from "@/components/ui/Reveal";

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
    <section
      className={cn(
        // A hairline top border on every section guarantees a visible seam
        // between adjacent sections even when they happen to share the same
        // background tone — relying on the ivory/ivory-2 tint alone (a 6%
        // color-mix) isn't enough contrast on its own to read as a boundary.
        "border-t border-ink/10 py-14 sm:py-24",
        toneClasses[tone],
        className,
      )}
    >
      <Reveal>{children}</Reveal>
    </section>
  );
}
