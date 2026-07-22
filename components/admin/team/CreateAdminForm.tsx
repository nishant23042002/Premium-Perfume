"use client";

import { useActionState, useRef, useEffect } from "react";
import { createAdminAccount, type TeamActionState } from "@/lib/actions/team";
import { ADMIN_ROLES } from "@/lib/rbac";

const initialState: TeamActionState = {};

const inputClass =
  "h-10 w-full rounded-lg border border-admin-border bg-admin-bg px-3 text-sm text-admin-ink placeholder:text-admin-ink-faint focus:border-admin-accent-dark focus:outline-none";

export function CreateAdminForm() {
  const [state, formAction, isPending] = useActionState(createAdminAccount, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) formRef.current?.reset();
  }, [state?.success]);

  return (
    <form ref={formRef} action={formAction} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <input name="name" required placeholder="Full name" className={inputClass} />
      <input name="email" type="email" required placeholder="Email" className={inputClass} />
      <input
        name="password"
        type="password"
        required
        placeholder="Temporary password"
        className={inputClass}
      />
      <select name="role" defaultValue="staff" className={inputClass}>
        {ADMIN_ROLES.map((role) => (
          <option key={role} value={role}>
            {role[0].toUpperCase() + role.slice(1)}
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={isPending}
        className="h-10 rounded-lg bg-admin-ink text-sm font-semibold text-admin-surface transition-colors hover:bg-admin-ink/90 disabled:opacity-50"
      >
        {isPending ? "Creating..." : "Create Account"}
      </button>

      {state?.error && (
        <p className="sm:col-span-2 lg:col-span-5 text-sm text-admin-danger">{state.error}</p>
      )}
      {state?.success && (
        <p className="sm:col-span-2 lg:col-span-5 text-sm text-admin-success">{state.success}</p>
      )}
    </form>
  );
}
