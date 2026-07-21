import { connectToDatabase } from "@/lib/db/connect";
import { BannerModel } from "@/models/Banner";

export type ActiveBanner = {
  _id: string;
  title?: string;
  subtitle?: string;
  image: { publicId: string; alt: string };
  mobileImage?: { publicId: string; alt: string };
  linkHref?: string;
};

export async function getActiveBanners(placement: string): Promise<ActiveBanner[]> {
  await connectToDatabase();
  const banners = await BannerModel.find({ placement, isActive: true })
    .sort({ order: 1, createdAt: -1 })
    .lean();
  return JSON.parse(JSON.stringify(banners));
}

export type AdminBanner = {
  _id: string;
  title?: string;
  subtitle?: string;
  image: { publicId: string; alt: string };
  mobileImage?: { publicId: string; alt: string };
  placement: string;
  isActive: boolean;
  order: number;
  createdAt: string;
};

export async function getAllBanners(): Promise<AdminBanner[]> {
  await connectToDatabase();
  const banners = await BannerModel.find({}).sort({ order: 1, createdAt: -1 }).lean();
  return JSON.parse(JSON.stringify(banners));
}
