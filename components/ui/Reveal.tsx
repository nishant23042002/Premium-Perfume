"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const SAFETY_TIMEOUT_MS = 1200;

/** Fades + slides its children into place the first time they scroll into
 * view. Always starts hidden on both server and client renders — branching
 * the initial state on `window.matchMedia` here would read as visible on
 * the client but hidden on the server for reduced-motion visitors, a
 * guaranteed hydration mismatch. Reduced motion is instead handled in
 * globals.css by stripping the transition, so the reveal still happens,
 * just without the animation.
 *
 * Two safety nets on top of the IntersectionObserver, both hit in real
 * testing: (1) a synchronous getBoundingClientRect() check on mount, since
 * Chrome DevTools' device-toolbar viewport emulation can report a stale
 * first IntersectionObserver callback right after a simulated resize,
 * leaving already-on-screen content stuck at opacity-0 until the user
 * happens to scroll; (2) a timeout that forces visibility regardless, so a
 * misfiring observer in any environment can never hide content forever. */
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

    const rect = el.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    if (rect.top < viewportHeight && rect.bottom > 0) {
      setVisible(true);
      return;
    }

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

    const safetyTimer = setTimeout(() => setVisible(true), SAFETY_TIMEOUT_MS);

    return () => {
      observer.disconnect();
      clearTimeout(safetyTimer);
    };
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
