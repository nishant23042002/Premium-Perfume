"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/db/connect";
import { AdminUserModel, ADMIN_ROLES, type AdminRole } from "@/models/AdminUser";
import { getCurrentAdmin, hasPermission } from "@/lib/data/adminUsers";
import { setRolePermissions } from "@/lib/data/rolePermissions";
import { isValidPermission, type Permission } from "@/lib/rbac";

export type TeamActionState = { error?: string; success?: string };

async function requireTeamManage(): Promise<{ ok: true } | { ok: false; error: string }> {
  const admin = await getCurrentAdmin();
  if (!hasPermission(admin, "team.manage")) return { ok: false, error: "You don't have permission to manage the team." };
  return { ok: true };
}

function isAdminRole(value: string): value is AdminRole {
  return (ADMIN_ROLES as readonly string[]).includes(value);
}

export async function createAdminAccount(
  _prevState: TeamActionState,
  formData: FormData,
): Promise<TeamActionState> {
  const guard = await requireTeamManage();
  if (!guard.ok) return { error: guard.error };

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const role = String(formData.get("role") ?? "");

  if (!name || !email || !password) return { error: "Fill in name, email, and password." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };
  if (!isAdminRole(role)) return { error: "Choose a valid role." };

  await connectToDatabase();

  const existing = await AdminUserModel.findOne({ email });
  if (existing) return { error: "An account with that email already exists." };

  const passwordHash = await bcrypt.hash(password, 12);
  await AdminUserModel.create({ name, email, passwordHash, role, isActive: true });

  revalidatePath("/admin/team");
  return { success: `Account created for ${email}.` };
}

async function countActiveOwners(excludingId?: string): Promise<number> {
  return AdminUserModel.countDocuments({
    role: "owner",
    isActive: true,
    ...(excludingId ? { _id: { $ne: excludingId } } : {}),
  });
}

export async function updateAdminRole(adminUserId: string, role: AdminRole): Promise<{ error?: string }> {
  const guard = await requireTeamManage();
  if (!guard.ok) return { error: guard.error };

  await connectToDatabase();
  const target = await AdminUserModel.findById(adminUserId);
  if (!target) return { error: "Account not found." };

  if (target.role === "owner" && role !== "owner") {
    const remainingOwners = await countActiveOwners(adminUserId);
    if (remainingOwners === 0) return { error: "There must be at least one active owner." };
  }

  target.role = role;
  await target.save();
  revalidatePath("/admin/team");
  return {};
}

export async function setAdminActive(adminUserId: string, isActive: boolean): Promise<{ error?: string }> {
  const guard = await requireTeamManage();
  if (!guard.ok) return { error: guard.error };

  await connectToDatabase();
  const target = await AdminUserModel.findById(adminUserId);
  if (!target) return { error: "Account not found." };

  if (!isActive && target.role === "owner") {
    const remainingOwners = await countActiveOwners(adminUserId);
    if (remainingOwners === 0) return { error: "There must be at least one active owner." };
  }

  target.isActive = isActive;
  await target.save();
  revalidatePath("/admin/team");
  return {};
}

export async function updateRolePermissions(
  role: "developer" | "staff",
  permissions: string[],
): Promise<{ error?: string }> {
  const guard = await requireTeamManage();
  if (!guard.ok) return { error: guard.error };

  const validPermissions = permissions.filter(isValidPermission) as Permission[];
  await setRolePermissions(role, validPermissions);
  revalidatePath("/admin/team");
  return {};
}
