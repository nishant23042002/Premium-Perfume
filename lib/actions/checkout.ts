"use server";

import type { Types } from "mongoose";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { connectToDatabase } from "@/lib/db/connect";
import { CartModel } from "@/models/Cart";
import { ProductModel } from "@/models/Product";
import { OrderModel } from "@/models/Order";
import { getCartSessionId } from "@/lib/cart-session";
import { getSession } from "@/lib/auth-session";
import { saveAddressFromOrder, getCurrentUser } from "@/lib/data/users";
import { getRazorpayClient, verifyPaymentSignature } from "@/lib/razorpay";
import { decrementStock, restockItem } from "@/lib/inventory";
import { applyCoupon, releaseCoupon, type AppliedCoupon } from "@/lib/coupons";
import { sendOrderConfirmationEmail, sendOrderCancelledEmail, sendCancellationRequestedEmail } from "@/lib/email";
import { SHIPPING_FEE, FREE_SHIPPING_THRESHOLD } from "@/lib/shipping";
import { CUSTOMER_CANCELLABLE_STATUSES, type OrderStatus } from "@/lib/order-status";

const PAYMENT_LABEL: Record<string, string> = {
  cod: "Cash on Delivery",
  razorpay: "Paid Online (Razorpay)",
};

export type CheckoutState = {
  error?: string;
  razorpay?: { orderId: string; amountPaise: number; keyId: string; orderNumber: string };
};

const REQUIRED_FIELDS = ["fullName", "phone", "line1", "city", "state", "pincode"] as const;

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

type ShippingAddress = {
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
};

type PreparedOrder = {
  orderItems: {
    productId: Types.ObjectId;
    sku: string;
    name: string;
    image?: string;
    sizeMl: number;
    price: number;
    quantity: number;
  }[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  couponCode?: string;
  total: number;
  shippingAddress: ShippingAddress;
  email?: string;
  orderNumber: string;
  userId?: string;
};

/** Shared setup for both payment paths: validates the form, reads the cart,
 * applies a coupon if given, and atomically claims stock for every line
 * item — rolling back anything already claimed (and the coupon) the moment
 * one item can't be fulfilled. Returns the fully-priced order, ready to be
 * persisted by whichever payment path calls it. */
async function prepareOrder(
  formData: FormData,
): Promise<{ ok: true; order: PreparedOrder } | { ok: false; error: string }> {
  for (const field of REQUIRED_FIELDS) {
    if (!String(formData.get(field) ?? "").trim()) {
      return { ok: false, error: "Please fill in all required fields." };
    }
  }

  await connectToDatabase();

  const sessionId = await getCartSessionId();
  if (!sessionId) {
    return { ok: false, error: "Your cart session has expired. Please add items to your bag again." };
  }

  const cart = await CartModel.findOne({ sessionId });
  if (!cart || cart.items.length === 0) {
    return { ok: false, error: "Your bag is empty." };
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

  const couponCode = String(formData.get("couponCode") ?? "").trim();
  let appliedCoupon: AppliedCoupon | null = null;
  if (couponCode) {
    const result = await applyCoupon(couponCode, subtotal);
    if (!result.ok) return { ok: false, error: result.error };
    appliedCoupon = result.coupon;
  }

  const claimed: { productId: Types.ObjectId; sku: string; quantity: number }[] = [];
  for (const item of orderItems) {
    const ok = await decrementStock(item.productId, item.sku, item.quantity);
    if (!ok) {
      for (const claim of claimed) await restockItem(claim.productId, claim.sku, claim.quantity);
      if (appliedCoupon) await releaseCoupon(appliedCoupon.code);
      return { ok: false, error: `Sorry, "${item.name}" just sold out. Please update your bag and try again.` };
    }
    claimed.push({ productId: item.productId, sku: item.sku, quantity: item.quantity });
  }

  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const discount = appliedCoupon?.discount ?? 0;
  const total = subtotal + shippingFee - discount;

  const shippingAddress: ShippingAddress = {
    fullName: String(formData.get("fullName")),
    phone: String(formData.get("phone")),
    line1: String(formData.get("line1")),
    line2: String(formData.get("line2") ?? "") || undefined,
    city: String(formData.get("city")),
    state: String(formData.get("state")),
    pincode: String(formData.get("pincode")),
    country: "India",
  };

  const orderNumber = `RSK-${Date.now().toString(36).toUpperCase()}`;
  const session = await getSession();
  const email = String(formData.get("email") ?? "").trim() || undefined;

  return {
    ok: true,
    order: {
      orderItems,
      subtotal,
      shippingFee,
      discount,
      couponCode: appliedCoupon?.code,
      total,
      shippingAddress,
      email,
      orderNumber,
      userId: session?.userId,
    },
  };
}

async function rollbackPreparedOrder(order: PreparedOrder): Promise<void> {
  for (const item of order.orderItems) await restockItem(item.productId, item.sku, item.quantity);
  if (order.couponCode) await releaseCoupon(order.couponCode);
}

export async function placeOrder(
  _prevState: CheckoutState,
  formData: FormData,
): Promise<CheckoutState> {
  const prepared = await prepareOrder(formData);
  if (!prepared.ok) return { error: prepared.error };
  const { order } = prepared;

  const paymentMethod = String(formData.get("payment") ?? "cod");

  if (paymentMethod === "razorpay") {
    try {
      const razorpay = getRazorpayClient();
      const amountPaise = Math.round(order.total * 100);
      const razorpayOrder = await razorpay.orders.create({
        amount: amountPaise,
        currency: "INR",
        receipt: order.orderNumber,
      });

      await OrderModel.create({
        orderNumber: order.orderNumber,
        userId: order.userId,
        items: order.orderItems,
        email: order.email,
        shippingAddress: order.shippingAddress,
        subtotal: order.subtotal,
        shippingFee: order.shippingFee,
        discount: order.discount,
        couponCode: order.couponCode,
        total: order.total,
        // Stays "pending" until Razorpay confirms payment — the cart is
        // deliberately NOT cleared yet, so an abandoned/failed payment
        // leaves the customer able to check out again. Stock and the
        // coupon use are already claimed at this point, though; if the
        // payment is never completed, cancelPendingOrder() (wired to the
        // Checkout widget's dismiss handler) releases them.
        status: "pending",
        payment: { provider: "razorpay", status: "pending", razorpayOrderId: razorpayOrder.id },
      });

      return {
        razorpay: {
          orderId: razorpayOrder.id,
          amountPaise,
          keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "",
          orderNumber: order.orderNumber,
        },
      };
    } catch (error) {
      await rollbackPreparedOrder(order);
      return {
        error:
          error instanceof Error
            ? `Couldn't start the payment: ${error.message}`
            : "Couldn't start the payment. Please try again.",
      };
    }
  }

  // Cash on Delivery — finalize immediately.
  await OrderModel.create({
    orderNumber: order.orderNumber,
    userId: order.userId,
    items: order.orderItems,
    email: order.email,
    shippingAddress: order.shippingAddress,
    subtotal: order.subtotal,
    shippingFee: order.shippingFee,
    discount: order.discount,
    couponCode: order.couponCode,
    total: order.total,
    status: "confirmed",
    payment: { provider: "cod", status: "pending" },
  });

  const sessionId = await getCartSessionId();
  await CartModel.updateOne({ sessionId }, { items: [] });

  if (order.email) {
    await sendOrderConfirmationEmail({
      to: order.email,
      orderNumber: order.orderNumber,
      items: order.orderItems,
      shippingFee: order.shippingFee,
      discount: order.discount,
      total: order.total,
      paymentLabel: PAYMENT_LABEL.cod,
      shippingAddress: order.shippingAddress,
    });
  }

  if (order.userId) await saveAddressFromOrder(order.userId, order.shippingAddress, order.email);

  revalidatePath("/", "layout");
  redirect(
    order.userId
      ? `/account?tab=orders&placed=${order.orderNumber}`
      : `/checkout/confirmation/${order.orderNumber}`,
  );
}

export type VerifyPaymentState = { error?: string };

/** Called client-side right after Razorpay's Checkout widget reports
 * success. Verifying the signature here (rather than trusting the client)
 * is what actually proves the payment happened — the webhook in
 * app/api/webhooks/razorpay/route.ts is a defensive backstop in case this
 * call never fires (e.g. the tab closes right after paying). */
export async function verifyRazorpayPayment(params: {
  orderNumber: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}): Promise<VerifyPaymentState> {
  const { orderNumber, razorpayOrderId, razorpayPaymentId, razorpaySignature } = params;

  const isValid = verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
  if (!isValid) return { error: "Payment verification failed. Please contact support before retrying." };

  await connectToDatabase();
  const order = await OrderModel.findOne({ orderNumber, "payment.razorpayOrderId": razorpayOrderId });
  if (!order) return { error: "Couldn't find that order." };

  if (order.payment.status !== "paid") {
    order.payment.status = "paid";
    order.payment.transactionId = razorpayPaymentId;
    order.payment.paidAt = new Date();
    order.status = "confirmed";
    await order.save();

    // Inside this guard so the webhook (a defensive backstop for this same
    // transition — see app/api/webhooks/razorpay/route.ts) can't send a
    // second copy if it arrives after this call already confirmed the order.
    if (order.email) {
      await sendOrderConfirmationEmail({
        to: order.email,
        orderNumber: order.orderNumber,
        items: order.items,
        shippingFee: order.shippingFee,
        discount: order.discount,
        total: order.total,
        paymentLabel: PAYMENT_LABEL.razorpay,
        shippingAddress: order.shippingAddress,
      });
    }
  }

  const sessionId = await getCartSessionId();
  if (sessionId) await CartModel.updateOne({ sessionId }, { items: [] });

  if (order.userId) {
    await saveAddressFromOrder(String(order.userId), order.shippingAddress, order.email ?? undefined);
  }

  revalidatePath("/", "layout");
  redirect(
    order.userId ? `/account?tab=orders&placed=${orderNumber}` : `/checkout/confirmation/${orderNumber}`,
  );
}

/** Releases a pending Razorpay order's reserved stock and coupon use —
 * called when the customer dismisses the Checkout widget without paying,
 * so retrying checkout doesn't leave inventory double-reserved. */
export async function cancelPendingOrder(orderNumber: string): Promise<void> {
  await connectToDatabase();
  const order = await OrderModel.findOne({
    orderNumber,
    status: "pending",
    "payment.provider": "razorpay",
    "payment.status": "pending",
  });
  if (!order) return;

  for (const item of order.items) {
    await restockItem(item.productId, item.sku, item.quantity);
  }
  if (order.couponCode) await releaseCoupon(order.couponCode);

  order.status = "cancelled";
  await order.save();
}

export type CancelOrderState = { error?: string; success?: boolean };

/** Customer-initiated cancellation, only reachable from the account page for
 * an order the logged-in user actually owns. An order that was never
 * actually charged (COD, or a Razorpay order abandoned before payment) is
 * cancelled immediately — there's no money to return. A Razorpay order that
 * WAS paid instead moves to "cancellation_requested": the refund isn't
 * fired here, it waits for an admin to approve it via
 * resolveCancellationRequest in lib/actions/orders.ts. */
export async function requestCancellation(orderNumber: string, reason: string): Promise<CancelOrderState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Please log in to manage your orders." };

  await connectToDatabase();
  const order = await OrderModel.findOne({ orderNumber });
  if (!order) return { error: "Order not found." };
  if (!order.userId || String(order.userId) !== user.id) {
    return { error: "You don't have permission to cancel this order." };
  }

  const previousStatus = order.status as OrderStatus;
  if (!CUSTOMER_CANCELLABLE_STATUSES.includes(previousStatus)) {
    return { error: "This order can no longer be cancelled — it's already on its way." };
  }

  const trimmedReason = reason.trim().slice(0, 300) || undefined;
  const wasPaidOnline = order.payment.provider === "razorpay" && order.payment.status === "paid";

  if (!wasPaidOnline) {
    for (const item of order.items) {
      await restockItem(item.productId, item.sku, item.quantity);
    }
    if (order.couponCode) await releaseCoupon(order.couponCode);

    const now = new Date();
    order.status = "cancelled";
    order.cancellation = {
      reason: trimmedReason,
      requestedBy: "customer",
      requestedAt: now,
      previousStatus,
      resolution: "auto",
      resolvedAt: now,
    };
    await order.save();

    if (order.email) {
      await sendOrderCancelledEmail({
        to: order.email,
        orderNumber: order.orderNumber,
        total: order.total,
        reason: trimmedReason,
      });
    }
  } else {
    order.status = "cancellation_requested";
    order.cancellation = {
      reason: trimmedReason,
      requestedBy: "customer",
      requestedAt: new Date(),
      previousStatus,
    };
    await order.save();

    if (order.email) {
      await sendCancellationRequestedEmail({
        to: order.email,
        orderNumber: order.orderNumber,
        total: order.total,
        reason: trimmedReason,
      });
    }
  }

  revalidatePath("/account");
  return { success: true };
}
