"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { useBodyScrollLock } from "@/lib/use-body-scroll-lock";

type CheckoutModalContextValue = {
  isOpen: boolean;
  openCheckout: () => void;
  closeCheckout: () => void;
};

const CheckoutModalContext = createContext<CheckoutModalContextValue | null>(null);

export function CheckoutModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  useBodyScrollLock("checkout-modal", isOpen);

  return (
    <CheckoutModalContext.Provider
      value={{ isOpen, openCheckout: () => setIsOpen(true), closeCheckout: () => setIsOpen(false) }}
    >
      {children}
    </CheckoutModalContext.Provider>
  );
}

export function useCheckoutModal() {
  const ctx = useContext(CheckoutModalContext);
  if (!ctx) throw new Error("useCheckoutModal must be used within a CheckoutModalProvider");
  return ctx;
}
