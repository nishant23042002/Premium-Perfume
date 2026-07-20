"use server";

import type { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db/connect";
import { CartModel } from "@/models/Cart";
import { ProductModel } from "@/models/Product";
import { getCartSessionId, getOrCreateCartSessionId } from "@/lib/cart-session";
import { getCart, type CartSummary } from "@/lib/data/cart";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

type LeanVariant = { sku: string; price: number; stock: number };
type LeanVariantOnly = { variants: LeanVariant[] };
type CartItemLike = { productId: Types.ObjectId; sku: string; quantity: number };

export async function addToCart(
  productId: string,
  sku: string,
  quantity: number,
): Promise<CartSummary> {
  await connectToDatabase();

  const product = await ProductModel.findById(productId, "variants").lean<LeanVariantOnly | null>();
  const variant = product?.variants.find((v) => v.sku === sku);
  if (!product || !variant) {
    throw new Error("Product or variant not found");
  }

  const sessionId = await getOrCreateCartSessionId();
  const expiresAt = new Date(Date.now() + THIRTY_DAYS_MS);

  const cart = await CartModel.findOne({ sessionId });

  if (!cart) {
    await CartModel.create({
      sessionId,
      items: [{ productId, sku, quantity: Math.min(quantity, variant.stock), priceSnapshot: variant.price }],
      expiresAt,
    });
  } else {
    const existingItem = cart.items.find(
      (item: CartItemLike) => item.productId.toString() === productId && item.sku === sku,
    );
    if (existingItem) {
      existingItem.quantity = Math.min(variant.stock, existingItem.quantity + quantity);
    } else {
      cart.items.push({
        productId,
        sku,
        quantity: Math.min(quantity, variant.stock),
        priceSnapshot: variant.price,
      });
    }
    cart.expiresAt = expiresAt;
    await cart.save();
  }

  return getCart();
}

export async function updateCartItemQuantity(sku: string, quantity: number): Promise<CartSummary> {
  await connectToDatabase();
  const sessionId = await getCartSessionId();
  if (!sessionId) return getCart();

  const cart = await CartModel.findOne({ sessionId });
  if (!cart) return getCart();

  if (quantity <= 0) {
    cart.items = cart.items.filter((item: CartItemLike) => item.sku !== sku);
  } else {
    const item = cart.items.find((i: CartItemLike) => i.sku === sku);
    if (item) {
      const product = await ProductModel.findOne(
        { "variants.sku": sku },
        "variants.$",
      ).lean<LeanVariantOnly | null>();
      const stock = product?.variants[0]?.stock ?? quantity;
      item.quantity = Math.min(quantity, stock);
    }
  }

  await cart.save();
  return getCart();
}

export async function removeCartItem(sku: string): Promise<CartSummary> {
  return updateCartItemQuantity(sku, 0);
}
