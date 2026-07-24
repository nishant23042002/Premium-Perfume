"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Price } from "@/components/ui/Price";
import { ProductImage } from "@/components/ui/ProductImage";
import { Button } from "@/components/ui/Button";
import { requestCancellation } from "@/lib/actions/checkout";
import { ORDER_STATUS_LABELS, CUSTOMER_CANCELLABLE_STATUSES, type OrderStatus } from "@/lib/order-status";
import type { AccountOrder } from "@/lib/data/orders";

const CANCEL_REASONS = [
  "Ordered by mistake",
  "Found a better price elsewhere",
  "Delivery is taking too long",
  "Changed my mind",
  "Other",
];

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function OrderRow({
  order,
  isOpen,
  onToggle,
}: {
  order: AccountOrder;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [reason, setReason] = useState(CANCEL_REASONS[0]);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();

  const canCancel = CUSTOMER_CANCELLABLE_STATUSES.includes(order.status as OrderStatus) && !submitted;

  function handleConfirmCancel() {
    setError(null);
    const fullReason = reason === "Other" ? note.trim() || "Other" : reason;
    startTransition(async () => {
      const result = await requestCancellation(order.orderNumber, fullReason);
      if (result.error) {
        setError(result.error);
      } else {
        setSubmitted(true);
        setShowCancelForm(false);
      }
    });
  }

  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full flex-wrap items-center justify-between gap-3 py-5 text-left font-sans text-sm hover:bg-ivory-2"
      >
        <div className="flex flex-col gap-1">
          <span className="font-semibold text-ink">#{order.orderNumber}</span>
          <span className="text-ink/50">
            {formatDate(order.createdAt)} · {order.itemCount} item{order.itemCount === 1 ? "" : "s"}
          </span>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-xs uppercase tracking-[0.1em] text-accent-dark">
            {ORDER_STATUS_LABELS[order.status as OrderStatus] ?? order.status}
          </span>
          <Price value={order.total} />
        </div>
      </button>

      {isOpen && (
        <div className="flex flex-col gap-4 pb-6 font-sans text-sm">
          <div className="flex flex-col gap-4 border border-ink/10 p-5">
            {order.items.map((item) => {
              const thumb = (
                <div className="relative h-14 w-12 shrink-0">
                  {item.image ? (
                    <ProductImage publicId={item.image} alt={item.name} className="h-full w-full" />
                  ) : (
                    <div className="h-full w-full bg-ivory-2" />
                  )}
                </div>
              );
              return (
                <div key={item.sku} className="flex items-center gap-3">
                  {item.slug ? (
                    <Link href={`/product/${item.slug}`} className="shrink-0">
                      {thumb}
                    </Link>
                  ) : (
                    thumb
                  )}
                  <div className="flex flex-1 items-center justify-between gap-3">
                    {item.slug ? (
                      <Link href={`/product/${item.slug}`} className="text-ink/70 hover:text-accent-dark">
                        {item.name} ({item.sizeMl}ml) × {item.quantity}
                      </Link>
                    ) : (
                      <span className="text-ink/70">
                        {item.name} ({item.sizeMl}ml) × {item.quantity}
                      </span>
                    )}
                    <Price value={item.price * item.quantity} />
                  </div>
                </div>
              );
            })}
            {order.discount > 0 && (
              <div className="flex justify-between border-t border-ink/10 pt-3 text-accent-dark">
                <span>Discount{order.couponCode ? ` (${order.couponCode})` : ""}</span>
                <span>
                  −<Price value={order.discount} className="inline-flex" />
                </span>
              </div>
            )}
            <div className="flex justify-between border-t border-ink/10 pt-3 font-semibold">
              <span>Total</span>
              <Price value={order.total} />
            </div>
          </div>

          <div className="flex flex-col gap-1 text-ink/70">
            <span className="font-semibold text-ink">Shipping to</span>
            <span>{order.shippingAddress.fullName}</span>
            <span>
              {order.shippingAddress.line1}
              {order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ""}
            </span>
            <span>
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}
            </span>
          </div>

          {order.status === "cancellation_requested" && (
            <div className="border border-accent-dark/30 bg-accent/10 p-4 text-xs text-ink/70">
              <p className="font-semibold text-ink">Cancellation requested</p>
              <p className="mt-1">
                We&apos;re reviewing your request. Once approved, your refund of{" "}
                <Price value={order.total} className="inline-flex" /> will be sent to your original payment
                method — you&apos;ll get an email when it&apos;s on its way.
              </p>
            </div>
          )}

          {(order.status === "cancelled" || submitted) && order.cancellation?.reason && (
            <p className="text-xs text-ink/50">Cancellation reason: {order.cancellation.reason}</p>
          )}

          {order.status === "refunded" && order.payment.refundedAt && (
            <p className="text-xs font-medium text-accent-dark">
              Refunded on {formatDate(order.payment.refundedAt)}
            </p>
          )}

          {submitted && order.status !== "cancellation_requested" && order.status !== "cancelled" && (
            <p className="text-xs text-accent-dark">Your cancellation request has been submitted.</p>
          )}

          {canCancel &&
            (showCancelForm ? (
              <div className="flex flex-col gap-3 border border-ink/10 p-4">
                <label className="flex flex-col gap-1.5">
                  <span className="font-sans text-xs font-semibold uppercase tracking-[0.1em] text-ink/50">
                    Reason for cancelling
                  </span>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    disabled={isPending}
                    className="h-10 border border-ink/20 bg-transparent px-3 font-sans text-sm text-ink focus:border-accent-dark focus:outline-none"
                  >
                    {CANCEL_REASONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </label>
                {reason === "Other" && (
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    disabled={isPending}
                    placeholder="Tell us more (optional)"
                    rows={2}
                    className="border border-ink/20 bg-transparent p-3 font-sans text-sm text-ink placeholder:text-ink/40 focus:border-accent-dark focus:outline-none"
                  />
                )}
                {error && <p className="text-xs text-secondary">{error}</p>}
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    loading={isPending}
                    disabled={isPending}
                    onClick={handleConfirmCancel}
                  >
                    Confirm Cancellation
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={isPending}
                    onClick={() => setShowCancelForm(false)}
                  >
                    Never Mind
                  </Button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowCancelForm(true)}
                className="w-fit font-sans text-xs font-semibold uppercase tracking-[0.1em] text-secondary hover:underline"
              >
                Cancel Order
              </button>
            ))}
        </div>
      )}
    </div>
  );
}

export function OrdersTab({ orders }: { orders: AccountOrder[] }) {
  const [expanded, setExpanded] = useState<string | null>(orders[0]?.orderNumber ?? null);

  if (orders.length === 0) {
    return (
      <p className="font-sans text-sm text-ink/50">
        You haven&apos;t placed any orders yet.{" "}
        <Link href="/perfumes" className="text-accent-dark underline underline-offset-4">
          Start shopping
        </Link>
        .
      </p>
    );
  }

  return (
    <div className="flex flex-col divide-y divide-ink/10 border-t border-ink/10">
      {orders.map((order) => (
        <OrderRow
          key={order.orderNumber}
          order={order}
          isOpen={expanded === order.orderNumber}
          onToggle={() => setExpanded(expanded === order.orderNumber ? null : order.orderNumber)}
        />
      ))}
    </div>
  );
}
