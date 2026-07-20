import { connectToDatabase } from "@/lib/db/connect";
import { CategoryModel } from "@/models/Category";

export type NavCategory = {
  _id: string;
  name: string;
  slug: string;
};

export async function getNavCategories(): Promise<NavCategory[]> {
  await connectToDatabase();
  const categories = await CategoryModel.find({}, "name slug").sort({ order: 1 }).lean();
  return JSON.parse(JSON.stringify(categories));
}

export type CategoryDetail = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
};

export async function getCategoryBySlug(slug: string): Promise<CategoryDetail | null> {
  await connectToDatabase();
  const category = await CategoryModel.findOne({ slug }, "name slug description").lean();
  return category ? JSON.parse(JSON.stringify(category)) : null;
}
