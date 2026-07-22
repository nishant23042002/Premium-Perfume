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

export type AdminReview = {
  id: string;
  productId: string;
  productName: string;
  name: string;
  rating: number;
  title?: string;
  body: string;
  isVerifiedPurchase: boolean;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
};

export async function getAllReviewsForAdmin(status?: "pending" | "approved" | "rejected"): Promise<AdminReview[]> {
  await connectToDatabase();
  const reviews = await ReviewModel.find(status ? { status } : {})
    .sort({ createdAt: -1 })
    .populate("productId", "name")
    .lean();

  return reviews.map((r) => {
    const product = r.productId as unknown as { _id: unknown; name?: string } | null;
    return {
      id: String(r._id),
      productId: product ? String(product._id) : "",
      productName: product?.name ?? "Unknown product",
      name: r.name,
      rating: r.rating,
      title: r.title,
      body: r.body,
      isVerifiedPurchase: r.isVerifiedPurchase,
      status: r.status,
      createdAt: r.createdAt.toISOString(),
    };
  });
}

export type ProductReview = FeaturedReview;

export async function getProductReviews(productId: string, limit = 10): Promise<ProductReview[]> {
  await connectToDatabase();
  const reviews = await ReviewModel.find(
    { productId, status: "approved" },
    "name rating title body isVerifiedPurchase",
  )
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
  return JSON.parse(JSON.stringify(reviews));
}
