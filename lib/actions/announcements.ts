"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/db/connect";
import { AnnouncementModel } from "@/models/Announcement";
import { getCurrentAdmin, hasPermission } from "@/lib/data/adminUsers";

export type AnnouncementFormState = { error?: string; success?: string };

async function canManage(): Promise<boolean> {
  const admin = await getCurrentAdmin();
  return hasPermission(admin, "announcements.manage");
}

function revalidate() {
  revalidatePath("/", "layout");
  revalidatePath("/admin/announcements");
}

export async function createAnnouncement(
  _prevState: AnnouncementFormState,
  formData: FormData,
): Promise<AnnouncementFormState> {
  if (!(await canManage())) return { error: "You don't have permission to manage announcements." };

  const text = String(formData.get("text") ?? "").trim();
  const link = String(formData.get("link") ?? "").trim();
  const orderRaw = Number(formData.get("order"));

  if (!text) return { error: "Announcement text is required." };

  await connectToDatabase();
  await AnnouncementModel.create({
    text,
    link: link || undefined,
    isActive: true,
    order: Number.isFinite(orderRaw) ? orderRaw : 0,
  });

  revalidate();
  return { success: "Announcement added." };
}

export async function toggleAnnouncementActive(id: string, isActive: boolean): Promise<void> {
  if (!(await canManage())) return;
  await connectToDatabase();
  await AnnouncementModel.findByIdAndUpdate(id, { isActive });
  revalidate();
}

export async function deleteAnnouncement(id: string): Promise<void> {
  if (!(await canManage())) return;
  await connectToDatabase();
  await AnnouncementModel.findByIdAndDelete(id);
  revalidate();
}
