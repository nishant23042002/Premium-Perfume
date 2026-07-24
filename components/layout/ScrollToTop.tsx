"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** This Next.js version's default <Link> behavior is to maintain scroll
 * position on navigation, only jumping to top if the destination page
 * isn't "visible" at the current scroll offset — on a tall page, clicking
 * a link while scrolled down usually lands mid-page instead of at the top.
 * This forces every route change back to the top, matching normal
 * multi-page-site expectations. No animation, no cost beyond the native
 * scrollTo call itself. */
export function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
