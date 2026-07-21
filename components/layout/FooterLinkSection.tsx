"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type LinkItem = { href: string; label: string };

export function FooterLinkSection({ title, links }: { title: string; links: LinkItem[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-ink/10 py-4 sm:border-none sm:py-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between font-sans text-xs font-semibold uppercase tracking-[0.15em] text-ink/50 sm:pointer-events-none sm:cursor-default"
      >
        {title}
        <ChevronDown
          className={cn("h-4 w-4 shrink-0 transition-transform duration-300 sm:hidden", open && "rotate-180")}
        />
      </button>

      {/* max-height transition rather than the grid-rows 0fr/1fr trick —
          more broadly reliable, and the cap is generous enough that no
          section's link list will ever be clipped. */}
      <div
        className={cn(
          "overflow-hidden transition-[max-height] duration-300 ease-out sm:max-h-none",
          open ? "max-h-96" : "max-h-0",
        )}
      >
        <div className="flex flex-col gap-3 pt-3">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-sans text-sm text-ink/70 hover:text-accent-dark"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
