"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/db/connect";
import { OrderModel } from "@/models/Order";
import { restockItem } from "@/lib/inventory";
import { releaseCoupon } from "@/lib/coupons";
import { refundPayment } from "@/lib/razorpay";
import { sendRefundProcessedEmail, sendCancellationDeclinedEmail } from "@/lib/email";
import { getCurrentAdmin, hasPermission } from "@/lib/data/adminUsers";
import { ADMIN_SELECTABLE_STATUSES, type OrderStatus } from "@/lib/order-status";

export type UpdateOrderStatusState = { error?: string; success?: boolean };

export async function updateOrderStatus(
  orderNumber: string,
  nextStatus: OrderStatus,
): Promise<UpdateOrderStatusState> {
  if (!ADMIN_SELECTABLE_STATUSES.includes(nextStatus)) return { error: "Not a valid status." };

  const admin = await getCurrentAdmin();
  if (!hasPermission(admin, "orders.manage")) {
    return { error: "You don't have permission to manage orders." };
  }

  await connectToDatabase();
  const order = await OrderModel.findOne({ orderNumber });
  if (!order) return { error: "Order not found." };

  // A pending cancellation request has its own dedicated approve/reject
  // action (resolveCancellationRequest below) — it does the real refund and
  // records who resolved it. Routing it through the generic dropdown
  // instead would skip both, so it's blocked here rather than silently
  // allowed.
  if (order.status === "cancellation_requested") {
    return { error: "This order has a pending cancellation request — use Approve/Reject instead." };
  }

  const wasCancelledOrRefunded = order.status === "cancelled" || order.status === "refunded";
  const nowCancelledOrRefunded = nextStatus === "cancelled" || nextStatus === "refunded";

  // Move the actual money BEFORE touching any local records. If the
  // Razorpay call fails, this returns an error and nothing below runs — the
  // order is left exactly as it was, rather than claiming a refund happened
  // when no money actually moved.
  if (nextStatus === "refunded" && order.payment.provider === "razorpay") {
    if (order.payment.status === "refunded") {
      // Already refunded — either by us just now on a retried click, or
      // manually in the Razorpay Dashboard. Just sync the status below,
      // no second refund call (Razorpay would reject it anyway).
    } else if (order.payment.status !== "paid" || !order.payment.transactionId) {
      return {
        error: "This order was never actually charged online — there's no Razorpay payment to refund.",
      };
    } else {
      try {
        const refund = await refundPayment(order.payment.transactionId, order.total);
        order.payment.refundId = refund.refundId;
        order.payment.refundedAt = new Date();
      } catch (error) {
        return {
          error:
            error instanceof Error
              ? `Razorpay refund failed: ${error.message}`
              : "Razorpay refund failed. Check the Razorpay Dashboard before retrying.",
        };
      }
    }
  }
  // COD orders marked "refunded" get no Razorpay call — money was collected
  // in cash on delivery (or never collected at all), so there's nothing for
  // Razorpay to reverse. This just records that a manual cash refund was
  // handled outside the app.

  // Cancelling/refunding an order that hadn't already been released puts the
  // stock it held back on the shelf, and frees up any coupon use it had
  // claimed. Guarded so flipping between cancelled and refunded (or
  // re-selecting the same status) can't double-restock or double-release.
  if (nowCancelledOrRefunded && !wasCancelledOrRefunded) {
    for (const item of order.items) {
      await restockItem(item.productId, item.sku, item.quantity);
    }
    if (order.couponCode) await releaseCoupon(order.couponCode);
  }

  order.status = nextStatus;
  if (nextStatus === "refunded") order.payment.status = "refunded";
  await order.save();

  revalidatePath("/admin");
  revalidatePath("/account");
  return { success: true };
}

export type ResolveCancellationState = { error?: string; success?: boolean };

/** Approves or rejects a customer's cancellation request on a paid Razorpay
 * order (lib/actions/checkout.ts's requestCancellation is what puts an
 * order into "cancellation_requested" in the first place — this is the only
 * way out of that state). Approving fires the real refund before touching
 * any local state, exactly like updateOrderStatus's own refund path.
 * Rejecting restores the status the order was in before the request, since
 * nothing was actually cancelled yet — stock and the coupon claim were
 * never released at request time, so there's nothing to restore there. */
export async function resolveCancellationRequest(
  orderNumber: string,
  decision: "approve" | "reject",
): Promise<ResolveCancellationState> {
  const admin = await getCurrentAdmin();
  if (!hasPermission(admin, "orders.manage")) {
    return { error: "You don't have permission to manage orders." };
  }

  await connectToDatabase();
  const order = await OrderModel.findOne({ orderNumber });
  if (!order) return { error: "Order not found." };
  if (order.status !== "cancellation_requested") {
    return { error: "This order doesn't have a pending cancellation request." };
  }

  const resolvedBy = admin!.email;
  const now = new Date();

  if (decision === "reject") {
    order.status = order.cancellation?.previousStatus ?? "confirmed";
    order.cancellation = {
      ...order.cancellation,
      resolution: "rejected",
      resolvedAt: now,
      resolvedBy,
    };
    await order.save();

    if (order.email) {
      await sendCancellationDeclinedEmail({ to: order.email, orderNumber: order.orderNumber });
    }

    revalidatePath("/admin");
    revalidatePath("/account");
    return { success: true };
  }

  if (order.payment.status !== "refunded") {
    if (order.payment.status !== "paid" || !order.payment.transactionId) {
      return { error: "This order was never actually charged online — there's no payment to refund." };
    }
    try {
      const refund = await refundPayment(order.payment.transactionId, order.total);
      order.payment.refundId = refund.refundId;
      order.payment.refundedAt = now;
    } catch (error) {
      return {
        error:
          error instanceof Error
            ? `Razorpay refund failed: ${error.message}`
            : "Razorpay refund failed. Check the Razorpay Dashboard before retrying.",
      };
    }
  }

  for (const item of order.items) {
    await restockItem(item.productId, item.sku, item.quantity);
  }
  if (order.couponCode) await releaseCoupon(order.couponCode);

  order.status = "refunded";
  order.payment.status = "refunded";
  order.cancellation = {
    ...order.cancellation,
    resolution: "approved",
    resolvedAt: now,
    resolvedBy,
  };
  await order.save();

  if (order.email) {
    await sendRefundProcessedEmail({
      to: order.email,
      orderNumber: order.orderNumber,
      refundAmount: order.total,
    });
  }

  revalidatePath("/admin");
  revalidatePath("/account");
  return { success: true };
}
