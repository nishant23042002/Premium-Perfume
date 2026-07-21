import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProductCard } from "@/components/product/ProductCard";
import { getNewArrivals } from "@/lib/data/products";

export async function NewArrivals() {
  const products = await getNewArrivals(4);
  if (products.length === 0) return null;

  return (
    <Section tone="ivory">
      <Container className="flex flex-col gap-10">
        <SectionHeading
          eyebrow="Just Landed"
          title="New Arrivals"
          description="The newest additions to the Vellora collection."
        />
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
        <div className="flex justify-center">
          <Button href="/perfumes?sort=newest" variant="secondary">
            View All New Arrivals
          </Button>
        </div>
      </Container>
    </Section>
  );
}
