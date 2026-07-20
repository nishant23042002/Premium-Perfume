"use server";

import type { Types } from "mongoose";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { connectToDatabase } from "@/lib/db/connect";
import { CartModel } from "@/models/Cart";
import { ProductModel } from "@/models/Product";
import { OrderModel } from "@/models/Order";
import { getCartSessionId } from "@/lib/cart-session";

export type CheckoutState = { error?: string };

const REQUIRED_FIELDS = ["fullName", "phone", "line1", "city", "state", "pincode"] as const;
const FREE_SHIPPING_THRESHOLD = 999;
const SHIPPING_FEE = 99;

type CartItemLike = {
  productId: Types.ObjectId;
  sku: string;
  quantity: number;
  priceSnapshot: number;
};

type LeanProductForOrder = {
  _id: Types.ObjectId;
  name: string;
  images: { publicId: string; alt: string }[];
  variants: { sku: string; sizeMl: number }[];
};

export async function placeOrder(
  _prevState: CheckoutState,
  formData: FormData,
): Promise<CheckoutState> {
  for (const field of REQUIRED_FIELDS) {
    if (!String(formData.get(field) ?? "").trim()) {
      return { error: `Please fill in all required fields.` };
    }
  }

  await connectToDatabase();

  const sessionId = await getCartSessionId();
  if (!sessionId) {
    return { error: "Your cart session has expired. Please add items to your bag again." };
  }

  const cart = await CartModel.findOne({ sessionId });
  if (!cart || cart.items.length === 0) {
    return { error: "Your bag is empty." };
  }

  const cartItems: CartItemLike[] = cart.items;
  const productIds = cartItems.map((item) => item.productId);
  const products = await ProductModel.find(
    { _id: { $in: productIds } },
    "name images variants",
  ).lean<LeanProductForOrder[]>();
  const productMap = new Map(products.map((p) => [String(p._id), p]));

  const orderItems = cartItems.map((item) => {
    const product = productMap.get(String(item.productId));
    const variant = product?.variants.find((v) => v.sku === item.sku);
    return {
      productId: item.productId,
      sku: item.sku,
      name: product?.name ?? "Unknown product",
      image: product?.images[0]?.publicId,
      sizeMl: variant?.sizeMl ?? 0,
      price: item.priceSnapshot,
      quantity: item.quantity,
    };
  });

  const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const total = subtotal + shippingFee;

  const shippingAddress = {
    fullName: String(formData.get("fullName")),
    phone: String(formData.get("phone")),
    line1: String(formData.get("line1")),
    line2: String(formData.get("line2") ?? "") || undefined,
    city: String(formData.get("city")),
    state: String(formData.get("state")),
    pincode: String(formData.get("pincode")),
    country: "India",
  };

  const orderNumber = `VEL-${Date.now().toString(36).toUpperCase()}`;

  const order = await OrderModel.create({
    orderNumber,
    items: orderItems,
    shippingAddress,
    subtotal,
    shippingFee,
    discount: 0,
    total,
    status: "confirmed",
    payment: { provider: "cod", status: "pending" },
  });

  cart.items = [];
  await cart.save();

  revalidatePath("/", "layout");
  redirect(`/checkout/confirmation/${order.orderNumber}`);
}
