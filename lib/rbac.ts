// Client-safe: no database imports anywhere in this file. models/AdminUser.ts
// re-exports these rather than defining them, so client components can use
// the role list/type without ever pulling Mongoose into the browser bundle.
export const ADMIN_ROLES = ["owner", "developer", "staff"] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

// Single source of truth for every gate-able admin capability. Grouped for
// display in the Team permissions editor — the group key is cosmetic, only
// the `key` is ever checked in code.
export const PERMISSION_GROUPS = [
  {
    group: "Dashboard",
    permissions: [{ key: "dashboard.view", label: "View dashboard" }],
  },
  {
    group: "Orders",
    permissions: [
      { key: "orders.view", label: "View orders" },
      { key: "orders.manage", label: "Update order status, cancel, refund" },
    ],
  },
  {
    group: "Products",
    permissions: [
      { key: "products.view", label: "View products" },
      { key: "products.manage", label: "Create/edit products, manage images & stock" },
      { key: "categories.manage", label: "Manage categories & collections" },
    ],
  },
  {
    group: "Marketing",
    permissions: [
      { key: "coupons.manage", label: "Create/edit coupons" },
      { key: "content.manage", label: "Homepage banners, category showcase, offer banners, branding" },
      { key: "announcements.manage", label: "Announcement bar messages" },
    ],
  },
  {
    group: "Customer Content",
    permissions: [
      { key: "reviews.moderate", label: "Approve/reject product reviews" },
      { key: "faq.manage", label: "Manage FAQ entries" },
      { key: "contact.view", label: "View contact form submissions" },
    ],
  },
  {
    group: "Team",
    permissions: [{ key: "team.manage", label: "Create/deactivate admin accounts, edit role permissions" }],
  },
] as const;

export const ALL_PERMISSIONS = PERMISSION_GROUPS.flatMap((g) => g.permissions.map((p) => p.key));
export type Permission = (typeof ALL_PERMISSIONS)[number];

export function isValidPermission(value: string): value is Permission {
  return (ALL_PERMISSIONS as readonly string[]).includes(value);
}

// Editable defaults — seeded into RolePermissionsModel on first read (see
// lib/data/rolePermissions.ts) and adjustable afterward from Team settings.
// Owner is intentionally NOT defined here: it always resolves to every
// permission in code (getRolePermissions below), so there's no DB state that
// could ever lock every owner out of their own panel.
export const DEFAULT_ROLE_PERMISSIONS: Record<Exclude<AdminRole, "owner">, Permission[]> = {
  developer: ALL_PERMISSIONS.filter((p) => p !== "team.manage"),
  staff: ["dashboard.view", "orders.view", "orders.manage", "reviews.moderate", "contact.view"],
};
