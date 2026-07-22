"use server";

import { revalidatePath } from "next/cache";
import { verifyFirebaseIdToken } from "@/lib/firebase-admin";
import { findOrCreateUserByPhone } from "@/lib/data/users";
import { createSession, destroySession } from "@/lib/auth-session";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export type LoginState = { error?: string; success?: boolean };

// The OTP itself is sent client-side straight to Firebase, which enforces
// its own send-side quota — this limits how many times a given verification
// token can be exchanged for a session, as defense-in-depth against a leaked
// or replayed token.
const LOGIN_LIMIT = 10;
const LOGIN_WINDOW_MS = 10 * 60 * 1000;

export async function loginWithPhone(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const ip = await getClientIp();
  const rateLimit = checkRateLimit(`login:${ip}`, LOGIN_LIMIT, LOGIN_WINDOW_MS);
  if (!rateLimit.ok) {
    return { error: "Too many attempts. Please try again in a few minutes." };
  }

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
