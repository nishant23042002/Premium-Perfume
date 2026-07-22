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

export type AdminFaq = {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
};

export async function getAllFaqsForAdmin(): Promise<AdminFaq[]> {
  await connectToDatabase();
  const faqs = await FAQModel.find({}).sort({ order: 1 }).lean();
  return faqs.map((f) => ({
    id: String(f._id),
    question: f.question,
    answer: f.answer,
    category: f.category,
    order: f.order,
  }));
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
