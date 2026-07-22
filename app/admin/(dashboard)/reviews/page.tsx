import type { Metadata } from "next";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getCurrentAdmin, hasPermission } from "@/lib/data/adminUsers";
import { getAllReviewsForAdmin } from "@/lib/data/reviews";
import { ReviewModerationList } from "@/components/admin/reviews/ReviewModerationList";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { NoAccess } from "@/components/admin/NoAccess";

export const metadata: Metadata = { title: "Reviews", robots: { index: false, follow: false } };

const STATUSES = ["pending", "approved", "rejected"] as const;
type ReviewStatus = (typeof STATUSES)[number];

function isReviewStatus(value: string | undefined): value is ReviewStatus {
  return STATUSES.includes(value as ReviewStatus);
}

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const admin = await getCurrentAdmin();
  if (!hasPermission(admin, "reviews.moderate")) return <NoAccess />;

  const { status } = await searchParams;
  const statusFilter = isReviewStatus(status) ? status : "pending";

  const reviews = await getAllReviewsForAdmin(statusFilter);

  return (
    <div>
      <PageHeader title="Reviews" description="Moderate customer reviews before they go live." />

      <div className="mb-4 flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/reviews?status=${s}`}
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

      <ReviewModerationList reviews={reviews} />
    </div>
  );
}
