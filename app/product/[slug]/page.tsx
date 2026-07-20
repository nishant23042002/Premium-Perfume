import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Container } from "@/components/ui/Container";
import { Divider } from "@/components/ui/Divider";
import { Rating } from "@/components/ui/Rating";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Breadcrumb } from "@/components/plp/Breadcrumb";
import { Gallery } from "@/components/pdp/Gallery";
import { PurchasePanel } from "@/components/pdp/PurchasePanel";
import { NotesPyramid } from "@/components/pdp/NotesPyramid";
import { ReviewsSection } from "@/components/pdp/ReviewsSection";
import { RelatedProducts } from "@/components/pdp/RelatedProducts";
import { FaqAccordion } from "@/components/faq/FaqAccordion";
import { getProductBySlug } from "@/lib/data/products";
import { getFaqsForProduct } from "@/lib/data/faqs";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};

  return {
    title: product.seo?.metaTitle || product.name,
    description: product.seo?.metaDescription || product.shortDescription,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const faqs = await getFaqsForProduct(product._id);

  return (
    <Section tone="ivory">
      <Container className="flex flex-col gap-16">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "All Perfumes", href: "/perfumes" },
            { label: product.name },
          ]}
        />

        <div className="grid gap-10 lg:grid-cols-2">
          <Gallery images={product.images} />

          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap gap-2">
              <Badge tone="ink">{product.concentration}</Badge>
              {product.isBestseller && <Badge tone="accent">Bestseller</Badge>}
              {product.isNewArrival && <Badge tone="ink">New</Badge>}
              {product.isLimitedEdition && <Badge tone="secondary">Limited</Badge>}
            </div>

            <h1 className="font-display text-4xl text-secondary">{product.name}</h1>

            {product.rating.count > 0 && (
              <a href="#reviews" className="w-fit">
                <Rating value={product.rating.average} count={product.rating.count} />
              </a>
            )}

            {product.shortDescription && (
              <p className="font-sans text-base text-ink/70">{product.shortDescription}</p>
            )}

            <Divider className="justify-start" />

            <PurchasePanel productId={product._id} variants={product.variants} />

            {product.highlights.length > 0 && (
              <ul className="flex flex-col gap-2 pt-2">
                {product.highlights.map((highlight) => (
                  <li key={highlight} className="flex items-start gap-2 font-sans text-sm text-ink/70">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent-dark" />
                    {highlight}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <SectionHeading eyebrow="Composition" title="Notes Pyramid" align="left" />
          <NotesPyramid notes={product.notes} />
        </div>

        {product.description && (
          <div className="flex max-w-3xl flex-col gap-4">
            <SectionHeading eyebrow="About" title="The Story" align="left" />
            <p className="font-sans text-sm text-ink/70">{product.description}</p>
          </div>
        )}

        {(product.howToUse || product.ingredients) && (
          <div className="grid gap-10 sm:grid-cols-2">
            {product.howToUse && (
              <div className="flex flex-col gap-3">
                <h2 className="font-sans text-sm font-semibold uppercase tracking-[0.1em] text-ink">
                  How to Use
                </h2>
                <p className="font-sans text-sm text-ink/70">{product.howToUse}</p>
              </div>
            )}
            {product.ingredients && (
              <div className="flex flex-col gap-3">
                <h2 className="font-sans text-sm font-semibold uppercase tracking-[0.1em] text-ink">
                  Ingredients
                </h2>
                <p className="font-sans text-sm text-ink/70">{product.ingredients}</p>
              </div>
            )}
          </div>
        )}

        {faqs.length > 0 && (
          <div className="flex max-w-2xl flex-col gap-6">
            <SectionHeading eyebrow="Support" title="Frequently Asked Questions" align="left" />
            <FaqAccordion items={faqs} />
          </div>
        )}

        <div className="flex flex-col gap-6">
          <SectionHeading eyebrow="Reviews" title="Customer Reviews" align="left" />
          <ReviewsSection productId={product._id} rating={product.rating} />
        </div>

        <div className="flex flex-col gap-6">
          <SectionHeading eyebrow="Discover More" title="You May Also Like" align="left" />
          <RelatedProducts productId={product._id} categoryIds={product.categoryIds} />
        </div>
      </Container>
    </Section>
  );
}
