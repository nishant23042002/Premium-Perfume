"use client";

import Link from "next/link";
import { Price } from "@/components/ui/Price";
import { ProductImage } from "@/components/ui/ProductImage";
import { QuickAddButton } from "@/components/cart/QuickAddButton";
import { useCart } from "@/lib/cart-context";
import { getDefaultVariant } from "@/lib/product";

export function CartRecommendations() {
  const { cart, recommendations, closeCart } = useCart();
  const cartProductIds = new Set(cart.items.map((item) => item.productId));
  const suggestions = recommendations.filter((p) => !cartProductIds.has(p._id)).slice(0, 4);

  if (suggestions.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      <span className="font-sans text-xs font-semibold uppercase tracking-[0.15em] text-ink/50">
        You May Also Like
      </span>
      <div className="flex flex-col gap-4">
        {suggestions.map((product) => {
          const variant = getDefaultVariant(product.variants);
          const image = product.images[0];
          return (
            <div key={product._id} className="flex items-center gap-3">
              <Link
                href={`/product/${product.slug}`}
                onClick={closeCart}
                className="relative h-16 w-14 shrink-0"
              >
                {image && (
                  <ProductImage publicId={image.publicId} alt={image.alt} className="h-full w-full" />
                )}
              </Link>
              <div className="flex flex-1 flex-col gap-1">
                <Link
                  href={`/product/${product.slug}`}
                  onClick={closeCart}
                  className="font-sans text-sm text-ink hover:text-accent-dark"
                >
                  {product.name}
                </Link>
                <Price value={variant.price} compareAtValue={variant.compareAtPrice} className="text-xs" />
              </div>
              <QuickAddButton productId={product._id} sku={variant.sku} stock={variant.stock} compact />
            </div>
          );
        })}
      </div>
    </div>
  );
}
