"use client";

import { useState, useTransition } from "react";
import { Check, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/lib/cart-context";
import { Spinner } from "@/components/ui/Spinner";

export function QuickAddButton({
  productId,
  sku,
  stock,
  compact = false,
}: {
  productId: string;
  sku: string;
  stock: number;
  compact?: boolean;
}) {
  const { addItem } = useCart();
  const [isPending, startTransition] = useTransition();
  const [justAdded, setJustAdded] = useState(false);
  const outOfStock = stock <= 0;

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock || isPending) return;
    startTransition(async () => {
      await addItem(productId, sku, 1);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1500);
    });
  }

  if (compact) {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={outOfStock || isPending}
        aria-label="Add to cart"
        className="flex h-8 w-8 shrink-0 items-center justify-center border border-ink/20 text-ink transition-colors hover:border-accent-dark hover:text-accent-dark disabled:opacity-30"
      >
        {isPending ? (
          <Spinner className="h-3.5 w-3.5" />
        ) : justAdded ? (
          <Check className="h-3.5 w-3.5" />
        ) : (
          <Plus className="h-3.5 w-3.5" />
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={outOfStock || isPending}
      className={cn(
        "flex w-full items-center justify-center gap-2 border border-ink/20 py-2 font-sans text-xs font-medium uppercase tracking-[0.08em] text-ink transition-colors hover:border-accent-dark hover:text-accent-dark disabled:opacity-40",
        justAdded && "border-accent-dark text-accent-dark",
      )}
    >
      {isPending && <Spinner className="h-3.5 w-3.5" />}
      {outOfStock ? "Out of Stock" : isPending ? "Adding..." : justAdded ? "Added ✓" : "Add to Cart"}
    </button>
  );
}
