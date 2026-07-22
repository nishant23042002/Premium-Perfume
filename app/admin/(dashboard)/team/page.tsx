import type { Metadata } from "next";
import { getCurrentAdmin, hasPermission, getAllAdminUsers } from "@/lib/data/adminUsers";
import { getAllRolePermissions } from "@/lib/data/rolePermissions";
import { CreateAdminForm } from "@/components/admin/team/CreateAdminForm";
import { AdminUsersList } from "@/components/admin/team/AdminUsersList";
import { RolePermissionsEditor } from "@/components/admin/team/RolePermissionsEditor";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { AdminCard } from "@/components/admin/ui/AdminCard";
import { NoAccess } from "@/components/admin/NoAccess";

export const metadata: Metadata = { title: "Team", robots: { index: false, follow: false } };

export default async function AdminTeamPage() {
  const admin = await getCurrentAdmin();
  if (!hasPermission(admin, "team.manage")) return <NoAccess />;

  const [users, rolePermissions] = await Promise.all([getAllAdminUsers(), getAllRolePermissions()]);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Team & Roles"
        description="Create staff accounts, assign roles, and control what each role can access."
      />

      <AdminCard className="p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-admin-ink-soft">
          Add Team Member
        </h2>
        <CreateAdminForm />
        <p className="mt-3 text-xs text-admin-ink-faint">
          Share the email and temporary password with them directly — there&apos;s no self-service signup.
        </p>
      </AdminCard>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-admin-ink-soft">
          Accounts
        </h2>
        <AdminUsersList users={users} currentAdminId={admin!.id} />
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-admin-ink-soft">
          Role Permissions
        </h2>
        <p className="mb-3 text-sm text-admin-ink-faint">
          Owner always has full access and isn&apos;t editable, to prevent locking every owner out.
          Developer and Staff permissions below can be adjusted freely.
        </p>
        <RolePermissionsEditor
          developerPermissions={rolePermissions.developer}
          staffPermissions={rolePermissions.staff}
        />
      </div>
    </div>
  );
}
