import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Skeleton } from "@/components/ui/Skeleton";

/** Mirrors the About page's own centered, editorial layout — eyebrow +
 * headline + divider, a short paragraph block, the three-fragrance-names
 * row, and the closing brand signoff — rather than a generic text-block
 * stack that could pass for any page. */
export function AboutSkeleton() {
  return (
    <Section tone="ivory">
      <Container className="flex flex-col items-center gap-14 px-4 text-center">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="h-3 w-40" />
          <Skeleton className="h-9 w-full max-w-md sm:h-11 sm:max-w-xl" />
          <Skeleton className="h-px w-16" />
        </div>

        <div className="flex w-full max-w-2xl flex-col items-center gap-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="mt-2 h-6 w-56" />
        </div>

        <div className="flex flex-col items-center gap-6">
          <Skeleton className="h-8 w-full max-w-xs sm:h-9 sm:max-w-sm" />
          <Skeleton className="h-3 w-64" />
        </div>

        <div className="flex w-full flex-col items-center gap-3 border-t border-ink/10 pt-10">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-3 w-48" />
        </div>
      </Container>
    </Section>
  );
}
