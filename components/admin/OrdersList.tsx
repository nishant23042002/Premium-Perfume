"use client";

import { useState, useTransition } from "react";
import { updateOrderStatus, resolveCancellationRequest } from "@/lib/actions/orders";
import {
  ADMIN_SELECTABLE_STATUSES,
  ORDER_STATUS_LABELS,
  type AdminOrderRow,
  type OrderStatus,
} from "@/lib/order-status";
import { formatInr } from "@/lib/utils";
import { AdminCard } from "@/components/admin/ui/AdminCard";

const statusToneClass: Record<OrderStatus, string> = {
  pending: "text-admin-ink-faint",
  confirmed: "text-blue-600",
  processing: "text-admin-accent-dark",
  shipped: "text-indigo-600",
  delivered: "text-admin-success",
  cancellation_requested: "text-amber-600",
  cancelled: "text-admin-danger",
  refunded: "text-admin-danger",
};

const PAYMENT_LABEL: Record<string, string> = {
  cod: "COD",
  razorpay: "Razorpay",
  stripe: "Stripe",
};

/** Replaces the plain status dropdown for an order the customer has asked
 * to cancel — approving fires a real Razorpay refund (same confirm-dialog
 * safety as the generic dropdown's own "refunded" option), rejecting just
 * restores whatever status the order was in before the request. */
function CancellationRequestCell({ order, canManage }: { order: AdminOrderRow; canManage: boolean }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function resolve(decision: "approve" | "reject") {
    setError(null);
    if (decision === "approve" && order.paymentProvider === "razorpay") {
      const confirmed = window.confirm(
        `This will issue a real Razorpay refund of ${formatInr(order.total)} for order ${order.orderNumber}. This cannot be undone. Continue?`,
      );
      if (!confirmed) return;
    }
    startTransition(async () => {
      const result = await resolveCancellationRequest(order.orderNumber, decision);
      if (result.error) setError(result.error);
    });
  }

  return (
    <div className="flex flex-col gap-1.5">
      {order.cancellation?.reason && (
        <p className="max-w-[220px] text-xs text-admin-ink-faint">Reason: {order.cancellation.reason}</p>
      )}
      <div className="flex gap-1.5">
        <button
          type="button"
          disabled={isPending || !canManage}
          onClick={() => resolve("approve")}
          className="rounded-lg border border-admin-success bg-admin-success-bg px-2 py-1 text-xs font-medium text-admin-success disabled:opacity-50"
        >
          Approve &amp; Refund
        </button>
        <button
          type="button"
          disabled={isPending || !canManage}
          onClick={() => resolve("reject")}
          className="rounded-lg border border-admin-border px-2 py-1 text-xs font-medium text-admin-ink-soft disabled:opacity-50"
        >
          Reject
        </button>
      </div>
      {error && <p className="max-w-[220px] text-xs text-admin-danger">{error}</p>}
    </div>
  );
}

function OrderRow({ order, canManage }: { order: AdminOrderRow; canManage: boolean }) {
  // Controlled by the actual saved status, not just whatever the admin last
  // picked — a failed refund/update must visibly snap back to the real
  // status instead of leaving the dropdown showing something that never
  // actually happened server-side.
  const [status, setStatus] = useState(order.status);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleChange(nextStatus: OrderStatus) {
    setError(null);

    if (nextStatus === "refunded" && order.paymentProvider === "razorpay") {
      const confirmed = window.confirm(
        `This will issue a real Razorpay refund of ${formatInr(order.total)} for order ${order.orderNumber}. This cannot be undone from here. Continue?`,
      );
      if (!confirmed) return;
    }

    const previousStatus = status;
    setStatus(nextStatus);
    startTransition(async () => {
      const result = await updateOrderStatus(order.orderNumber, nextStatus);
      if (result.error) {
        setStatus(previousStatus);
        setError(result.error);
      }
    });
  }

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
        {order.status === "cancellation_requested" ? (
          <CancellationRequestCell order={order} canManage={canManage} />
        ) : (
          <>
            <select
              value={status}
              disabled={isPending || !canManage}
              onChange={(e) => handleChange(e.target.value as OrderStatus)}
              className={`rounded-lg border border-admin-border bg-admin-surface px-2 py-1.5 text-xs font-medium uppercase disabled:opacity-50 ${statusToneClass[status]}`}
            >
              {ADMIN_SELECTABLE_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {ORDER_STATUS_LABELS[s]}
                </option>
              ))}
            </select>
            {error && <p className="mt-1.5 max-w-[220px] text-xs text-admin-danger">{error}</p>}
          </>
        )}
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
            // Remounts (resetting the dropdown's local optimistic status)
            // only when an order crosses in or out of the
            // cancellation-request flow — not on every ordinary status
            // change, which needs to keep its own optimistic local state.
            <OrderRow
              key={`${order.orderNumber}-${order.status === "cancellation_requested" ? "cr" : "normal"}`}
              order={order}
              canManage={canManage}
            />
          ))}
        </tbody>
      </table>
    </AdminCard>
  );
}
