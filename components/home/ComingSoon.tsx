import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProductCard } from "@/components/product/ProductCard";
import { cn, adaptiveProductGridColumns } from "@/lib/utils";
import { getComingSoonProducts } from "@/lib/data/products";

export async function ComingSoon() {
  const products = await getComingSoonProducts(4);
  if (products.length === 0) return null;

  return (
    <Section tone="ivory-2">
      <Container className="flex flex-col gap-10">
        <SectionHeading
          eyebrow="On The Horizon"
          title="Coming Soon"
          description="A first look at what's arriving next."
        />
        <div
          className={cn(
            "grid grid-cols-2 gap-x-6 gap-y-10",
            adaptiveProductGridColumns(products.length),
          )}
        >
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
        <div className="flex justify-center">
          <Button href="/perfumes?comingSoon=true" variant="secondary">
            View All Coming Soon
          </Button>
        </div>
      </Container>
    </Section>
  );
}
