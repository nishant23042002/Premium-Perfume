"use client";

import { useState } from "react";
import Link from "next/link";
import { Price } from "@/components/ui/Price";
import { ProductImage } from "@/components/ui/ProductImage";
import type { AccountOrder } from "@/lib/data/orders";

const statusLabel: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

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
      {orders.map((order) => {
        const isOpen = expanded === order.orderNumber;
        return (
          <div key={order.orderNumber}>
            <button
              type="button"
              onClick={() => setExpanded(isOpen ? null : order.orderNumber)}
              className="flex w-full flex-wrap items-center justify-between gap-3 py-5 text-left font-sans text-sm hover:bg-ivory-2"
            >
              <div className="flex flex-col gap-1">
                <span className="font-semibold text-ink">#{order.orderNumber}</span>
                <span className="text-ink/50">
                  {new Date(order.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}{" "}
                  · {order.itemCount} item{order.itemCount === 1 ? "" : "s"}
                </span>
              </div>
              <div className="flex items-center gap-6">
                <span className="text-xs uppercase tracking-[0.1em] text-accent-dark">
                  {statusLabel[order.status] ?? order.status}
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
                            <Link
                              href={`/product/${item.slug}`}
                              className="text-ink/70 hover:text-accent-dark"
                            >
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
                    {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                    {order.shippingAddress.pincode}
                  </span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
