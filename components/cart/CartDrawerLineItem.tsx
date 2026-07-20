"use client";

import { useTransition } from "react";
import Link from "next/link";
import { Minus, Plus, X } from "lucide-react";
import { ProductImage } from "@/components/ui/ProductImage";
import { Price } from "@/components/ui/Price";
import { cn } from "@/lib/utils";
import { useCart } from "@/lib/cart-context";
import type { CartLine } from "@/lib/data/cart";

export function CartDrawerLineItem({ item }: { item: CartLine }) {
  const { updateQuantity, removeItem, closeCart } = useCart();
  const [isPending, startTransition] = useTransition();

  if (!item.product) return null;
  const { product } = item;

  return (
    <div className={cn("flex gap-3 py-5", isPending && "opacity-50")}>
      <Link
        href={`/product/${product.slug}`}
        onClick={closeCart}
        className="relative h-20 w-16 shrink-0"
      >
        <ProductImage
          publicId={product.image?.publicId ?? ""}
          alt={product.image?.alt ?? product.name}
          className="h-full w-full"
        />
      </Link>

      <div className="flex flex-1 flex-col gap-1.5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Link
              href={`/product/${product.slug}`}
              onClick={closeCart}
              className="font-sans text-sm font-medium text-ink hover:text-accent-dark"
            >
              {product.name}
            </Link>
            <p className="font-sans text-xs text-ink/50">{product.sizeMl}ml</p>
          </div>
          <button
            type="button"
            onClick={() => startTransition(() => removeItem(item.sku))}
            aria-label="Remove item"
            className="text-ink/40 hover:text-secondary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center border border-ink/20">
            <button
              type="button"
              onClick={() => startTransition(() => updateQuantity(item.sku, item.quantity - 1))}
              aria-label="Decrease quantity"
              className="flex h-8 w-8 items-center justify-center text-ink"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="w-7 text-center font-sans text-xs">{item.quantity}</span>
            <button
              type="button"
              onClick={() => startTransition(() => updateQuantity(item.sku, item.quantity + 1))}
              aria-label="Increase quantity"
              disabled={item.quantity >= product.stock}
              className="flex h-8 w-8 items-center justify-center text-ink disabled:opacity-30"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
          <Price value={item.priceSnapshot * item.quantity} className="text-sm" />
        </div>
      </div>
    </div>
  );
}
