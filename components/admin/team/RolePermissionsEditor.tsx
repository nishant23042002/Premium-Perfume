"use client";

import { useState, useTransition } from "react";
import { updateRolePermissions } from "@/lib/actions/team";
import { PERMISSION_GROUPS, type Permission } from "@/lib/rbac";
import { AdminCard } from "@/components/admin/ui/AdminCard";

function RoleEditor({
  role,
  initialPermissions,
}: {
  role: "developer" | "staff";
  initialPermissions: Permission[];
}) {
  const [selected, setSelected] = useState<Set<Permission>>(new Set(initialPermissions));
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function toggle(permission: Permission) {
    setSaved(false);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(permission)) next.delete(permission);
      else next.add(permission);
      return next;
    });
  }

  function save() {
    startTransition(async () => {
      await updateRolePermissions(role, Array.from(selected));
      setSaved(true);
    });
  }

  return (
    <AdminCard className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-admin-ink">
          {role === "developer" ? "Developer" : "Staff"}
        </h3>
        <button
          type="button"
          onClick={save}
          disabled={isPending}
          className="rounded-lg bg-admin-ink px-4 py-1.5 text-xs font-semibold text-admin-surface transition-colors hover:bg-admin-ink/90 disabled:opacity-50"
        >
          {isPending ? "Saving..." : saved ? "Saved" : "Save Changes"}
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {PERMISSION_GROUPS.map((group) => (
          <div key={group.group} className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-admin-ink-faint">
              {group.group}
            </span>
            {group.permissions.map((permission) => (
              <label key={permission.key} className="flex items-start gap-2 text-sm text-admin-ink-soft">
                <input
                  type="checkbox"
                  checked={selected.has(permission.key)}
                  onChange={() => toggle(permission.key)}
                  className="mt-0.5 accent-admin-accent-dark"
                />
                {permission.label}
              </label>
            ))}
          </div>
        ))}
      </div>
    </AdminCard>
  );
}

export function RolePermissionsEditor({
  developerPermissions,
  staffPermissions,
}: {
  developerPermissions: Permission[];
  staffPermissions: Permission[];
}) {
  return (
    <div className="flex flex-col gap-4">
      <RoleEditor role="developer" initialPermissions={developerPermissions} />
      <RoleEditor role="staff" initialPermissions={staffPermissions} />
    </div>
  );
}
