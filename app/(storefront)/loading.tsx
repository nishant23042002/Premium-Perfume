import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Skeleton } from "@/components/ui/Skeleton";
import { ProductGridSkeleton } from "@/components/plp/ProductGridSkeleton";
import { HeroSkeleton } from "@/components/home/HeroSkeleton";

// Doesn't need to mirror all 10 home sections — just enough of the top of
// the page (hero + first product grid) that navigating back to "/" isn't a
// blank flash while the rest streams in behind it.
export default function Loading() {
  return (
    <>
      <HeroSkeleton />
      <Section tone="ivory">
        <Container className="flex flex-col gap-10 px-3">
          <div className="flex flex-col items-center gap-3">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-8 w-64" />
          </div>
          <ProductGridSkeleton count={4} />
        </Container>
      </Section>
    </>
  );
}
