import { connectToDatabase } from "@/lib/db/connect";
import { SiteSettingsModel } from "@/models/SiteSettings";

export type SiteLogo = { publicId: string; alt: string; width?: number; height?: number };

export async function getSiteLogo(): Promise<SiteLogo | null> {
  await connectToDatabase();
  const settings = await SiteSettingsModel.findOne({}, "logo").lean();
  if (!settings?.logo?.publicId) return null;
  return JSON.parse(JSON.stringify(settings.logo));
}
