"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { User } from "lucide-react";
import { MobileNav } from "@/components/layout/MobileNav";
import { CartTrigger } from "@/components/layout/CartTrigger";
import { HeaderSearch } from "@/components/layout/HeaderSearch";
import { NavLink } from "@/components/layout/NavLink";
import { AnnouncementRotator } from "@/components/layout/AnnouncementRotator";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/site";
import { getCloudinaryUrl } from "@/lib/cloudinary";
import { useAuthModal } from "@/lib/auth-modal-context";
import type { NavCategory } from "@/lib/data/categories";
import type { ActiveAnnouncement } from "@/lib/data/announcements";
import type { SiteLogo } from "@/lib/data/siteSettings";
import type { CategoryShowcaseCard } from "@/lib/data/categoryShowcase";
import type { ProductCardData } from "@/lib/data/products";

// Two separate thresholds (not one) — collapsing and re-expanding at the
// exact same scroll position creates a feedback loop: right at that pixel,
// the layout shift from collapsing moves content enough to read as "above
// the threshold again", so the header flips back open, which shifts it back
// past the threshold, and so on — a rapid collapse/expand loop that shows up
// as the header visibly shaking while scrolling near that point. The gap
// between the two values is a dead zone the scroll position has to fully
// cross before the header will flip state again.
const COLLAPSE_AT = 80;
const EXPAND_AT = 24;

export function HeaderShell({
  categories,
  announcements,
  isLoggedIn,
  logo,
  categoryShowcase,
  featuredProducts,
}: {
  categories: NavCategory[];
  announcements: ActiveAnnouncement[];
  isLoggedIn: boolean;
  logo: SiteLogo | null;
  categoryShowcase: CategoryShowcaseCard[];
  featuredProducts: ProductCardData[];
}) {
  const [scrolled, setScrolled] = useState(false);
  const { openLogin } = useAuthModal();

  useEffect(() => {
    let frame = 0;
    function handleScroll() {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        setScrolled((prev) => {
          if (window.scrollY > COLLAPSE_AT) return true;
          if (window.scrollY < EXPAND_AT) return false;
          return prev;
        });
      });
    }
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const iconClass = "text-ink transition-colors duration-300 hover:text-accent-dark";

  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-ivory/90 backdrop-blur-md">
      {/* Collapses smoothly on scroll — a soft, light bar throughout, no
          dark overlay or photo-blending trickery. */}
      <div
        className={cn(
          "grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 ease-out",
          scrolled ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100",
        )}
      >
        <div className="min-h-0 overflow-hidden">
          {announcements.length > 0 && <AnnouncementRotator announcements={announcements} />}
        </div>
      </div>

      <Container className="flex px-4 h-20 items-center justify-between gap-4">
        <MobileNav categories={categories} />

        {logo ? (
          <Link href="/" className="shrink-0" aria-label={siteConfig.name}>
            <Image
              src={getCloudinaryUrl(logo.publicId, { height: 160 }) ?? ""}
              alt={logo.alt}
              width={logo.width ?? 400}
              height={logo.height ?? 120}
              priority
              className="h-8 w-auto max-w-[140px] object-contain sm:h-10 sm:max-w-[180px]"
            />
          </Link>
        ) : (
          <Link
            href="/"
            className="min-w-0 shrink truncate font-display text-base text-secondary transition-colors duration-300 sm:text-xl md:text-2xl"
          >
            {siteConfig.name}
          </Link>
        )}

        <nav className="hidden items-center gap-8 lg:flex">
          {categories.map((category) => (
            <NavLink key={category._id} href={`/perfumes/${category.slug}`}>
              {category.name}
            </NavLink>
          ))}
          <NavLink href="/collections/bestsellers">Bestsellers</NavLink>
          <NavLink href="/about">Our Story</NavLink>
          <NavLink href="/contact">Contact</NavLink>
        </nav>

        <div className="flex items-center gap-5">
          <HeaderSearch categoryShowcase={categoryShowcase} featuredProducts={featuredProducts} />
          <div className="max-sm:hidden">
            {isLoggedIn ? (
              <Link href="/account" aria-label="Account" className={iconClass}>
                <User className="h-5 w-5" strokeWidth={1.5} />
              </Link>
            ) : (
              <button type="button" onClick={openLogin} aria-label="Sign In" className={iconClass}>
                <User className="h-5 w-5" strokeWidth={1.5} />
              </button>
            )}
          </div>
          <CartTrigger />
        </div>
      </Container>
    </header>
  );
}
