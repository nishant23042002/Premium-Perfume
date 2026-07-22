"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/db/connect";
import { ReviewModel } from "@/models/Review";
import { getCurrentAdmin, hasPermission } from "@/lib/data/adminUsers";

async function canModerate(): Promise<boolean> {
  const admin = await getCurrentAdmin();
  return hasPermission(admin, "reviews.moderate");
}

function revalidate() {
  revalidatePath("/", "layout");
  revalidatePath("/admin/reviews");
}

export async function setReviewStatus(id: string, status: "approved" | "rejected"): Promise<void> {
  if (!(await canModerate())) return;
  await connectToDatabase();
  await ReviewModel.findByIdAndUpdate(id, { status });
  revalidate();
}

export async function deleteReview(id: string): Promise<void> {
  if (!(await canModerate())) return;
  await connectToDatabase();
  await ReviewModel.findByIdAndDelete(id);
  revalidate();
}
