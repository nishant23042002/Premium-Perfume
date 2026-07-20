"use client";

import { useTransition } from "react";
import { ProductImage } from "@/components/ui/ProductImage";
import { removeProductImage } from "@/lib/actions/admin";
import type { AdminProduct } from "@/lib/data/products";

export function ProductImageList({ products }: { products: AdminProduct[] }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-col gap-4">
      {products.map((product) => (
        <div key={product._id} className="flex items-start gap-4 border border-gray-200 bg-white p-4">
          <div className="w-40 shrink-0">
            <p className="text-sm font-medium text-gray-900">{product.name}</p>
            <p className="text-xs text-gray-500">{product.images.length} image(s)</p>
          </div>
          <div className="flex flex-1 flex-wrap gap-3">
            {product.images.map((image) => (
              <div key={image.publicId} className="flex flex-col gap-1">
                <div className="relative h-20 w-16 bg-gray-100">
                  <ProductImage publicId={image.publicId} alt={image.alt} className="h-full w-full" />
                </div>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() =>
                    startTransition(() => removeProductImage(product._id, image.publicId))
                  }
                  className="text-[10px] font-medium uppercase text-red-600 hover:underline disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
