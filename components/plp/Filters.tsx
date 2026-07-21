"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { SORT_OPTIONS } from "@/lib/product-sort";

const CONCENTRATIONS = ["EDP", "EDT", "Parfum", "Attar", "Cologne"] as const;

export function Filters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeConcentrations = searchParams.get("concentration")?.split(",").filter(Boolean) ?? [];
  const activeSort = searchParams.get("sort") ?? "newest";

  function push(mutate: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    params.delete("page");
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  function toggleConcentration(value: string) {
    push((params) => {
      const current = new Set(activeConcentrations);
      if (current.has(value)) current.delete(value);
      else current.add(value);
      if (current.size > 0) params.set("concentration", Array.from(current).join(","));
      else params.delete("concentration");
    });
  }

  function setSort(value: string) {
    push((params) => {
      if (value === "newest") params.delete("sort");
      else params.set("sort", value);
    });
  }

  return (
    <div className="flex flex-col gap-4 border-b border-ink/10 pb-6 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      {/* Horizontal scroll on mobile avoids an ugly multi-row chip wrap;
          reverts to a natural wrap once there's enough width to spare. */}
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
        {CONCENTRATIONS.map((concentration) => {
          const active = activeConcentrations.includes(concentration);
          return (
            <button
              key={concentration}
              type="button"
              aria-pressed={active}
              onClick={() => toggleConcentration(concentration)}
              className={cn(
                "shrink-0 border px-3 py-1.5 font-sans text-xs uppercase tracking-[0.08em] transition-colors",
                active
                  ? "border-accent-dark bg-accent/15 text-accent-dark"
                  : "border-ink/20 text-ink/60 hover:border-ink/40",
              )}
            >
              {concentration}
            </button>
          );
        })}
      </div>

      <label className="flex items-center justify-between gap-3 font-sans text-xs text-ink/60 sm:justify-start">
        Sort by
        <select
          value={activeSort}
          onChange={(e) => setSort(e.target.value)}
          className="border border-ink/20 bg-transparent px-2 py-1.5 text-ink focus:border-accent-dark focus:outline-none"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
