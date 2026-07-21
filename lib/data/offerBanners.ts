import { connectToDatabase } from "@/lib/db/connect";
import { OfferBannerModel } from "@/models/OfferBanner";

export type ActiveOfferBanner = {
  _id: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  linkHref?: string;
  image: { publicId: string; alt: string };
};

export async function getActiveOfferBanners(): Promise<ActiveOfferBanner[]> {
  await connectToDatabase();
  const banners = await OfferBannerModel.find({ isActive: true }).sort({ order: 1, createdAt: 1 }).lean();
  return JSON.parse(JSON.stringify(banners));
}

export type AdminOfferBanner = {
  _id: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  linkHref?: string;
  image: { publicId: string; alt: string };
  isActive: boolean;
  order: number;
};

export async function getAllOfferBanners(): Promise<AdminOfferBanner[]> {
  await connectToDatabase();
  const banners = await OfferBannerModel.find({}).sort({ order: 1, createdAt: 1 }).lean();
  return JSON.parse(JSON.stringify(banners));
}
