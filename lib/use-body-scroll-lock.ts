"use client";

import { useEffect } from "react";

// Shared across every modal-like overlay (cart drawer, login modal, checkout
// modal) via a module-level set rather than each overlay writing
// document.body.style.overflow independently — two overlays opening in the
// same render (e.g. closing the cart drawer while opening checkout) would
// otherwise race to set the final value depending on effect order.
const openLocks = new Set<string>();

export function useBodyScrollLock(id: string, isOpen: boolean) {
  useEffect(() => {
    if (isOpen) openLocks.add(id);
    else openLocks.delete(id);
    document.body.style.overflow = openLocks.size > 0 ? "hidden" : "";

    return () => {
      openLocks.delete(id);
      document.body.style.overflow = openLocks.size > 0 ? "hidden" : "";
    };
  }, [id, isOpen]);
}
