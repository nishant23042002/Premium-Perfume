"use client";

import { useEffect, useRef, useState, type FormEvent, type MouseEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBodyScrollLock } from "@/lib/use-body-scroll-lock";
import { ProductImage } from "@/components/ui/ProductImage";
import { SearchProductCard } from "@/components/product/SearchProductCard";
import type { ProductCardData } from "@/lib/data/products";
import type { CategoryShowcaseCard } from "@/lib/data/categoryShowcase";

const TRENDING_SEARCHES = ["For Her", "For Him", "Unisex", "Gift Sets", "EDP", "Attar"];
const DEBOUNCE_MS = 300;

export function HeaderSearch({
  categoryShowcase,
  featuredProducts,
}: {
  categoryShowcase: CategoryShowcaseCard[];
  featuredProducts: ProductCardData[];
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProductCardData[]>([]);
  const [total, setTotal] = useState(0);
  // The last query results/total actually reflect — comparing it against the
  // live query (during render, not in an effect) derives the loading state
  // without a separate setState call at the top of the search effect.
  const [completedQuery, setCompletedQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useBodyScrollLock("header-search", isOpen);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen]);

  // Debounced live search — the timer + AbortController are both reset on
  // every keystroke, so only the most recent request can ever resolve.
  useEffect(() => {
    const trimmed = query.trim();
    // Nothing to clear here — an empty query renders the default/trending
    // view instead of results, so stale results/total are simply unused.
    if (!trimmed) return;

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
        });
        const data = await res.json();
        setResults(data.products ?? []);
        setTotal(data.total ?? 0);
      } catch {
        // aborted or network error — a newer request supersedes this one
      } finally {
        setCompletedQuery(trimmed);
      }
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query]);

  const trimmedQuery = query.trim();
  const isLoading = trimmedQuery !== "" && trimmedQuery !== completedQuery;

  function goToFullResults(term: string) {
    const trimmed = term.trim();
    if (!trimmed) return;
    setIsOpen(false);
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    goToFullResults(query);
  }

  // Event delegation: close the overlay whenever a result/product/category
  // link is clicked, without needing every card to know about this modal.
  function handleClickInside(event: MouseEvent<HTMLDivElement>) {
    if ((event.target as HTMLElement).closest("a")) {
      setIsOpen(false);
    }
  }

  const productGrid = trimmedQuery ? results : featuredProducts;
  const showEmptyState = trimmedQuery && !isLoading && results.length === 0;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Search"
        className="text-ink transition-colors duration-300 hover:text-accent-dark"
      >
        <Search className="h-5 w-5" strokeWidth={1.5} />
      </button>

      <div
        className={cn(
          "fixed inset-0 z-[60] transition-opacity duration-300",
          isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
        aria-hidden={!isOpen}
      >
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          aria-label="Close search"
          className="absolute inset-0 bg-ink/60 backdrop-blur-sm"
        />

        <div
          className={cn(
            // Mobile: unchanged full-width panel pinned to the top. Desktop:
            // no longer a centered wide dialog — a narrower panel that drops
            // down from just below the header, right-aligned under the
            // search icon instead of floating in the middle of the screen.
            "absolute inset-x-0 top-0 flex max-h-[85vh] w-full flex-col overflow-hidden bg-ivory shadow-2xl transition-all duration-300 sm:inset-x-auto sm:right-8 sm:top-20 sm:w-full sm:max-w-md lg:right-12",
            isOpen ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0",
          )}
        >
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-3 border-b border-ink/10 p-4 sm:p-6"
          >
            <Search className="h-5 w-5 shrink-0 text-ink/40" strokeWidth={1.5} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search for perfumes, notes, categories..."
              className="flex-1 bg-transparent font-sans text-base text-ink placeholder:text-ink/40 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close search"
              className="text-ink/50 transition-colors hover:text-accent-dark"
            >
              <X className="h-5 w-5" strokeWidth={1.5} />
            </button>
          </form>

          <div className="flex flex-1 flex-col overflow-hidden" onClick={handleClickInside}>
            {/* Category strip — reuses the same images/links as the homepage
                "Shop by Category" section. Now that this panel is a narrow
                dropdown rather than a wide dialog, it stays a horizontal
                scroll strip at every width instead of switching to a left
                column, which would be cramped at this size. */}
            {categoryShowcase.length > 0 && (
              <div className="scrollbar-none flex shrink-0 gap-3 overflow-x-auto border-b border-ink/10 p-4">
                {categoryShowcase.map((card) => (
                  <Link
                    key={card._id}
                    href={card.linkHref}
                    className="group flex shrink-0 flex-col items-center gap-2"
                  >
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden bg-ivory-2">
                      <ProductImage
                        publicId={card.image.publicId}
                        alt={card.image.alt}
                        className="h-full w-full transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <span className="whitespace-nowrap font-sans text-[11px] uppercase tracking-wide text-ink/70 transition-colors group-hover:text-accent-dark">
                      {card.title}
                    </span>
                  </Link>
                ))}
              </div>
            )}

            <div className="scrollbar-none flex-1 overflow-y-auto p-4 sm:p-6">
              {!trimmedQuery && (
                <div className="mb-6 flex flex-col gap-3">
                  <span className="font-sans text-xs font-semibold uppercase tracking-[0.15em] text-ink/50">
                    Trending Searches
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {TRENDING_SEARCHES.map((term) => (
                      <button
                        key={term}
                        type="button"
                        onClick={() => setQuery(term)}
                        className="border border-ink/20 px-3 py-1.5 font-sans text-xs uppercase tracking-[0.08em] text-ink/70 transition-colors hover:border-accent-dark hover:text-accent-dark"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {isLoading ? (
                <p className="py-10 text-center font-sans text-sm text-ink/50">Searching...</p>
              ) : showEmptyState ? (
                <p className="py-10 text-center font-sans text-sm text-ink/50">
                  No products found for &quot;{query}&quot;.
                </p>
              ) : (
                <div className="flex flex-col gap-6">
                  {!trimmedQuery && productGrid.length > 0 && (
                    <span className="font-sans text-xs font-semibold uppercase tracking-[0.15em] text-ink/50">
                      Popular Picks
                    </span>
                  )}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-6">
                    {productGrid.map((product) => (
                      <SearchProductCard key={product._id} product={product} />
                    ))}
                  </div>
                  {trimmedQuery && total > results.length && (
                    <button
                      type="button"
                      onClick={() => goToFullResults(query)}
                      className="w-fit self-center border border-ink/20 px-4 py-2 font-sans text-xs uppercase tracking-[0.1em] text-ink transition-colors hover:border-accent-dark hover:text-accent-dark"
                    >
                      View all {total} results
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
