"use server";

import { revalidatePath } from "next/cache";
import { verifyFirebaseIdToken } from "@/lib/firebase-admin";
import { findOrCreateUserByPhone } from "@/lib/data/users";
import { createSession, destroySession } from "@/lib/auth-session";

export type LoginState = { error?: string; success?: boolean };

export async function loginWithPhone(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const idToken = String(formData.get("idToken") ?? "");
  if (!idToken) return { error: "Missing verification token." };

  try {
    const decoded = await verifyFirebaseIdToken(idToken);
    const phone = decoded.phone_number;
    if (!phone) return { error: "No phone number found on this verification." };

    const user = await findOrCreateUserByPhone(phone, decoded.uid);
    await createSession(user.id);

    revalidatePath("/", "layout");
    return { success: true };
  } catch {
    return { error: "Could not verify that code. Please try again." };
  }
}

export async function logout(): Promise<void> {
  await destroySession();
  revalidatePath("/", "layout");
}
