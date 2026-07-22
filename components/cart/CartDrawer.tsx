"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Price } from "@/components/ui/Price";
import { ProductImage } from "@/components/ui/ProductImage";
import { cn } from "@/lib/utils";
import { useCart } from "@/lib/cart-context";
import { useCheckoutModal } from "@/lib/checkout-modal-context";
import { CartDrawerLineItem } from "@/components/cart/CartDrawerLineItem";
import { CartRecommendations } from "@/components/cart/CartRecommendations";

const FREE_SHIPPING_THRESHOLD = 999;

export function CartDrawer() {
  const { cart, categoryShowcase, isOpen, closeCart } = useCart();
  const { openCheckout } = useCheckoutModal();
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - cart.subtotal);

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 transition-opacity duration-300",
        isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
      )}
      aria-hidden={!isOpen}
    >
      <button
        type="button"
        onClick={closeCart}
        aria-label="Close cart"
        className="absolute inset-0 bg-ink/40"
      />

      <div
        className={cn(
          "absolute inset-y-0 right-0 flex h-full w-full flex-col bg-ivory shadow-2xl transition-transform duration-300 sm:max-w-md",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-ink/10 px-5 py-4">
          <span className="font-display text-lg text-secondary">
            Your Bag{cart.itemCount > 0 && ` (${cart.itemCount})`}
          </span>
          <button
            type="button"
            onClick={closeCart}
            aria-label="Close cart"
            className="text-ink/60 hover:text-ink"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="scrollbar-none flex-1 overflow-y-auto px-5 py-4">
          {cart.items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-6 text-center">
              <p className="font-sans text-sm text-ink/60">Your bag is empty.</p>
              <Button href="/perfumes" variant="primary" onClick={closeCart}>
                Start Shopping
              </Button>

              {categoryShowcase.length > 0 && (
                <div className="flex flex-col gap-3 pt-4">
                  <span className="font-sans text-xs font-semibold uppercase tracking-[0.15em] text-ink/50">
                    Or Shop By Category
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    {categoryShowcase.slice(0, 4).map((card) => (
                      <Link
                        key={card._id}
                        href={card.linkHref}
                        onClick={closeCart}
                        className="group relative flex aspect-square w-28 flex-col items-center justify-end overflow-hidden bg-ivory-2"
                      >
                        <ProductImage
                          publicId={card.image.publicId}
                          alt={card.image.alt}
                          className="absolute inset-0 h-full w-full transition-transform duration-300 group-hover:scale-105"
                        />
                        <span className="relative z-[1] w-full bg-ivory/90 py-1.5 font-sans text-[11px] uppercase tracking-wide text-ink">
                          {card.title}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              {remaining > 0 ? (
                <p className="mb-4 font-sans text-xs text-ink/60">
                  Add <Price value={remaining} className="inline-flex" /> more for free shipping.
                </p>
              ) : (
                <p className="mb-4 font-sans text-xs text-accent-dark">
                  You&apos;ve unlocked free shipping!
                </p>
              )}

              <div className="flex flex-col divide-y divide-ink/10">
                {cart.items.map((item) => (
                  <CartDrawerLineItem key={item.sku} item={item} />
                ))}
              </div>

              <div className="mt-8 border-t border-ink/10 pt-6">
                <CartRecommendations />
              </div>
            </>
          )}
        </div>

        {cart.items.length > 0 && (
          <div className="border-t border-ink/10 px-5 py-5">
            <div className="mb-4 flex items-center justify-between font-sans text-sm">
              <span className="text-ink/60">Subtotal</span>
              <Price value={cart.subtotal} className="text-base font-semibold" />
            </div>
            <Button
              type="button"
              variant="primary"
              size="lg"
              className="w-full"
              onClick={() => {
                closeCart();
                openCheckout();
              }}
            >
              Proceed to Checkout
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
