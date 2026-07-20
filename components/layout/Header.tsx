import Link from "next/link";
import { ShoppingBag, User } from "lucide-react";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { MobileNav } from "@/components/layout/MobileNav";
import { Container } from "@/components/ui/Container";
import { getNavCategories } from "@/lib/data/categories";
import { siteConfig } from "@/lib/site";

export async function Header() {
  const categories = await getNavCategories();

  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-ivory/95 backdrop-blur">
      <AnnouncementBar />
      <Container className="relative flex h-20 items-center justify-between gap-4">
        <MobileNav categories={categories} />

        <Link href="/" className="font-display text-2xl text-secondary">
          {siteConfig.name}
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {categories.map((category) => (
            <Link
              key={category._id}
              href={`/perfumes/${category.slug}`}
              className="font-sans text-xs font-medium uppercase tracking-[0.15em] text-ink/80 transition-colors hover:text-accent-dark"
            >
              {category.name}
            </Link>
          ))}
          <Link
            href="/collections/bestsellers"
            className="font-sans text-xs font-medium uppercase tracking-[0.15em] text-ink/80 transition-colors hover:text-accent-dark"
          >
            Bestsellers
          </Link>
          <Link
            href="/about"
            className="font-sans text-xs font-medium uppercase tracking-[0.15em] text-ink/80 transition-colors hover:text-accent-dark"
          >
            Our Story
          </Link>
        </nav>

        <div className="flex items-center gap-5">
          <Link href="/account" aria-label="Account" className="text-ink hover:text-accent-dark">
            <User className="h-5 w-5" strokeWidth={1.5} />
          </Link>
          <Link href="/cart" aria-label="Cart" className="text-ink hover:text-accent-dark">
            <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
          </Link>
        </div>
      </Container>
    </header>
  );
}
