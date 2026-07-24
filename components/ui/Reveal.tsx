"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/** Fades + slides its children into place the first time they scroll into
 * view (IntersectionObserver fires immediately for content already in the
 * viewport on mount, so above-the-fold content reveals right away).
 *
 * Always starts hidden on both server and client renders — branching the
 * initial state on `window.matchMedia` here would read as visible on the
 * client but hidden on the server for reduced-motion visitors, a guaranteed
 * hydration mismatch. Reduced motion is instead handled in globals.css by
 * stripping the transition, so the reveal still happens, just without the
 * animation. */
export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (visible) return;
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -80px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [visible]);

  return (
    <div
      ref={ref}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={cn(
        "reveal-transition transition-all duration-700 ease-out",
        visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
        className,
      )}
    >
      {children}
    </div>
  );
}
