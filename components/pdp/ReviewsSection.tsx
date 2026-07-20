import { Badge } from "@/components/ui/Badge";
import { Rating } from "@/components/ui/Rating";
import { getProductReviews } from "@/lib/data/reviews";

export async function ReviewsSection({
  productId,
  rating,
}: {
  productId: string;
  rating: { average: number; count: number };
}) {
  const reviews = await getProductReviews(productId);

  return (
    <div id="reviews" className="flex flex-col gap-8 scroll-mt-24">
      <div className="flex items-center gap-3">
        <Rating value={rating.average} count={rating.count} />
        {rating.count > 0 && (
          <span className="font-sans text-sm text-ink/60">{rating.average.toFixed(1)} out of 5</span>
        )}
      </div>

      {reviews.length === 0 ? (
        <p className="font-sans text-sm text-ink/50">
          No reviews yet — be the first to share your experience.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {reviews.map((review) => (
            <div key={review._id} className="flex flex-col gap-3 border border-ink/10 p-6">
              <Rating value={review.rating} />
              {review.title && (
                <h3 className="font-sans text-sm font-semibold text-ink">{review.title}</h3>
              )}
              <p className="font-sans text-sm text-ink/70">{review.body}</p>
              <div className="mt-auto flex items-center gap-2 pt-2">
                <span className="font-sans text-xs font-medium text-ink/80">{review.name}</span>
                {review.isVerifiedPurchase && (
                  <Badge tone="accent" className="text-[9px]">
                    Verified Purchase
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
