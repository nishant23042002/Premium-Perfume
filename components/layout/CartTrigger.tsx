"use client";

import { ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart-context";

export function CartTrigger() {
  const { cart, openCart } = useCart();

  return (
    <button
      type="button"
      onClick={openCart}
      aria-label="Open cart"
      className="relative text-ink hover:text-accent-dark"
    >
      <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
      {cart.itemCount > 0 && (
        <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-secondary px-1 font-sans text-[10px] font-medium text-ivory">
          {cart.itemCount}
        </span>
      )}
    </button>
  );
}
