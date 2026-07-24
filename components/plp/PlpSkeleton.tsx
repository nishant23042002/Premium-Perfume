import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Skeleton } from "@/components/ui/Skeleton";
import { ProductGridSkeleton } from "@/components/plp/ProductGridSkeleton";

/** Shared shell for every product-grid route (all perfumes, a category, a
 * collection, search) — they all resolve to the same Section/Container/
 * Breadcrumb/Filters/ProductGrid layout. */
export function PlpSkeleton() {
  return (
    <Section tone="ivory">
      <Container className="flex flex-col gap-8 px-3">
        <Skeleton className="h-4 w-48" />
        <div className="flex flex-col gap-3">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-8 w-64" />
        </div>
        <Skeleton className="h-10 w-full max-w-md" />
        <ProductGridSkeleton />
      </Container>
    </Section>
  );
}
