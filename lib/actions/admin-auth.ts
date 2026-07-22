"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { connectToDatabase } from "@/lib/db/connect";
import { AdminUserModel } from "@/models/AdminUser";
import { createAdminSession, destroyAdminSession } from "@/lib/admin-session";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export type AdminLoginState = { error?: string };

const LOGIN_LIMIT = 5;
const LOGIN_WINDOW_MS = 10 * 60 * 1000;

export async function loginAdmin(
  _prevState: AdminLoginState,
  formData: FormData,
): Promise<AdminLoginState> {
  const ip = await getClientIp();
  const rateLimit = checkRateLimit(`admin-login:${ip}`, LOGIN_LIMIT, LOGIN_WINDOW_MS);
  if (!rateLimit.ok) {
    return { error: "Too many attempts. Please try again in a few minutes." };
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Enter your email and password." };

  await connectToDatabase();
  const admin = await AdminUserModel.findOne({ email });

  // Same generic message whether the account doesn't exist, is deactivated,
  // or the password is wrong — never confirm which emails have accounts.
  if (!admin || !admin.isActive || !(await bcrypt.compare(password, admin.passwordHash))) {
    return { error: "Invalid email or password." };
  }

  await createAdminSession(String(admin._id));
  redirect("/admin");
}

export async function logoutAdmin(): Promise<void> {
  await destroyAdminSession();
  redirect("/admin/login");
}
