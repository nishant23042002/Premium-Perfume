"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { useBodyScrollLock } from "@/lib/use-body-scroll-lock";

type AuthModalContextValue = {
  isOpen: boolean;
  openLogin: () => void;
  closeLogin: () => void;
};

const AuthModalContext = createContext<AuthModalContextValue | null>(null);

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  useBodyScrollLock("login-modal", isOpen);

  return (
    <AuthModalContext.Provider
      value={{ isOpen, openLogin: () => setIsOpen(true), closeLogin: () => setIsOpen(false) }}
    >
      {children}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const ctx = useContext(AuthModalContext);
  if (!ctx) throw new Error("useAuthModal must be used within an AuthModalProvider");
  return ctx;
}
