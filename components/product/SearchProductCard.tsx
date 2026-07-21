import Link from "next/link";
import { Price } from "@/components/ui/Price";
import { ProductImage } from "@/components/ui/ProductImage";
import { QuickAddButton } from "@/components/cart/QuickAddButton";
import { getDefaultVariant } from "@/lib/product";
import type { ProductCardData } from "@/lib/data/products";

/** Compact product card for the search modal — smaller than the full
 * ProductCard (no rating/badges), but still image + name + price + a real
 * add-to-cart button. */
export function SearchProductCard({ product }: { product: ProductCardData }) {
  const variant = getDefaultVariant(product.variants);
  const image = product.images[0];

  return (
    <div className="flex flex-col gap-2">
      <Link href={`/product/${product.slug}`} className="relative block aspect-square w-full">
        {image && (
          <ProductImage publicId={image.publicId} alt={image.alt} className="h-full w-full" />
        )}
      </Link>

      <Link href={`/product/${product.slug}`} className="flex flex-col gap-0.5">
        <h3 className="line-clamp-1 font-sans text-xs font-medium text-ink">{product.name}</h3>
        <Price value={variant.price} compareAtValue={variant.compareAtPrice} size="sm" />
      </Link>

      <QuickAddButton productId={product._id} sku={variant.sku} stock={variant.stock} />
    </div>
  );
}
