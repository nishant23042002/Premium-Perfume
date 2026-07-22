import type { Metadata } from "next";
import { getCurrentAdmin, hasPermission } from "@/lib/data/adminUsers";
import { getAllCoupons } from "@/lib/data/coupons";
import { CouponForm } from "@/components/admin/coupons/CouponForm";
import { CouponList } from "@/components/admin/coupons/CouponList";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { AdminCard } from "@/components/admin/ui/AdminCard";
import { NoAccess } from "@/components/admin/NoAccess";

export const metadata: Metadata = { title: "Coupons", robots: { index: false, follow: false } };

export default async function AdminCouponsPage() {
  const admin = await getCurrentAdmin();
  if (!hasPermission(admin, "coupons.manage")) return <NoAccess />;

  const coupons = await getAllCoupons();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Coupons" description="Discount codes redeemable at checkout." />

      <AdminCard className="p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-admin-ink-soft">
          Create Coupon
        </h2>
        <CouponForm />
      </AdminCard>

      <CouponList coupons={coupons} />
    </div>
  );
}
