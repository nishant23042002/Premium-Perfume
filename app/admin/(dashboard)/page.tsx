import type { Metadata } from "next";
import Link from "next/link";
import { ShoppingBag, IndianRupee, PackageX, Star, Mail, Clock } from "lucide-react";
import { getCurrentAdmin, hasPermission } from "@/lib/data/adminUsers";
import { getDashboardStats } from "@/lib/data/dashboard";
import { StatCard } from "@/components/admin/ui/StatCard";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { AdminCard } from "@/components/admin/ui/AdminCard";
import { formatInr } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard", robots: { index: false, follow: false } };

const STATUS_TONE: Record<string, string> = {
  pending: "text-admin-ink-faint",
  confirmed: "text-blue-600",
  processing: "text-admin-accent-dark",
  shipped: "text-indigo-600",
  delivered: "text-admin-success",
  cancelled: "text-admin-danger",
  refunded: "text-admin-danger",
};

export default async function AdminDashboardPage() {
  const admin = await getCurrentAdmin();
  const stats = await getDashboardStats();
  const canViewOrders = hasPermission(admin, "orders.view");

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${admin?.name.split(" ")[0]}`}
        description="Here's what's happening across the store today."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Orders Today" value={String(stats.ordersToday)} icon={ShoppingBag} tone="accent" />
        <StatCard label="Revenue Today" value={formatInr(stats.revenueToday)} icon={IndianRupee} tone="accent" />
        <StatCard
          label="Needs Fulfillment"
          value={String(stats.needsFulfillment)}
          icon={Clock}
          tone={stats.needsFulfillment > 0 ? "danger" : "neutral"}
          hint="Confirmed or processing"
        />
        <StatCard
          label="Low Stock"
          value={String(stats.lowStockCount)}
          icon={PackageX}
          tone={stats.lowStockCount > 0 ? "danger" : "neutral"}
          hint="5 units or fewer"
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard label="Orders This Week" value={String(stats.ordersThisWeek)} icon={ShoppingBag} />
        <StatCard label="Pending Reviews" value={String(stats.pendingReviews)} icon={Star} />
      </div>

      {canViewOrders && (
        <div className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-[0.06em] text-admin-ink-soft">
              Recent Orders
            </h2>
            <Link href="/admin/orders" className="text-sm font-medium text-admin-accent-dark hover:underline">
              View all
            </Link>
          </div>
          <AdminCard className="overflow-hidden">
            {stats.recentOrders.length === 0 ? (
              <p className="p-6 text-sm text-admin-ink-faint">No orders yet.</p>
            ) : (
              <table className="w-full border-collapse text-sm">
                <tbody>
                  {stats.recentOrders.map((order) => (
                    <tr key={order.orderNumber} className="border-b border-admin-border last:border-0">
                      <td className="px-5 py-3 font-medium text-admin-ink">{order.orderNumber}</td>
                      <td className="px-5 py-3 text-admin-ink-soft">{order.customerName}</td>
                      <td className="px-5 py-3 text-admin-ink">{formatInr(order.total)}</td>
                      <td className={`px-5 py-3 text-xs font-medium uppercase ${STATUS_TONE[order.status] ?? ""}`}>
                        {order.status}
                      </td>
                      <td className="px-5 py-3 text-right text-admin-ink-faint">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </AdminCard>
        </div>
      )}

      {stats.newContactMessages > 0 && hasPermission(admin, "contact.view") && (
        <Link
          href="/admin/contact"
          className="mt-6 flex items-center gap-3 rounded-xl border border-admin-border bg-admin-surface p-4 text-sm text-admin-ink-soft transition-colors hover:border-admin-accent-dark hover:text-admin-ink"
        >
          <Mail className="h-4 w-4 text-admin-accent-dark" />
          {stats.newContactMessages} contact message{stats.newContactMessages === 1 ? "" : "s"} on file
        </Link>
      )}
    </div>
  );
}
