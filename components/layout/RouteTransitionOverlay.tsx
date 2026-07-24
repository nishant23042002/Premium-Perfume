"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { siteConfig } from "@/lib/site";

const SHOW_DELAY_MS = 150;
const SAFETY_TIMEOUT_MS = 6000;

function isInternalNavigationClick(event: MouseEvent): string | null {
  if (event.defaultPrevented || event.button !== 0) return null;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return null;

  const anchor = (event.target as HTMLElement | null)?.closest("a");
  if (!anchor) return null;
  if (anchor.target && anchor.target !== "_self") return null;
  if (anchor.hasAttribute("download")) return null;

  const href = anchor.getAttribute("href");
  if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
    return null;
  }

  let url: URL;
  try {
    url = new URL(href, window.location.href);
  } catch {
    return null;
  }
  if (url.origin !== window.location.origin) return null;

  const currentPath = `${window.location.pathname}${window.location.search}`;
  const nextPath = `${url.pathname}${url.search}`;
  if (nextPath === currentPath) return null;

  return nextPath;
}

/** Full-screen brand loading overlay shown during storefront route
 * transitions. Detects navigation start via a document-level click listener
 * (so it works with any internal <a>/<Link> without touching every call
 * site) and clears on the next pathname/search-params commit — with a
 * debounced show and a safety-net timeout so it never flashes on instant
 * navigations or gets stuck if a navigation is cancelled. */
export function RouteTransitionOverlay() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);
  const [visible, setVisible] = useState(false);
  const pendingTarget = useRef<string | null>(null);
  const safetyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const target = isInternalNavigationClick(event);
      if (!target) return;
      pendingTarget.current = target;
      setIsNavigating(true);
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  useEffect(() => {
    const currentPath = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
    if (pendingTarget.current && pendingTarget.current === currentPath) {
      pendingTarget.current = null;
      setIsNavigating(false);
    }
  }, [pathname, searchParams]);

  useEffect(() => {
    if (!isNavigating) {
      if (safetyTimer.current) clearTimeout(safetyTimer.current);
      return;
    }
    safetyTimer.current = setTimeout(() => {
      pendingTarget.current = null;
      setIsNavigating(false);
    }, SAFETY_TIMEOUT_MS);
    return () => {
      if (safetyTimer.current) clearTimeout(safetyTimer.current);
    };
  }, [isNavigating]);

  useEffect(() => {
    if (!isNavigating) return;
    const timer = setTimeout(() => setVisible(true), SHOW_DELAY_MS);
    return () => {
      clearTimeout(timer);
      setVisible(false);
    };
  }, [isNavigating]);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={visible ? "Loading page" : undefined}
      aria-hidden={!visible}
      className={`fixed inset-0 z-[70] flex flex-col items-center justify-center gap-6 bg-ivory transition-opacity duration-300 ease-out ${
        visible ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <span className="font-display text-2xl uppercase tracking-[0.3em] text-ink sm:text-3xl">
        {siteConfig.name}
      </span>
      <div className="route-loader-track h-[2px] w-40 overflow-hidden rounded-full bg-ink/10 sm:w-56">
        <div className="route-loader-bar h-full w-1/3 rounded-full bg-accent" />
      </div>
    </div>
  );
}
