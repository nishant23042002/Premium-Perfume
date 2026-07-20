import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Price } from "@/components/ui/Price";
import { ProductImage } from "@/components/ui/ProductImage";
import { Rating } from "@/components/ui/Rating";
import { getDefaultVariant } from "@/lib/product";
import type { ProductCardData } from "@/lib/data/products";

export function ProductCard({ product }: { product: ProductCardData }) {
  const variant = getDefaultVariant(product.variants);
  const image = product.images[0];

  return (
    <Link href={`/product/${product.slug}`} className="group flex flex-col gap-3">
      <div className="relative aspect-[4/5] w-full">
        {image && (
          <ProductImage
            publicId={image.publicId}
            alt={image.alt}
            className="h-full w-full transition-transform duration-500 group-hover:scale-[1.03]"
          />
        )}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {product.isBestseller && <Badge tone="accent">Bestseller</Badge>}
          {product.isNewArrival && <Badge tone="ink">New</Badge>}
          {product.isLimitedEdition && <Badge tone="secondary">Limited</Badge>}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <h3 className="font-display text-lg text-ink">{product.name}</h3>
        {product.rating.count > 0 && (
          <Rating value={product.rating.average} count={product.rating.count} />
        )}
        <Price value={variant.price} compareAtValue={variant.compareAtPrice} />
      </div>
    </Link>
  );
}
