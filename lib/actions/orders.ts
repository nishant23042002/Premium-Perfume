"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/db/connect";
import { OrderModel } from "@/models/Order";
import { restockItem } from "@/lib/inventory";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/order-status";

export type UpdateOrderStatusState = { error?: string; success?: boolean };

export async function updateOrderStatus(
  orderNumber: string,
  nextStatus: OrderStatus,
): Promise<UpdateOrderStatusState> {
  if (!ORDER_STATUSES.includes(nextStatus)) return { error: "Not a valid status." };

  await connectToDatabase();
  const order = await OrderModel.findOne({ orderNumber });
  if (!order) return { error: "Order not found." };

  const wasCancelledOrRefunded = order.status === "cancelled" || order.status === "refunded";
  const nowCancelledOrRefunded = nextStatus === "cancelled" || nextStatus === "refunded";

  // Cancelling/refunding an order that hadn't already been released puts the
  // stock it held back on the shelf. Guarded so flipping between cancelled
  // and refunded (or re-selecting the same status) can't double-restock.
  if (nowCancelledOrRefunded && !wasCancelledOrRefunded) {
    for (const item of order.items) {
      await restockItem(item.productId, item.sku, item.quantity);
    }
  }

  order.status = nextStatus;
  if (nextStatus === "refunded") order.payment.status = "refunded";
  await order.save();

  revalidatePath("/admin");
  return { success: true };
}
