import type { Metadata } from "next";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getCurrentAdmin, hasPermission } from "@/lib/data/adminUsers";
import { getOrdersForAdmin, ORDER_STATUSES, type OrderStatus } from "@/lib/data/orders";
import { OrdersList } from "@/components/admin/OrdersList";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { NoAccess } from "@/components/admin/NoAccess";

export const metadata: Metadata = { title: "Orders", robots: { index: false, follow: false } };

function isOrderStatus(value: string | undefined): value is OrderStatus {
  return ORDER_STATUSES.includes(value as OrderStatus);
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const admin = await getCurrentAdmin();
  if (!hasPermission(admin, "orders.view")) return <NoAccess />;

  const { status, page: pageParam } = await searchParams;
  const statusFilter = isOrderStatus(status) ? status : undefined;
  const page = Number(pageParam) || 1;

  const result = await getOrdersForAdmin({ status: statusFilter, page });
  const canManage = hasPermission(admin, "orders.manage");

  return (
    <div>
      <PageHeader title="Orders" description="Fulfillment, status, and payment tracking." />

      <div className="mb-4 flex flex-wrap gap-2">
        <Link
          href="/admin/orders"
          className={cn(
            "rounded-lg border px-3 py-1.5 text-xs font-medium uppercase tracking-wide",
            !statusFilter
              ? "border-admin-ink bg-admin-ink text-admin-surface"
              : "border-admin-border text-admin-ink-soft hover:bg-admin-surface",
          )}
        >
          All
        </Link>
        {ORDER_STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/orders?status=${s}`}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-xs font-medium uppercase tracking-wide",
              statusFilter === s
                ? "border-admin-ink bg-admin-ink text-admin-surface"
                : "border-admin-border text-admin-ink-soft hover:bg-admin-surface",
            )}
          >
            {s}
          </Link>
        ))}
      </div>

      <OrdersList orders={result.orders} canManage={canManage} />

      {result.totalPages > 1 && (
        <div className="mt-4 flex items-center gap-2">
          {Array.from({ length: result.totalPages }, (_, i) => i + 1).map((pageNum) => (
            <Link
              key={pageNum}
              href={`/admin/orders?${statusFilter ? `status=${statusFilter}&` : ""}page=${pageNum}`}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-xs font-medium",
                pageNum === result.page
                  ? "border-admin-ink bg-admin-ink text-admin-surface"
                  : "border-admin-border text-admin-ink-soft hover:bg-admin-surface",
              )}
            >
              {pageNum}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
