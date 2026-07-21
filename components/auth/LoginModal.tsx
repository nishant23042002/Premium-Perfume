"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthModal } from "@/lib/auth-modal-context";
import { PhoneLoginForm } from "@/components/auth/PhoneLoginForm";

export function LoginModal() {
  const router = useRouter();
  const { isOpen, closeLogin } = useAuthModal();

  useEffect(() => {
    if (!isOpen) return;
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") closeLogin();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, closeLogin]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-[60] flex items-center justify-center p-4 transition-opacity duration-300",
        isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
      )}
      aria-hidden={!isOpen}
    >
      <button
        type="button"
        onClick={closeLogin}
        aria-label="Close"
        className="absolute inset-0 bg-ink/60 backdrop-blur-sm"
      />

      <div
        className={cn(
          "relative flex w-full max-w-sm flex-col gap-6 bg-ivory p-8 shadow-2xl transition-all duration-300",
          isOpen ? "translate-y-0 scale-100" : "translate-y-4 scale-95",
        )}
      >
        <button
          type="button"
          onClick={closeLogin}
          aria-label="Close"
          className="absolute right-5 top-5 text-ink/50 transition-colors hover:text-accent-dark"
        >
          <X className="h-5 w-5" strokeWidth={1.5} />
        </button>

        <div className="flex flex-col gap-2 pr-6">
          <span className="font-sans text-xs font-medium uppercase tracking-[0.25em] text-accent-dark">
            Welcome
          </span>
          <h2 className="font-display text-2xl text-secondary">Sign In</h2>
          <p className="font-sans text-sm text-ink/60">
            Enter your mobile number and we&apos;ll send a one-time code to sign you in.
          </p>
        </div>

        {isOpen && (
          <PhoneLoginForm
            onSuccess={() => {
              closeLogin();
              router.refresh();
            }}
          />
        )}
      </div>
    </div>
  );
}
