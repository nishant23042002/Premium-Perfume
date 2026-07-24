import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Skeleton } from "@/components/ui/Skeleton";
import { ProductGridSkeleton } from "@/components/plp/ProductGridSkeleton";

// Doesn't need to mirror all 10 home sections — just enough of the top of
// the page (hero + first product grid) that navigating back to "/" isn't a
// blank flash while the rest streams in behind it.
export default function Loading() {
  return (
    <>
      <Section tone="ivory" className="flex flex-col items-center gap-6 text-center">
        <Container className="flex flex-col items-center gap-6 px-4">
          <Skeleton className="h-3 w-48" />
          <Skeleton className="h-12 w-full max-w-xl" />
          <Skeleton className="h-4 w-full max-w-md" />
        </Container>
      </Section>
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
