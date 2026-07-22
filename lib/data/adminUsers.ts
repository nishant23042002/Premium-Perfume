import { connectToDatabase } from "@/lib/db/connect";
import { AdminUserModel, type AdminRole } from "@/models/AdminUser";
import { getAdminSession } from "@/lib/admin-session";
import { getRolePermissions } from "@/lib/data/rolePermissions";
import type { Permission } from "@/lib/rbac";

export type CurrentAdmin = {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  permissions: Permission[];
};

/** Reads the logged-in admin from the admin session cookie, or null if not
 * logged in (or their account has since been deactivated). Role and
 * permissions are always resolved fresh from the database — nothing about
 * access is cached in the session token itself, so a role change or
 * deactivation takes effect on the very next request. */
export async function getCurrentAdmin(): Promise<CurrentAdmin | null> {
  const session = await getAdminSession();
  if (!session) return null;

  await connectToDatabase();
  const admin = await AdminUserModel.findById(session.adminUserId).lean();
  if (!admin || !admin.isActive) return null;

  const permissions = await getRolePermissions(admin.role);
  return {
    id: String(admin._id),
    name: admin.name,
    email: admin.email,
    role: admin.role,
    permissions,
  };
}

export function hasPermission(admin: CurrentAdmin | null, permission: Permission): boolean {
  return Boolean(admin?.permissions.includes(permission));
}

export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  isActive: boolean;
  createdAt: string;
};

export async function getAllAdminUsers(): Promise<AdminUserRow[]> {
  await connectToDatabase();
  const admins = await AdminUserModel.find({}).sort({ createdAt: 1 }).lean();
  return admins.map((a) => ({
    id: String(a._id),
    name: a.name,
    email: a.email,
    role: a.role,
    isActive: a.isActive,
    createdAt: a.createdAt.toISOString(),
  }));
}
