"use client";

import { useState, useTransition } from "react";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Price } from "@/components/ui/Price";
import { cn } from "@/lib/utils";
import { useCart } from "@/lib/cart-context";

type Variant = {
  sku: string;
  sizeMl: number;
  price: number;
  compareAtPrice?: number;
  stock: number;
  isDefault?: boolean;
};

export function PurchasePanel({
  productId,
  variants,
}: {
  productId: string;
  variants: Variant[];
}) {
  const { addItem } = useCart();
  const defaultVariant = variants.find((v) => v.isDefault) ?? variants[0];
  const [selectedSku, setSelectedSku] = useState(defaultVariant.sku);
  const [quantity, setQuantity] = useState(1);
  const [isPending, startTransition] = useTransition();

  const variant = variants.find((v) => v.sku === selectedSku) ?? defaultVariant;
  const outOfStock = variant.stock <= 0;

  function selectVariant(sku: string) {
    setSelectedSku(sku);
    setQuantity(1);
  }

  function handleAddToCart() {
    startTransition(async () => {
      await addItem(productId, variant.sku, quantity);
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <span className="font-sans text-xs uppercase tracking-[0.15em] text-ink/50">Size</span>
        <div className="flex flex-wrap gap-2">
          {variants.map((v) => (
            <button
              key={v.sku}
              type="button"
              onClick={() => selectVariant(v.sku)}
              aria-pressed={v.sku === selectedSku}
              className={cn(
                "border px-4 py-2 font-sans text-sm transition-colors",
                v.sku === selectedSku
                  ? "border-accent-dark bg-accent/15 text-accent-dark"
                  : "border-ink/20 text-ink/70 hover:border-ink/40",
              )}
            >
              {v.sizeMl}ml
            </button>
          ))}
        </div>
      </div>

      <Price value={variant.price} compareAtValue={variant.compareAtPrice} className="text-xl" />

      {!outOfStock && variant.stock <= 10 && (
        <span className="font-sans text-xs text-accent-dark">Only {variant.stock} left in stock</span>
      )}

      <div className="flex items-center gap-4">
        <div className="flex items-center border border-ink/20">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            aria-label="Decrease quantity"
            className="flex h-11 w-11 items-center justify-center text-ink disabled:opacity-30"
            disabled={quantity <= 1}
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-10 text-center font-sans text-sm">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(variant.stock, q + 1))}
            aria-label="Increase quantity"
            className="flex h-11 w-11 items-center justify-center text-ink disabled:opacity-30"
            disabled={quantity >= variant.stock}
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <Button
          type="button"
          variant="primary"
          size="lg"
          className="flex-1"
          onClick={handleAddToCart}
          disabled={outOfStock || isPending}
        >
          {outOfStock ? "Out of Stock" : isPending ? "Adding..." : "Add to Bag"}
        </Button>
      </div>
    </div>
  );
}
