"use client";

import { Lock, X } from "lucide-react";
import { Price } from "@/components/ui/Price";
import { ProductImage } from "@/components/ui/ProductImage";
import { QuickAddButton } from "@/components/cart/QuickAddButton";
import { cn } from "@/lib/utils";
import { useCart } from "@/lib/cart-context";
import { useCheckoutModal } from "@/lib/checkout-modal-context";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { getDefaultVariant } from "@/lib/product";

const FREE_SHIPPING_THRESHOLD = 999;
const SHIPPING_FEE = 99;

export function CheckoutModal() {
  const { cart, recommendations, savedAddresses } = useCart();
  const { isOpen, closeCheckout } = useCheckoutModal();

  const shippingFee = cart.subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const total = cart.subtotal + shippingFee;
  const cartProductIds = new Set(cart.items.map((item) => item.productId));
  const upsell = recommendations.filter((p) => !cartProductIds.has(p._id)).slice(0, 4);

  return (
    <div
      className={cn(
        "fixed inset-0 z-[55] transition-opacity duration-300",
        isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
      )}
      aria-hidden={!isOpen}
    >
      <button
        type="button"
        onClick={closeCheckout}
        aria-label="Close checkout"
        className="absolute inset-0 bg-ink/50"
      />

      <div
        className={cn(
          "absolute inset-y-0 right-0 flex h-full w-full flex-col bg-ivory shadow-2xl transition-transform duration-300 sm:max-w-lg",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-ink/10 px-5 py-4">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-accent-dark" strokeWidth={1.5} />
            <span className="font-display text-lg text-secondary">Secure Checkout</span>
          </div>
          <button
            type="button"
            onClick={closeCheckout}
            aria-label="Close checkout"
            className="text-ink/60 hover:text-ink"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-1 flex-col overflow-hidden">
          {cart.items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 p-5 text-center">
              <p className="font-sans text-sm text-ink/60">Your bag is empty.</p>
            </div>
          ) : (
            <CheckoutForm savedAddresses={savedAddresses}>
              <div className="flex flex-col gap-3 border border-ink/10 p-5">
                <span className="font-sans text-xs font-semibold uppercase tracking-[0.15em] text-ink/50">
                  Order Summary · {cart.itemCount} item{cart.itemCount === 1 ? "" : "s"}
                </span>
                <div className="flex flex-col gap-2">
                  {cart.items.map(
                    (item) =>
                      item.product && (
                        <div key={item.sku} className="flex justify-between font-sans text-sm">
                          <span className="text-ink/70">
                            {item.product.name} × {item.quantity}
                          </span>
                          <Price value={item.priceSnapshot * item.quantity} />
                        </div>
                      ),
                  )}
                </div>
                <div className="flex justify-between border-t border-ink/10 pt-3 font-sans text-sm">
                  <span className="text-ink/60">Shipping</span>
                  {shippingFee === 0 ? (
                    <span className="text-accent-dark">Free</span>
                  ) : (
                    <Price value={shippingFee} />
                  )}
                </div>
                <div className="flex justify-between border-t border-ink/10 pt-3 font-sans text-base font-semibold">
                  <span>Total</span>
                  <Price value={total} />
                </div>
              </div>

              {upsell.length > 0 && (
                <div className="flex flex-col gap-3">
                  <span className="font-sans text-xs font-semibold uppercase tracking-[0.15em] text-ink/50">
                    Add-ons At Extra Discount
                  </span>
                  <div className="scrollbar-thin flex gap-3 overflow-x-auto pb-3">
                    {upsell.map((product) => {
                      const variant = getDefaultVariant(product.variants);
                      const image = product.images[0];
                      return (
                        <div key={product._id} className="flex w-32 shrink-0 flex-col gap-1.5">
                          <div className="relative h-28 w-28">
                            {image && (
                              <ProductImage publicId={image.publicId} alt={image.alt} className="h-full w-full" />
                            )}
                          </div>
                          <span className="line-clamp-2 min-h-8 font-sans text-xs text-ink/70">
                            {product.name}
                          </span>
                          <div className="flex items-center justify-between gap-2">
                            <Price value={variant.price} className="text-xs" />
                            <QuickAddButton productId={product._id} sku={variant.sku} stock={variant.stock} compact />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CheckoutForm>
          )}
        </div>
      </div>
    </div>
  );
}
