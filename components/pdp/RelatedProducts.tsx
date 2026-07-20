import { ProductCard } from "@/components/product/ProductCard";
import { getRelatedProducts } from "@/lib/data/products";

export async function RelatedProducts({
  productId,
  categoryIds,
}: {
  productId: string;
  categoryIds: string[];
}) {
  if (categoryIds.length === 0) return null;

  const products = await getRelatedProducts(productId, categoryIds, 4);
  if (products.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
}
