import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

// Deliberately a separate cookie + secret from the customer session
// (lib/auth-session.ts) — a leaked or forged customer token can never be
// replayed as an admin token, and vice versa.
export const ADMIN_SESSION_COOKIE = "admin_session";
const THIRTY_DAYS = 60 * 60 * 24 * 30;

interface AdminSessionPayload {
  adminUserId: string;
}

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET is not set in .env.local.");
  }
  return secret;
}

/** Pure signature check — no `next/headers`, so it's also usable from
 * proxy.ts. Only proves *who* the caller is; role/permissions are always
 * looked up fresh from the database (see lib/data/adminUsers.ts). */
export function verifyAdminSessionToken(token: string): AdminSessionPayload | null {
  try {
    const decoded = jwt.verify(token, getSecret());
    if (typeof decoded === "string" || !("adminUserId" in decoded)) return null;
    return { adminUserId: decoded.adminUserId as string };
  } catch {
    return null;
  }
}

/** Mutates cookies — only callable from a Server Action or Route Handler. */
export async function createAdminSession(adminUserId: string): Promise<void> {
  const token = jwt.sign({ adminUserId } satisfies AdminSessionPayload, getSecret(), {
    expiresIn: THIRTY_DAYS,
  });

  const store = await cookies();
  store.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: THIRTY_DAYS,
    path: "/",
  });
}

/** Read-only — safe to call from Server Components and Server Actions. */
export async function getAdminSession(): Promise<AdminSessionPayload | null> {
  const store = await cookies();
  const token = store.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifyAdminSessionToken(token);
}

/** Mutates cookies — only callable from a Server Action or Route Handler. */
export async function destroyAdminSession(): Promise<void> {
  const store = await cookies();
  store.delete(ADMIN_SESSION_COOKIE);
}
