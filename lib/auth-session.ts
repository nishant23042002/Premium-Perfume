import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export const SESSION_COOKIE = "vellora_session";
const THIRTY_DAYS = 60 * 60 * 24 * 30;

interface SessionPayload {
  userId: string;
}

function getSecret(): string {
  const secret = process.env.AUTH_SESSION_SECRET;
  if (!secret) {
    throw new Error("AUTH_SESSION_SECRET is not set in .env.local.");
  }
  return secret;
}

/** Pure signature check — no `next/headers`. Only proves *who* the customer
 * is; carries no role/permission claims. The admin panel is gated entirely
 * separately — see lib/admin-session.ts and proxy.ts. */
export function verifySessionToken(token: string): SessionPayload | null {
  try {
    const decoded = jwt.verify(token, getSecret());
    if (typeof decoded === "string" || !("userId" in decoded)) return null;
    return { userId: decoded.userId as string };
  } catch {
    return null;
  }
}

/** Mutates cookies — only callable from a Server Action or Route Handler. */
export async function createSession(userId: string): Promise<void> {
  const token = jwt.sign({ userId } satisfies SessionPayload, getSecret(), {
    expiresIn: THIRTY_DAYS,
  });

  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: THIRTY_DAYS,
    path: "/",
  });
}

/** Read-only — safe to call from Server Components and Server Actions. */
export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

/** Mutates cookies — only callable from a Server Action or Route Handler. */
export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
