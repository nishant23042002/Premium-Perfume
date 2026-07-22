"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NavCategory } from "@/lib/data/categories";

export function MobileNav({ categories }: { categories: NavCategory[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  function linkClass(href: string) {
    const isActive = pathname === href;
    return cn(
      "border-l-2 py-4 pl-4 font-sans text-sm uppercase tracking-[0.1em] transition-colors duration-300",
      isActive ? "border-accent-dark text-accent-dark" : "border-transparent text-ink",
    );
  }

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 w-6 items-center justify-center text-ink transition-colors duration-300"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open && (
        <div className="absolute inset-x-0 top-full border-t border-ink/10 bg-ivory">
          <nav className="flex flex-col divide-y divide-ink/10 px-5">
            {categories.map((category) => (
              <Link
                key={category._id}
                href={`/perfumes/${category.slug}`}
                onClick={() => setOpen(false)}
                aria-current={pathname === `/perfumes/${category.slug}` ? "page" : undefined}
                className={linkClass(`/perfumes/${category.slug}`)}
              >
                {category.name}
              </Link>
            ))}
            <Link
              href="/collections/bestsellers"
              onClick={() => setOpen(false)}
              aria-current={pathname === "/collections/bestsellers" ? "page" : undefined}
              className={linkClass("/collections/bestsellers")}
            >
              Bestsellers
            </Link>
            <Link
              href="/about"
              onClick={() => setOpen(false)}
              aria-current={pathname === "/about" ? "page" : undefined}
              className={linkClass("/about")}
            >
              Our Story
            </Link>
            <Link
              href="/contact"
              onClick={() => setOpen(false)}
              aria-current={pathname === "/contact" ? "page" : undefined}
              className={linkClass("/contact")}
            >
              Contact
            </Link>
          </nav>
        </div>
      )}
    </div>
  );
}
