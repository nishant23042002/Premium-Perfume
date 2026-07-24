import { cache } from "react";
import { connectToDatabase } from "@/lib/db/connect";
import { CollectionModel } from "@/models/Collection";

export type CollectionDetail = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  productIds: string[];
};

// Wrapped in `cache()` — the collection page's generateMetadata and the
// page component both need this by slug.
export const getCollectionBySlug = cache(async (slug: string): Promise<CollectionDetail | null> => {
  await connectToDatabase();
  const collection = await CollectionModel.findOne(
    { slug },
    "name slug description productIds",
  ).lean();
  return collection ? JSON.parse(JSON.stringify(collection)) : null;
});

export type AdminCollection = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: { publicId: string; alt?: string };
  productCount: number;
  isFeatured: boolean;
};

export async function getAllCollectionsForAdmin(): Promise<AdminCollection[]> {
  await connectToDatabase();
  const collections = await CollectionModel.find({}).sort({ createdAt: -1 }).lean();
  return collections.map((c) => ({
    id: String(c._id),
    name: c.name,
    slug: c.slug,
    description: c.description,
    image: c.image?.publicId ? { publicId: c.image.publicId, alt: c.image.alt } : undefined,
    productCount: c.productIds?.length ?? 0,
    isFeatured: c.isFeatured,
  }));
}
