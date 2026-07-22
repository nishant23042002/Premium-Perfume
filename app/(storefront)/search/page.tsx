import type { Metadata } from "next";
import { Breadcrumb } from "@/components/plp/Breadcrumb";
import { Filters } from "@/components/plp/Filters";
import { ProductGrid } from "@/components/plp/ProductGrid";
import { Pagination } from "@/components/plp/Pagination";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getProductList, type SortOption } from "@/lib/data/products";

const PAGE_SIZE = 12;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}): Promise<Metadata> {
  const { q } = await searchParams;
  return { title: q ? `Search: ${q}` : "Search" };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: string; concentration?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const query = sp.q?.trim() ?? "";
  const page = Math.max(1, Number(sp.page) || 1);
  const concentrations = sp.concentration?.split(",").filter(Boolean);
  const sort = (sp.sort as SortOption) ?? "newest";

  const { products, totalPages, total } = query
    ? await getProductList({ query, concentrations, sort, page, pageSize: PAGE_SIZE })
    : { products: [], totalPages: 1, total: 0 };

  return (
    <Section tone="ivory">
      <Container className="flex flex-col gap-8">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Search" }]} />
        <SectionHeading
          eyebrow="Search"
          title={query ? `Results for "${query}"` : "Search"}
          description={
            query
              ? `${total} product${total === 1 ? "" : "s"} found.`
              : "Enter a search term to find fragrances, notes, or categories."
          }
          align="left"
        />
        {query && <Filters />}
        <ProductGrid products={products} />
        {query && (
          <Pagination
            pathname="/search"
            searchParams={{ ...sp, q: query }}
            page={page}
            totalPages={totalPages}
          />
        )}
      </Container>
    </Section>
  );
}
