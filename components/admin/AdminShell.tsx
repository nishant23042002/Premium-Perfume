"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, LogOut } from "lucide-react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { logoutAdmin } from "@/lib/actions/admin-auth";
import type { Permission } from "@/lib/rbac";

const ROLE_LABEL: Record<string, string> = {
  owner: "Owner",
  developer: "Developer",
  staff: "Staff",
};

export function AdminShell({
  admin,
  permissions,
  children,
}: {
  admin: { name: string; email: string; role: string };
  permissions: Permission[];
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-admin-bg font-sans text-admin-ink">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col bg-admin-sidebar lg:flex">
        <Link href="/admin" className="flex items-center gap-2 px-5 py-6">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-admin-accent">
            THE RARESKIN
          </span>
        </Link>
        <div className="flex-1 overflow-y-auto">
          <AdminSidebar permissions={permissions} />
        </div>
        <div className="border-t border-white/10 px-5 py-4">
          <p className="truncate text-sm font-medium text-admin-sidebar-text">{admin.name}</p>
          <p className="truncate text-xs text-admin-sidebar-text-soft">
            {ROLE_LABEL[admin.role] ?? admin.role}
          </p>
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <aside className="relative flex w-72 flex-col bg-admin-sidebar">
            <div className="flex items-center justify-between px-5 py-6">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-admin-accent">
                THE RARESKIN
              </span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="text-admin-sidebar-text-soft hover:text-admin-sidebar-text"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto" onClick={() => setMobileOpen(false)}>
              <AdminSidebar permissions={permissions} />
            </div>
            <div className="border-t border-white/10 px-5 py-4">
              <p className="truncate text-sm font-medium text-admin-sidebar-text">{admin.name}</p>
              <p className="truncate text-xs text-admin-sidebar-text-soft">
                {ROLE_LABEL[admin.role] ?? admin.role}
              </p>
            </div>
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-admin-border bg-admin-surface px-4 sm:px-6">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="text-admin-ink-soft hover:text-admin-ink lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="hidden lg:block" />
          <form action={logoutAdmin}>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-admin-ink-soft transition-colors hover:bg-admin-bg hover:text-admin-ink"
            >
              <LogOut className="h-4 w-4" strokeWidth={1.75} />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </form>
        </header>

        <main className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
