import { connectToDatabase } from "@/lib/db/connect";
import { CategoryShowcaseModel } from "@/models/CategoryShowcase";

export type CategoryShowcaseCard = {
  _id: string;
  title: string;
  linkHref: string;
  image: { publicId: string; alt: string };
};

export async function getActiveCategoryShowcase(): Promise<CategoryShowcaseCard[]> {
  await connectToDatabase();
  const cards = await CategoryShowcaseModel.find({ isActive: true }).sort({ order: 1, createdAt: 1 }).lean();
  return JSON.parse(JSON.stringify(cards));
}

export type AdminCategoryShowcaseCard = {
  _id: string;
  title: string;
  linkHref: string;
  image: { publicId: string; alt: string };
  isActive: boolean;
  order: number;
};

export async function getAllCategoryShowcase(): Promise<AdminCategoryShowcaseCard[]> {
  await connectToDatabase();
  const cards = await CategoryShowcaseModel.find({}).sort({ order: 1, createdAt: 1 }).lean();
  return JSON.parse(JSON.stringify(cards));
}
