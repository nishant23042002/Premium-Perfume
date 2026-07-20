import { connectToDatabase } from "@/lib/db/connect";
import { AnnouncementModel } from "@/models/Announcement";

export type ActiveAnnouncement = {
  _id: string;
  text: string;
  link?: string;
};

export async function getActiveAnnouncement(): Promise<ActiveAnnouncement | null> {
  await connectToDatabase();
  const now = new Date();
  const announcement = await AnnouncementModel.findOne({
    isActive: true,
    $and: [
      { $or: [{ startsAt: { $exists: false } }, { startsAt: null }, { startsAt: { $lte: now } }] },
      { $or: [{ endsAt: { $exists: false } }, { endsAt: null }, { endsAt: { $gte: now } }] },
    ],
  })
    .sort({ order: 1 })
    .lean();

  return announcement ? JSON.parse(JSON.stringify(announcement)) : null;
}
