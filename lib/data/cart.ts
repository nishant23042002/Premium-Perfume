import type { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db/connect";
import { CartModel } from "@/models/Cart";
import { ProductModel } from "@/models/Product";
import { getCartSessionId } from "@/lib/cart-session";

export type CartLine = {
  productId: string;
  sku: string;
  quantity: number;
  priceSnapshot: number;
  product: {
    name: string;
    slug: string;
    image?: { publicId: string; alt: string };
    sizeMl: number;
    stock: number;
  } | null;
};

export type CartSummary = {
  items: CartLine[];
  subtotal: number;
  itemCount: number;
};

const EMPTY_CART: CartSummary = { items: [], subtotal: 0, itemCount: 0 };

type LeanCartItem = {
  productId: Types.ObjectId;
  sku: string;
  quantity: number;
  priceSnapshot: number;
};

type LeanCart = { items: LeanCartItem[] };

type LeanCartProduct = {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  images: { publicId: string; alt: string }[];
  variants: { sku: string; sizeMl: number; stock: number }[];
};

export async function getCart(): Promise<CartSummary> {
  const sessionId = await getCartSessionId();
  if (!sessionId) return EMPTY_CART;

  await connectToDatabase();
  const cart = await CartModel.findOne({ sessionId }).lean<LeanCart | null>();
  if (!cart || cart.items.length === 0) return EMPTY_CART;

  const productIds = cart.items.map((item) => item.productId);
  const products = await ProductModel.find(
    { _id: { $in: productIds } },
    "name slug images variants",
  ).lean<LeanCartProduct[]>();
  const productMap = new Map(products.map((p) => [String(p._id), p]));

  const items: CartLine[] = cart.items.map((item) => {
    const product = productMap.get(String(item.productId));
    const variant = product?.variants.find((v) => v.sku === item.sku);

    return {
      productId: String(item.productId),
      sku: item.sku,
      quantity: item.quantity,
      priceSnapshot: item.priceSnapshot,
      product: product
        ? {
            name: product.name,
            slug: product.slug,
            image: product.images[0],
            sizeMl: variant?.sizeMl ?? 0,
            stock: variant?.stock ?? 0,
          }
        : null,
    };
  });

  const subtotal = items.reduce((sum, item) => sum + item.priceSnapshot * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return { items, subtotal, itemCount };
}
