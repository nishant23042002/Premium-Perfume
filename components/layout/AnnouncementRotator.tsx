"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { ActiveAnnouncement } from "@/lib/data/announcements";

const ROTATE_MS = 5000;

export function AnnouncementRotator({ announcements }: { announcements: ActiveAnnouncement[] }) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<"left" | "right">("left");

  useEffect(() => {
    if (announcements.length <= 1) return;
    const id = setInterval(() => {
      setDirection((d) => (d === "left" ? "right" : "left"));
      setIndex((i) => (i + 1) % announcements.length);
    }, ROTATE_MS);
    return () => clearInterval(id);
  }, [announcements.length]);

  const current = announcements[index];

  const content = (
    <p
      key={current._id}
      className={cn(
        "font-sans text-xs uppercase tracking-[0.2em] text-secondary",
        direction === "left" ? "animate-slide-in-left" : "animate-slide-in-right",
      )}
    >
      {current.text}
    </p>
  );

  return (
    <div className="flex items-center justify-center bg-accent/20 px-4 py-2.5 text-center">
      {current.link ? <a href={current.link}>{content}</a> : content}
    </div>
  );
}
