"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import type { NavCategory } from "@/lib/data/categories";

export function MobileNav({ categories }: { categories: NavCategory[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 w-10 items-center justify-center text-ink transition-colors duration-300"
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
                className="py-4 font-sans text-sm uppercase tracking-[0.1em] text-ink"
              >
                {category.name}
              </Link>
            ))}
            <Link
              href="/collections/bestsellers"
              onClick={() => setOpen(false)}
              className="py-4 font-sans text-sm uppercase tracking-[0.1em] text-ink"
            >
              Bestsellers
            </Link>
            <Link
              href="/about"
              onClick={() => setOpen(false)}
              className="py-4 font-sans text-sm uppercase tracking-[0.1em] text-ink"
            >
              Our Story
            </Link>
            <Link
              href="/contact"
              onClick={() => setOpen(false)}
              className="py-4 font-sans text-sm uppercase tracking-[0.1em] text-ink"
            >
              Contact
            </Link>
          </nav>
        </div>
      )}
    </div>
  );
}
