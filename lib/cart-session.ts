import { cookies } from "next/headers";

const CART_COOKIE = "cart_session_id";
const THIRTY_DAYS = 60 * 60 * 24 * 30;

/** Read-only — safe to call from Server Components and Server Actions. */
export async function getCartSessionId(): Promise<string | null> {
  const store = await cookies();
  return store.get(CART_COOKIE)?.value ?? null;
}

/** Mutates cookies — only callable from a Server Action or Route Handler. */
export async function getOrCreateCartSessionId(): Promise<string> {
  const store = await cookies();
  const existing = store.get(CART_COOKIE)?.value;
  if (existing) return existing;

  const sessionId = crypto.randomUUID();
  store.set(CART_COOKIE, sessionId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: THIRTY_DAYS,
    path: "/",
  });
  return sessionId;
}
