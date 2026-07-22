import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/plp/Breadcrumb";
import { Filters } from "@/components/plp/Filters";
import { ProductGrid } from "@/components/plp/ProductGrid";
import { Pagination } from "@/components/plp/Pagination";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getCategoryBySlug } from "@/lib/data/categories";
import { getProductList, type SortOption } from "@/lib/data/products";

const PAGE_SIZE = 12;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category: slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return {};
  return {
    title: category.name,
    description: category.description ?? `Shop ${category.name} fragrances.`,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ sort?: string; concentration?: string; page?: string }>;
}) {
  const { category: slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const concentrations = sp.concentration?.split(",").filter(Boolean);
  const sort = (sp.sort as SortOption) ?? "newest";

  const { products, totalPages } = await getProductList({
    categoryId: category._id,
    concentrations,
    sort,
    page,
    pageSize: PAGE_SIZE,
  });

  return (
    <Section tone="ivory">
      <Container className="flex flex-col gap-8 px-3">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "All Perfumes", href: "/perfumes" },
            { label: category.name },
          ]}
        />
        <SectionHeading eyebrow="Shop" title={category.name} align="left" />
        <Filters />
        <ProductGrid products={products} />
        <Pagination
          pathname={`/perfumes/${slug}`}
          searchParams={sp}
          page={page}
          totalPages={totalPages}
        />
      </Container>
    </Section>
  );
}
