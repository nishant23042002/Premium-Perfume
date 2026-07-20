import Link from "next/link";
import { cn } from "@/lib/utils";

export function Pagination({
  pathname,
  searchParams,
  page,
  totalPages,
}: {
  pathname: string;
  searchParams: { sort?: string; concentration?: string };
  page: number;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;

  function hrefFor(targetPage: number) {
    const params = new URLSearchParams();
    if (searchParams.sort) params.set("sort", searchParams.sort);
    if (searchParams.concentration) params.set("concentration", searchParams.concentration);
    if (targetPage > 1) params.set("page", String(targetPage));
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-4 pt-4">
      <Link
        href={hrefFor(Math.max(1, page - 1))}
        aria-disabled={!hasPrev}
        className={cn(
          "border border-ink/20 px-4 py-2 font-sans text-xs uppercase tracking-[0.08em] text-ink",
          !hasPrev && "pointer-events-none opacity-30",
        )}
      >
        Previous
      </Link>
      <span className="font-sans text-xs text-ink/60">
        Page {page} of {totalPages}
      </span>
      <Link
        href={hrefFor(Math.min(totalPages, page + 1))}
        aria-disabled={!hasNext}
        className={cn(
          "border border-ink/20 px-4 py-2 font-sans text-xs uppercase tracking-[0.08em] text-ink",
          !hasNext && "pointer-events-none opacity-30",
        )}
      >
        Next
      </Link>
    </nav>
  );
}
