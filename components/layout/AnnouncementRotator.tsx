"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ActiveAnnouncement } from "@/lib/data/announcements";

const ROTATE_MS = 4000;

export function AnnouncementRotator({ announcements }: { announcements: ActiveAnnouncement[] }) {
  // `prev` is the slide that's mid-exit (sliding out left) at the moment
  // `active` becomes the new slide (sliding in from the right) — updating
  // both together in one state object keeps the two transitions in lockstep.
  const [{ active, prev }, setSlide] = useState({ active: 0, prev: -1 });

  function goTo(index: number) {
    setSlide((s) => ({ active: (index + announcements.length) % announcements.length, prev: s.active }));
  }

  useEffect(() => {
    if (announcements.length <= 1) return;
    const id = setInterval(() => {
      setSlide((s) => ({ active: (s.active + 1) % announcements.length, prev: s.active }));
    }, ROTATE_MS);
    return () => clearInterval(id);
  }, [announcements.length]);

  return (
    <div className="relative flex h-9 items-center justify-center gap-2 overflow-hidden bg-accent/20 px-9 sm:px-10">
      {announcements.length > 1 && (
        <button
          type="button"
          aria-label="Previous announcement"
          onClick={() => goTo(active - 1)}
          className="absolute left-1.5 z-10 flex h-9 w-6 shrink-0 items-center justify-center text-ink/50 transition-colors hover:text-accent-dark sm:left-2"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
      )}

      {announcements.map((announcement, index) => {
        const isActive = index === active;
        const isPrev = index === prev;
        const content = (
          <span className="whitespace-nowrap font-sans text-[10px] uppercase tracking-[0.15em] text-secondary sm:text-xs sm:tracking-[0.2em]">
            {announcement.text}
          </span>
        );

        return (
          <div
            key={announcement._id}
            aria-hidden={!isActive}
            className={cn(
              // overflow-hidden here (not just on the outer bar) matters: each
              // slide's text can be wider than the bar on mobile, and without
              // clipping it at the SLIDE's own edges, the overflowing part of
              // an off-screen slide can still peek back into view even after
              // translating it fully out — this is what caused the garbled
              // overlapping text.
              "absolute inset-0 flex items-center justify-center overflow-hidden px-1 transition-transform duration-700 ease-in-out motion-reduce:transition-none",
              isActive ? "translate-x-0" : isPrev ? "-translate-x-full" : "translate-x-full",
            )}
          >
            {announcement.link ? (
              <a href={announcement.link} className="hover:text-accent-dark" tabIndex={isActive ? 0 : -1}>
                {content}
              </a>
            ) : (
              content
            )}
          </div>
        );
      })}

      {announcements.length > 1 && (
        <button
          type="button"
          aria-label="Next announcement"
          onClick={() => goTo(active + 1)}
          className="absolute right-1.5 z-10 flex h-9 w-6 shrink-0 items-center justify-center text-ink/50 transition-colors hover:text-accent-dark sm:right-2"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
