import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProductCard } from "@/components/product/ProductCard";
import { getBestsellerProducts } from "@/lib/data/products";

export async function BestSellers() {
  const products = await getBestsellerProducts(4);
  if (products.length === 0) return null;

  return (
    <Section tone="ivory">
      <Container className="flex px-3 flex-col gap-10">
        <SectionHeading
          eyebrow="Most Loved"
          title="Bestsellers"
          description="Chosen again and again by returning customers."
        />
        <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
        <div className="flex justify-center">
          <Button href="/collections/bestsellers" variant="secondary">
            View All Bestsellers
          </Button>
        </div>
      </Container>
    </Section>
  );
}
