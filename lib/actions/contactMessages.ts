"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/db/connect";
import { ContactMessageModel } from "@/models/ContactMessage";
import { getCurrentAdmin, hasPermission } from "@/lib/data/adminUsers";

export async function markContactMessageRead(id: string): Promise<void> {
  const admin = await getCurrentAdmin();
  if (!hasPermission(admin, "contact.view")) return;

  await connectToDatabase();
  await ContactMessageModel.findByIdAndUpdate(id, { status: "read" });
  revalidatePath("/admin/contact");
}
