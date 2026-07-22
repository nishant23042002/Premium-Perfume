"use client";

import { useTransition } from "react";
import { setReviewStatus, deleteReview } from "@/lib/actions/reviews";
import type { AdminReview } from "@/lib/data/reviews";
import { AdminCard } from "@/components/admin/ui/AdminCard";

const STATUS_TONE: Record<string, string> = {
  pending: "text-admin-ink-faint",
  approved: "text-admin-success",
  rejected: "text-admin-danger",
};

function Row({ review }: { review: AdminReview }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-col gap-2 border-b border-admin-border p-4 last:border-0">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-admin-ink">
            {review.name}{" "}
            <span className="text-admin-ink-faint">on {review.productName}</span>
          </p>
          <p className="text-xs text-admin-accent-dark">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</p>
        </div>
        <span className={`text-xs font-medium uppercase ${STATUS_TONE[review.status]}`}>{review.status}</span>
      </div>
      {review.title && <p className="text-sm font-medium text-admin-ink">{review.title}</p>}
      <p className="text-sm text-admin-ink-soft">{review.body}</p>
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          disabled={isPending || review.status === "approved"}
          onClick={() => startTransition(() => setReviewStatus(review.id, "approved"))}
          className="rounded-lg border border-admin-success-bg bg-admin-success-bg px-3 py-1.5 text-xs font-medium uppercase text-admin-success disabled:opacity-50"
        >
          Approve
        </button>
        <button
          type="button"
          disabled={isPending || review.status === "rejected"}
          onClick={() => startTransition(() => setReviewStatus(review.id, "rejected"))}
          className="rounded-lg border border-admin-border px-3 py-1.5 text-xs font-medium uppercase text-admin-ink-soft disabled:opacity-50"
        >
          Reject
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => startTransition(() => deleteReview(review.id))}
          className="rounded-lg border border-admin-danger-bg px-3 py-1.5 text-xs font-medium uppercase text-admin-danger disabled:opacity-50"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export function ReviewModerationList({ reviews }: { reviews: AdminReview[] }) {
  if (reviews.length === 0) {
    return <p className="text-sm text-admin-ink-faint">No reviews match this filter.</p>;
  }

  return (
    <AdminCard>
      {reviews.map((review) => (
        <Row key={review.id} review={review} />
      ))}
    </AdminCard>
  );
}
