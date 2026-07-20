import { ProductCard } from "@/components/product/ProductCard";
import type { ProductCardData } from "@/lib/data/products";

export function ProductGrid({ products }: { products: ProductCardData[] }) {
  if (products.length === 0) {
    return (
      <p className="py-16 text-center font-sans text-sm text-ink/50">
        No products match your filters.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
}
