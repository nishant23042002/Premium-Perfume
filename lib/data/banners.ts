import { connectToDatabase } from "@/lib/db/connect";
import { BannerModel } from "@/models/Banner";

export type ActiveBanner = {
  _id: string;
  title?: string;
  subtitle?: string;
  image: { publicId: string; alt: string };
  linkHref?: string;
};

export async function getActiveBanner(placement: string): Promise<ActiveBanner | null> {
  await connectToDatabase();
  const banner = await BannerModel.findOne({ placement, isActive: true })
    .sort({ order: 1, createdAt: -1 })
    .lean();
  return banner ? JSON.parse(JSON.stringify(banner)) : null;
}

export type AdminBanner = {
  _id: string;
  title?: string;
  subtitle?: string;
  image: { publicId: string; alt: string };
  placement: string;
  isActive: boolean;
  createdAt: string;
};

export async function getAllBanners(): Promise<AdminBanner[]> {
  await connectToDatabase();
  const banners = await BannerModel.find({}).sort({ createdAt: -1 }).lean();
  return JSON.parse(JSON.stringify(banners));
}
