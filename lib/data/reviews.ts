import { connectToDatabase } from "@/lib/db/connect";
import { ReviewModel } from "@/models/Review";

export type FeaturedReview = {
  _id: string;
  name: string;
  rating: number;
  title?: string;
  body: string;
  isVerifiedPurchase: boolean;
};

export async function getFeaturedReviews(limit = 6): Promise<FeaturedReview[]> {
  await connectToDatabase();
  const reviews = await ReviewModel.find(
    { status: "approved" },
    "name rating title body isVerifiedPurchase",
  )
    .sort({ rating: -1, createdAt: -1 })
    .limit(limit)
    .lean();
  return JSON.parse(JSON.stringify(reviews));
}
