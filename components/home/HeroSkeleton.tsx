import { Container } from "@/components/ui/Container";
import { Skeleton } from "@/components/ui/Skeleton";

/** Mirrors HeroCarousel's own shape exactly — same aspect-ratio steps
 * (portrait on phones, widening through tablet to a cinematic strip on
 * desktop) and the same text/CTA placement, mobile-bottom vs
 * desktop-inline — so nothing jumps in size or position once the real
 * banner and copy stream in. */
export function HeroSkeleton() {
  return (
    <div className="relative flex aspect-[4/5] max-h-[720px] w-full flex-col items-stretch justify-start overflow-hidden bg-ivory sm:aspect-[3/2] sm:justify-center lg:aspect-[21/9]">
      <Skeleton className="absolute inset-0" />

      <Container className="relative z-[1] flex flex-1 flex-col justify-start px-4 pt-6 pb-8 sm:flex-none sm:justify-center sm:py-0">
        <div className="mx-auto flex max-w-[13rem] flex-col items-center gap-3 sm:mx-0 sm:max-w-md sm:items-start">
          <div className="h-2.5 w-20 rounded-none bg-ivory/40 sm:h-3 sm:w-28" />
          <div className="h-7 w-full rounded-none bg-ivory/40 sm:h-11 sm:w-4/5" />
          <div className="hidden h-9 w-32 rounded-none bg-ivory/40 sm:block" />
        </div>
      </Container>

      {/* Mobile-only CTA placeholder, re-anchored to the bottom like the
          real mobile layout — the desktop one above stays hidden here. */}
      <div className="absolute bottom-8 left-1/2 z-[1] -translate-x-1/2 sm:hidden">
        <div className="h-9 w-32 rounded-none bg-ivory/40" />
      </div>
    </div>
  );
}
