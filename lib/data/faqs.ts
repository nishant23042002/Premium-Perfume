import { connectToDatabase } from "@/lib/db/connect";
import { FAQModel } from "@/models/FAQ";

export type FaqItem = {
  _id: string;
  question: string;
  answer: string;
  category: string;
};

export async function getFaqs(): Promise<FaqItem[]> {
  await connectToDatabase();
  const faqs = await FAQModel.find({}, "question answer category").sort({ order: 1 }).lean();
  return JSON.parse(JSON.stringify(faqs));
}

export async function getFaqsForProduct(productId: string): Promise<FaqItem[]> {
  await connectToDatabase();
  const faqs = await FAQModel.find(
    { $or: [{ productId }, { category: "product", productId: { $exists: false } }] },
    "question answer category",
  )
    .sort({ order: 1 })
    .lean();
  return JSON.parse(JSON.stringify(faqs));
}
