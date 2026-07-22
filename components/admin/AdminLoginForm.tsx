"use client";

import { useActionState } from "react";
import { loginAdmin, type AdminLoginState } from "@/lib/actions/admin-auth";

const initialState: AdminLoginState = {};

export function AdminLoginForm() {
  const [state, formAction, isPending] = useActionState(loginAdmin, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <label className="flex flex-col gap-2">
        <span className="text-xs font-medium uppercase tracking-[0.12em] text-admin-sidebar-text-soft">
          Email
        </span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@rareskin.com"
          className="h-11 rounded-lg border border-white/10 bg-white/5 px-4 text-sm text-admin-sidebar-text placeholder:text-admin-sidebar-text-soft focus:border-admin-accent focus:outline-none focus:ring-1 focus:ring-admin-accent"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-xs font-medium uppercase tracking-[0.12em] text-admin-sidebar-text-soft">
          Password
        </span>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
          className="h-11 rounded-lg border border-white/10 bg-white/5 px-4 text-sm text-admin-sidebar-text placeholder:text-admin-sidebar-text-soft focus:border-admin-accent focus:outline-none focus:ring-1 focus:ring-admin-accent"
        />
      </label>

      {state?.error && (
        <p className="rounded-lg bg-admin-danger-bg px-3 py-2 text-sm text-admin-danger">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="mt-2 h-11 rounded-lg bg-admin-accent text-sm font-semibold text-admin-sidebar transition-colors hover:bg-admin-accent-dark disabled:opacity-50"
      >
        {isPending ? "Signing In..." : "Sign In"}
      </button>
    </form>
  );
}
