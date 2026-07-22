"use client";

import { useTransition } from "react";
import { toggleCouponActive, deleteCoupon } from "@/lib/actions/coupons";
import type { AdminCoupon } from "@/lib/data/coupons";
import { AdminCard } from "@/components/admin/ui/AdminCard";

function formatValue(coupon: AdminCoupon): string {
  return coupon.type === "percentage" ? `${coupon.value}%` : `₹${coupon.value}`;
}

function Row({ coupon }: { coupon: AdminCoupon }) {
  const [isPending, startTransition] = useTransition();

  return (
    <tr className="border-b border-admin-border last:border-0">
      <td className="px-4 py-3 text-sm font-medium text-admin-ink">{coupon.code}</td>
      <td className="px-4 py-3 text-sm text-admin-ink-soft">{formatValue(coupon)}</td>
      <td className="px-4 py-3 text-xs text-admin-ink-faint">
        {coupon.minOrderValue ? `₹${coupon.minOrderValue}+` : "No minimum"}
        {coupon.maxDiscount ? ` · capped ₹${coupon.maxDiscount}` : ""}
      </td>
      <td className="px-4 py-3 text-xs text-admin-ink-faint">
        {coupon.usedCount}
        {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ""}
        {coupon.isExhausted && <span className="ml-1 text-admin-danger">(exhausted)</span>}
      </td>
      <td className="px-4 py-3 text-xs text-admin-ink-faint">
        {coupon.expiresAt
          ? new Date(coupon.expiresAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
          : "Never"}
        {coupon.isExpired && <span className="ml-1 text-admin-danger">(expired)</span>}
      </td>
      <td className="px-4 py-3">
        <div className="flex gap-2">
          <button
            type="button"
            disabled={isPending}
            onClick={() => startTransition(() => toggleCouponActive(coupon.id, !coupon.isActive))}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium uppercase disabled:opacity-50 ${
              coupon.isActive
                ? "border-admin-success-bg bg-admin-success-bg text-admin-success"
                : "border-admin-border text-admin-ink-faint"
            }`}
          >
            {coupon.isActive ? "Active" : "Disabled"}
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => startTransition(() => deleteCoupon(coupon.id))}
            className="rounded-lg border border-admin-danger-bg px-3 py-1.5 text-xs font-medium uppercase text-admin-danger disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}

export function CouponList({ coupons }: { coupons: AdminCoupon[] }) {
  if (coupons.length === 0) {
    return <p className="text-sm text-admin-ink-faint">No coupons yet.</p>;
  }

  return (
    <AdminCard className="overflow-x-auto">
      <table className="w-full min-w-[760px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-admin-border bg-admin-bg text-left text-xs font-semibold uppercase tracking-wide text-admin-ink-faint">
            <th className="px-4 py-2.5">Code</th>
            <th className="px-4 py-2.5">Discount</th>
            <th className="px-4 py-2.5">Conditions</th>
            <th className="px-4 py-2.5">Usage</th>
            <th className="px-4 py-2.5">Expires</th>
            <th className="px-4 py-2.5">Status</th>
          </tr>
        </thead>
        <tbody>
          {coupons.map((coupon) => (
            <Row key={coupon.id} coupon={coupon} />
          ))}
        </tbody>
      </table>
    </AdminCard>
  );
}
