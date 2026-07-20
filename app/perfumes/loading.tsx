import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { ProductGridSkeleton } from "@/components/plp/ProductGridSkeleton";

export default function Loading() {
  return (
    <Section tone="ivory">
      <Container className="flex flex-col gap-8">
        <ProductGridSkeleton />
      </Container>
    </Section>
  );
}
