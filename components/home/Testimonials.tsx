import { Badge } from "@/components/ui/Badge";
import { Container } from "@/components/ui/Container";
import { Rating } from "@/components/ui/Rating";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getFeaturedReviews } from "@/lib/data/reviews";

export async function Testimonials() {
  const reviews = await getFeaturedReviews(6);
  if (reviews.length === 0) return null;

  return (
    <Section tone="ivory-2">
      <Container className="flex px-3 flex-col gap-10">
        <SectionHeading eyebrow="Customer Love" title="What people are saying" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => (
            <div key={review._id} className="flex flex-col gap-3 bg-ivory p-6">
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
      </Container>
    </Section>
  );
}
