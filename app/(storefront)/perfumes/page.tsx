import type { Metadata } from "next";
import { Breadcrumb } from "@/components/plp/Breadcrumb";
import { Filters } from "@/components/plp/Filters";
import { ProductGrid } from "@/components/plp/ProductGrid";
import { Pagination } from "@/components/plp/Pagination";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getProductList, type SortOption } from "@/lib/data/products";

export const metadata: Metadata = {
  title: "All Perfumes",
  description: "Browse the full THE RARESKIN fragrance collection.",
};

const PAGE_SIZE = 12;

export default async function PerfumesPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; concentration?: string; page?: string; comingSoon?: string }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const concentrations = sp.concentration?.split(",").filter(Boolean);
  const sort = (sp.sort as SortOption) ?? "newest";
  const isComingSoon = sp.comingSoon === "true";

  const { products, totalPages } = await getProductList({
    concentrations,
    isComingSoon: isComingSoon || undefined,
    sort,
    page,
    pageSize: PAGE_SIZE,
  });

  return (
    <Section tone="ivory">
      <Container className="flex flex-col gap-8">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "All Perfumes" }]} />
        <SectionHeading
          eyebrow="Shop"
          title={isComingSoon ? "Coming Soon" : "All Perfumes"}
          align="left"
        />
        <Filters />
        <ProductGrid products={products} />
        <Pagination pathname="/perfumes" searchParams={sp} page={page} totalPages={totalPages} />
      </Container>
    </Section>
  );
}
