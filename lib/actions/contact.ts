"use server";

import { connectToDatabase } from "@/lib/db/connect";
import { ContactMessageModel } from "@/models/ContactMessage";

export type ContactFormState = { error?: string; success?: boolean };

export async function submitContactMessage(
  _prevState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const subject = String(formData.get("subject") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!name) return { error: "Please enter your name." };
  if (!email) return { error: "Please enter your email address." };
  if (!message) return { error: "Please enter a message." };

  try {
    await connectToDatabase();
    await ContactMessageModel.create({
      name,
      email,
      phone: phone || undefined,
      subject: subject || undefined,
      message,
    });
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Couldn't send your message." };
  }
}
