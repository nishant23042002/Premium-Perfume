import type { Types } from "mongoose";
import { ProductModel } from "@/models/Product";

/** Atomically decrements one variant's stock, but only if enough is left —
 * the `variants.stock: { $gte: quantity }` guard in the filter means the
 * update simply matches nothing if stock is insufficient, so two concurrent
 * orders can never both succeed against the last unit. */
export async function decrementStock(
  productId: Types.ObjectId,
  sku: string,
  quantity: number,
): Promise<boolean> {
  const result = await ProductModel.updateOne(
    { _id: productId, variants: { $elemMatch: { sku, stock: { $gte: quantity } } } },
    { $inc: { "variants.$.stock": -quantity } },
  );
  return result.modifiedCount === 1;
}

export async function restockItem(productId: Types.ObjectId, sku: string, quantity: number): Promise<void> {
  await ProductModel.updateOne(
    { _id: productId, "variants.sku": sku },
    { $inc: { "variants.$.stock": quantity } },
  );
}
