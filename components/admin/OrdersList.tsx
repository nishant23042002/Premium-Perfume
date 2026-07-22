"use client";

import { useTransition } from "react";
import { updateOrderStatus } from "@/lib/actions/orders";
import { ORDER_STATUSES, type AdminOrderRow, type OrderStatus } from "@/lib/order-status";
import { formatInr } from "@/lib/utils";
import { AdminCard } from "@/components/admin/ui/AdminCard";

const statusToneClass: Record<OrderStatus, string> = {
  pending: "text-admin-ink-faint",
  confirmed: "text-blue-600",
  processing: "text-admin-accent-dark",
  shipped: "text-indigo-600",
  delivered: "text-admin-success",
  cancelled: "text-admin-danger",
  refunded: "text-admin-danger",
};

const PAYMENT_LABEL: Record<string, string> = {
  cod: "COD",
  razorpay: "Razorpay",
  stripe: "Stripe",
};

function OrderRow({ order, canManage }: { order: AdminOrderRow; canManage: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <tr className="border-b border-admin-border last:border-0">
      <td className="px-4 py-3 text-sm font-medium text-admin-ink">{order.orderNumber}</td>
      <td className="px-4 py-3 text-sm text-admin-ink-soft">{order.customerName}</td>
      <td className="px-4 py-3 text-sm text-admin-ink-faint">{order.itemCount}</td>
      <td className="px-4 py-3 text-sm text-admin-ink">{formatInr(order.total)}</td>
      <td className="px-4 py-3 text-xs text-admin-ink-faint">
        {PAYMENT_LABEL[order.paymentProvider ?? "cod"] ?? "—"}
        <span className={order.paymentStatus === "paid" ? "ml-1 text-admin-success" : "ml-1 text-admin-ink-faint"}>
          ({order.paymentStatus})
        </span>
      </td>
      <td className="px-4 py-3 text-xs text-admin-ink-faint">
        {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
      </td>
      <td className="px-4 py-3">
        <select
          defaultValue={order.status}
          disabled={isPending || !canManage}
          onChange={(e) => {
            const nextStatus = e.target.value as OrderStatus;
            startTransition(() => {
              updateOrderStatus(order.orderNumber, nextStatus);
            });
          }}
          className={`rounded-lg border border-admin-border bg-admin-surface px-2 py-1.5 text-xs font-medium uppercase disabled:opacity-50 ${statusToneClass[order.status]}`}
        >
          {ORDER_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </td>
    </tr>
  );
}

export function OrdersList({ orders, canManage }: { orders: AdminOrderRow[]; canManage: boolean }) {
  if (orders.length === 0) {
    return <p className="text-sm text-admin-ink-faint">No orders match this filter.</p>;
  }

  return (
    <AdminCard className="overflow-x-auto">
      <table className="w-full min-w-[760px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-admin-border bg-admin-bg text-left text-xs font-semibold uppercase tracking-wide text-admin-ink-faint">
            <th className="px-4 py-2.5">Order</th>
            <th className="px-4 py-2.5">Customer</th>
            <th className="px-4 py-2.5">Items</th>
            <th className="px-4 py-2.5">Total</th>
            <th className="px-4 py-2.5">Payment</th>
            <th className="px-4 py-2.5">Placed</th>
            <th className="px-4 py-2.5">Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <OrderRow key={order.orderNumber} order={order} canManage={canManage} />
          ))}
        </tbody>
      </table>
    </AdminCard>
  );
}
