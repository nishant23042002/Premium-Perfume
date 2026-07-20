import { connectToDatabase } from "@/lib/db/connect";
import { CollectionModel } from "@/models/Collection";

export type CollectionDetail = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  productIds: string[];
};

export async function getCollectionBySlug(slug: string): Promise<CollectionDetail | null> {
  await connectToDatabase();
  const collection = await CollectionModel.findOne(
    { slug },
    "name slug description productIds",
  ).lean();
  return collection ? JSON.parse(JSON.stringify(collection)) : null;
}
