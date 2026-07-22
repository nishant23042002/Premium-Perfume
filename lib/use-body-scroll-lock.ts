"use client";

import { useEffect } from "react";

// Shared across every modal-like overlay (cart drawer, login modal, checkout
// modal) via a module-level set rather than each overlay writing
// document.body.style.overflow independently — two overlays opening in the
// same render (e.g. closing the cart drawer while opening checkout) would
// otherwise race to set the final value depending on effect order.
const openLocks = new Set<string>();

function applyLockState() {
  // Locking only <body> leaves <html> free to become the actual scrolling
  // element in some browsers/layouts, which still shows its own scrollbar
  // and lets the page scroll behind an open overlay — locking both together
  // is what actually stops the double-scrollbar look.
  const locked = openLocks.size > 0;
  document.documentElement.style.overflow = locked ? "hidden" : "";
  document.body.style.overflow = locked ? "hidden" : "";
}

export function useBodyScrollLock(id: string, isOpen: boolean) {
  useEffect(() => {
    if (isOpen) openLocks.add(id);
    else openLocks.delete(id);
    applyLockState();

    return () => {
      openLocks.delete(id);
      applyLockState();
    };
  }, [id, isOpen]);
}
