"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/db/connect";
import { FAQModel } from "@/models/FAQ";
import { getCurrentAdmin, hasPermission } from "@/lib/data/adminUsers";

export type FaqFormState = { error?: string; success?: string };

async function canManage(): Promise<boolean> {
  const admin = await getCurrentAdmin();
  return hasPermission(admin, "faq.manage");
}

function revalidate() {
  revalidatePath("/faq");
  revalidatePath("/admin/faq");
}

export async function createFaq(_prevState: FaqFormState, formData: FormData): Promise<FaqFormState> {
  if (!(await canManage())) return { error: "You don't have permission to manage FAQs." };

  const question = String(formData.get("question") ?? "").trim();
  const answer = String(formData.get("answer") ?? "").trim();
  const category = String(formData.get("category") ?? "general");
  const orderRaw = Number(formData.get("order"));

  if (!question) return { error: "Question is required." };
  if (!answer) return { error: "Answer is required." };

  await connectToDatabase();
  await FAQModel.create({
    question,
    answer,
    category,
    order: Number.isFinite(orderRaw) ? orderRaw : 0,
  });

  revalidate();
  return { success: "FAQ added." };
}

export async function deleteFaq(id: string): Promise<void> {
  if (!(await canManage())) return;
  await connectToDatabase();
  await FAQModel.findByIdAndDelete(id);
  revalidate();
}
