import { connectToDatabase } from "@/lib/db/connect";
import { RolePermissionsModel } from "@/models/RolePermissions";
import { ALL_PERMISSIONS, DEFAULT_ROLE_PERMISSIONS, type Permission } from "@/lib/rbac";
import type { AdminRole } from "@/models/AdminUser";

/** Owner always has every permission — fixed in code, not stored, so no DB
 * state can ever lock every owner out of their own panel. Developer/staff
 * are read from the DB, seeded with sane defaults on first access. */
export async function getRolePermissions(role: AdminRole): Promise<Permission[]> {
  if (role === "owner") return ALL_PERMISSIONS;

  await connectToDatabase();
  const doc = await RolePermissionsModel.findOne({ role }).lean();
  if (doc) return doc.permissions as Permission[];

  return DEFAULT_ROLE_PERMISSIONS[role];
}

export async function getAllRolePermissions(): Promise<Record<AdminRole, Permission[]>> {
  await connectToDatabase();
  const docs = await RolePermissionsModel.find({}).lean();
  const stored = new Map(docs.map((d) => [d.role, d.permissions as Permission[]]));

  return {
    owner: ALL_PERMISSIONS,
    developer: stored.get("developer") ?? DEFAULT_ROLE_PERMISSIONS.developer,
    staff: stored.get("staff") ?? DEFAULT_ROLE_PERMISSIONS.staff,
  };
}

export async function setRolePermissions(
  role: Exclude<AdminRole, "owner">,
  permissions: Permission[],
): Promise<void> {
  await connectToDatabase();
  await RolePermissionsModel.updateOne({ role }, { permissions }, { upsert: true });
}
