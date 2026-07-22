"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import {
  addToCart as addToCartAction,
  removeCartItem as removeCartItemAction,
  updateCartItemQuantity as updateCartItemQuantityAction,
} from "@/lib/actions/cart";
import type { CartSummary } from "@/lib/data/cart";
import type { ProductCardData } from "@/lib/data/products";
import type { AddressDoc } from "@/lib/data/users";
import type { CategoryShowcaseCard } from "@/lib/data/categoryShowcase";
import { useBodyScrollLock } from "@/lib/use-body-scroll-lock";

type CartContextValue = {
  cart: CartSummary;
  recommendations: ProductCardData[];
  savedAddresses: AddressDoc[];
  categoryShowcase: CategoryShowcaseCard[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (productId: string, sku: string, quantity?: number) => Promise<void>;
  updateQuantity: (sku: string, quantity: number) => Promise<void>;
  removeItem: (sku: string) => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({
  initialCart,
  recommendations,
  savedAddresses,
  categoryShowcase,
  children,
}: {
  initialCart: CartSummary;
  recommendations: ProductCardData[];
  savedAddresses: AddressDoc[];
  categoryShowcase: CategoryShowcaseCard[];
  children: ReactNode;
}) {
  const [cart, setCart] = useState(initialCart);
  const [prevInitialCart, setPrevInitialCart] = useState(initialCart);
  const [isOpen, setIsOpen] = useState(false);

  // The root layout re-fetches the cart on every navigation, but this
  // Provider stays mounted across navigations (shared layout) — useState's
  // initializer only applies on first mount, so without this the client
  // state would never pick up server-side changes (e.g. the cart clearing
  // after checkout redirects to the confirmation page). Adjusting state
  // directly during render (rather than in an effect) avoids the extra
  // render pass, per React's guidance for this exact pattern.
  if (initialCart !== prevInitialCart) {
    setPrevInitialCart(initialCart);
    setCart(initialCart);
  }

  useBodyScrollLock("cart-drawer", isOpen);

  const addItem = useCallback(async (productId: string, sku: string, quantity = 1) => {
    const updated = await addToCartAction(productId, sku, quantity);
    setCart(updated);
    setIsOpen(true);
  }, []);

  const updateQuantity = useCallback(async (sku: string, quantity: number) => {
    const updated = await updateCartItemQuantityAction(sku, quantity);
    setCart(updated);
  }, []);

  const removeItem = useCallback(async (sku: string) => {
    const updated = await removeCartItemAction(sku);
    setCart(updated);
  }, []);

  return (
    <CartContext.Provider
      value={{
        cart,
        recommendations,
        savedAddresses,
        categoryShowcase,
        isOpen,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
        addItem,
        updateQuantity,
        removeItem,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
