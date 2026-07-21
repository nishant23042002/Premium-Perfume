"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type AuthModalContextValue = {
  isOpen: boolean;
  openLogin: () => void;
  closeLogin: () => void;
};

const AuthModalContext = createContext<AuthModalContextValue | null>(null);

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

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
