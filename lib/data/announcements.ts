import { connectToDatabase } from "@/lib/db/connect";
import { AnnouncementModel } from "@/models/Announcement";

export type ActiveAnnouncement = {
  _id: string;
  text: string;
  link?: string;
};

export type AdminAnnouncement = {
  id: string;
  text: string;
  link?: string;
  isActive: boolean;
  startsAt?: string;
  endsAt?: string;
  order: number;
};

export async function getAllAnnouncements(): Promise<AdminAnnouncement[]> {
  await connectToDatabase();
  const announcements = await AnnouncementModel.find({}).sort({ order: 1 }).lean();
  return announcements.map((a) => ({
    id: String(a._id),
    text: a.text,
    link: a.link,
    isActive: a.isActive,
    startsAt: a.startsAt?.toISOString(),
    endsAt: a.endsAt?.toISOString(),
    order: a.order,
  }));
}

export async function getActiveAnnouncements(): Promise<ActiveAnnouncement[]> {
  await connectToDatabase();
  const now = new Date();
  const announcements = await AnnouncementModel.find({
    isActive: true,
    $and: [
      { $or: [{ startsAt: { $exists: false } }, { startsAt: null }, { startsAt: { $lte: now } }] },
      { $or: [{ endsAt: { $exists: false } }, { endsAt: null }, { endsAt: { $gte: now } }] },
    ],
  })
    .sort({ order: 1 })
    .lean();

  return JSON.parse(JSON.stringify(announcements));
}
