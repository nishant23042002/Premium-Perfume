"use client";

import { useTransition } from "react";
import { updateAdminRole, setAdminActive } from "@/lib/actions/team";
import { ADMIN_ROLES, type AdminRole } from "@/lib/rbac";
import type { AdminUserRow } from "@/lib/data/adminUsers";
import { AdminCard } from "@/components/admin/ui/AdminCard";

const ROLE_TONE: Record<AdminRole, string> = {
  owner: "text-admin-accent-dark",
  developer: "text-blue-600",
  staff: "text-admin-ink-soft",
};

function Row({ user, isSelf }: { user: AdminUserRow; isSelf: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <tr className="border-b border-admin-border last:border-0">
      <td className="px-4 py-3">
        <p className="text-sm font-medium text-admin-ink">
          {user.name} {isSelf && <span className="text-admin-ink-faint">(you)</span>}
        </p>
        <p className="text-xs text-admin-ink-faint">{user.email}</p>
      </td>
      <td className="px-4 py-3">
        <select
          defaultValue={user.role}
          disabled={isPending || isSelf}
          onChange={(e) => {
            const role = e.target.value as AdminRole;
            startTransition(() => {
              updateAdminRole(user.id, role);
            });
          }}
          className={`rounded-lg border border-admin-border bg-admin-surface px-2 py-1.5 text-xs font-medium uppercase disabled:opacity-50 ${ROLE_TONE[user.role]}`}
        >
          {ADMIN_ROLES.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
      </td>
      <td className="px-4 py-3 text-xs text-admin-ink-faint">
        {new Date(user.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
      </td>
      <td className="px-4 py-3">
        <button
          type="button"
          disabled={isPending || isSelf}
          onClick={() =>
            startTransition(() => {
              setAdminActive(user.id, !user.isActive);
            })
          }
          className={`rounded-lg border px-3 py-1.5 text-xs font-medium uppercase disabled:opacity-50 ${
            user.isActive
              ? "border-admin-border text-admin-ink-soft hover:bg-admin-bg"
              : "border-admin-danger-bg bg-admin-danger-bg text-admin-danger"
          }`}
        >
          {user.isActive ? "Active" : "Deactivated"}
        </button>
      </td>
    </tr>
  );
}

export function AdminUsersList({ users, currentAdminId }: { users: AdminUserRow[]; currentAdminId: string }) {
  return (
    <AdminCard className="overflow-x-auto">
      <table className="w-full min-w-[560px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-admin-border bg-admin-bg text-left text-xs font-semibold uppercase tracking-wide text-admin-ink-faint">
            <th className="px-4 py-2.5">Name</th>
            <th className="px-4 py-2.5">Role</th>
            <th className="px-4 py-2.5">Added</th>
            <th className="px-4 py-2.5">Status</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <Row key={user.id} user={user} isSelf={user.id === currentAdminId} />
          ))}
        </tbody>
      </table>
    </AdminCard>
  );
}
