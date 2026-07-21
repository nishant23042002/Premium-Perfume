"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { User } from "lucide-react";
import { MobileNav } from "@/components/layout/MobileNav";
import { CartTrigger } from "@/components/layout/CartTrigger";
import { AnnouncementRotator } from "@/components/layout/AnnouncementRotator";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/site";
import { useAuthModal } from "@/lib/auth-modal-context";
import type { NavCategory } from "@/lib/data/categories";
import type { ActiveAnnouncement } from "@/lib/data/announcements";

// Collapses the announcement row out of view once the page has scrolled
// past this point, then brings it back when scrolling back up to the top.
const SCROLL_THRESHOLD = 60;

export function HeaderShell({
  categories,
  announcements,
  isLoggedIn,
}: {
  categories: NavCategory[];
  announcements: ActiveAnnouncement[];
  isLoggedIn: boolean;
}) {
  const [scrolled, setScrolled] = useState(false);
  const { openLogin } = useAuthModal();

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > SCROLL_THRESHOLD);
    }
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinkClass =
    "font-sans text-xs font-medium uppercase tracking-[0.15em] text-ink/80 transition-colors duration-300 hover:text-accent-dark";

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

      <Container className="flex h-20 items-center justify-between gap-4">
        <MobileNav categories={categories} />

        <Link href="/" className="font-display text-2xl text-secondary transition-colors duration-300">
          {siteConfig.name}
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {categories.map((category) => (
            <Link key={category._id} href={`/perfumes/${category.slug}`} className={navLinkClass}>
              {category.name}
            </Link>
          ))}
          <Link href="/collections/bestsellers" className={navLinkClass}>
            Bestsellers
          </Link>
          <Link href="/about" className={navLinkClass}>
            Our Story
          </Link>
          <Link href="/contact" className={navLinkClass}>
            Contact
          </Link>
        </nav>

        <div className="flex items-center gap-5">
          {isLoggedIn ? (
            <Link href="/account" aria-label="Account" className={iconClass}>
              <User className="h-5 w-5" strokeWidth={1.5} />
            </Link>
          ) : (
            <button type="button" onClick={openLogin} aria-label="Sign In" className={iconClass}>
              <User className="h-5 w-5" strokeWidth={1.5} />
            </button>
          )}
          <CartTrigger />
        </div>
      </Container>
    </header>
  );
}
