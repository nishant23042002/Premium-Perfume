"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ADMIN_NAV_ITEMS } from "@/components/admin/adminNav";
import type { Permission } from "@/lib/rbac";

export function AdminSidebar({ permissions }: { permissions: Permission[] }) {
  const pathname = usePathname();
  const items = ADMIN_NAV_ITEMS.filter((item) => permissions.includes(item.permission));

  return (
    <nav className="flex h-full flex-col gap-1 overflow-y-auto px-3 py-2">
      {items.map((item) => {
        const isActive = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-admin-sidebar-active text-admin-accent"
                : "text-admin-sidebar-text-soft hover:bg-admin-sidebar-hover hover:text-admin-sidebar-text",
            )}
          >
            <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
