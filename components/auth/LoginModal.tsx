"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Sparkles, Truck, MapPin, Gift } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthModal } from "@/lib/auth-modal-context";
import { PhoneLoginForm } from "@/components/auth/PhoneLoginForm";

const PERKS = [
  { icon: Truck, text: "Track every order in one place" },
  { icon: MapPin, text: "Save addresses for one-tap checkout" },
  { icon: Gift, text: "First access to new fragrance drops" },
];

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
          "relative flex w-full max-w-sm overflow-hidden bg-ivory shadow-2xl transition-all duration-300 sm:max-w-3xl",
          isOpen ? "translate-y-0 scale-100" : "translate-y-4 scale-95",
        )}
      >
        {/* Decorative brand panel — desktop only. Self-contained (no photo
            dependency), so it always looks intentional even before any
            banners/products exist. Kept soft and light, matching the site's
            palette rather than a dark scrim. */}
        <div className="relative hidden w-2/5 shrink-0 flex-col justify-between overflow-hidden bg-gradient-to-br from-ivory via-accent/10 to-accent/25 p-8 sm:flex">
          <Sparkles
            className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 text-accent-dark/15"
            strokeWidth={1}
          />
          <Sparkles
            className="pointer-events-none absolute -bottom-10 -left-10 h-32 w-32 text-accent-dark/10"
            strokeWidth={1}
          />

          <div className="relative z-[1] flex flex-col gap-2">
            <span className="font-sans text-xs font-medium uppercase tracking-[0.25em] text-accent-dark">
              Members Get More
            </span>
            <h3 className="font-display text-2xl leading-tight text-secondary">
              Sign in for a faster, more personal Vellora.
            </h3>
          </div>

          <ul className="relative z-[1] flex flex-col gap-4">
            {PERKS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 font-sans text-sm text-ink/70">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center border border-accent-dark/30 bg-ivory/70 text-accent-dark">
                  <Icon className="h-4 w-4" strokeWidth={1.5} />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative flex w-full flex-col gap-6 p-8">
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
    </div>
  );
}
