import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/plp/Breadcrumb";
import { Filters } from "@/components/plp/Filters";
import { ProductGrid } from "@/components/plp/ProductGrid";
import { Pagination } from "@/components/plp/Pagination";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getCollectionBySlug } from "@/lib/data/collections";
import { getProductList, type SortOption } from "@/lib/data/products";

const PAGE_SIZE = 12;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);
  if (!collection) return {};
  return {
    title: collection.name,
    description: collection.description ?? `Shop the ${collection.name} collection.`,
  };
}

export default async function CollectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string; concentration?: string; page?: string }>;
}) {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);
  if (!collection) notFound();

  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const concentrations = sp.concentration?.split(",").filter(Boolean);
  const sort = (sp.sort as SortOption) ?? "newest";

  const { products, totalPages } = await getProductList({
    productIds: collection.productIds,
    concentrations,
    sort,
    page,
    pageSize: PAGE_SIZE,
  });

  return (
    <Section tone="ivory">
      <Container className="flex flex-col gap-8">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Collections" },
            { label: collection.name },
          ]}
        />
        <SectionHeading
          eyebrow="Collection"
          title={collection.name}
          description={collection.description}
          align="left"
        />
        <Filters />
        <ProductGrid products={products} />
        <Pagination
          pathname={`/collections/${slug}`}
          searchParams={sp}
          page={page}
          totalPages={totalPages}
        />
      </Container>
    </Section>
  );
}
