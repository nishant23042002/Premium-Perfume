import type { Permission } from "@/lib/rbac";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Tags,
  Ticket,
  Image as ImageIcon,
  Megaphone,
  Star,
  HelpCircle,
  Mail,
  Users,
  type LucideIcon,
} from "lucide-react";

export type AdminNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  permission: Permission;
};

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard, permission: "dashboard.view" },
  { label: "Orders", href: "/admin/orders", icon: ShoppingBag, permission: "orders.view" },
  { label: "Products", href: "/admin/products", icon: Package, permission: "products.view" },
  { label: "Categories", href: "/admin/categories", icon: Tags, permission: "categories.manage" },
  { label: "Coupons", href: "/admin/coupons", icon: Ticket, permission: "coupons.manage" },
  { label: "Content", href: "/admin/content", icon: ImageIcon, permission: "content.manage" },
  { label: "Announcements", href: "/admin/announcements", icon: Megaphone, permission: "announcements.manage" },
  { label: "Reviews", href: "/admin/reviews", icon: Star, permission: "reviews.moderate" },
  { label: "FAQ", href: "/admin/faq", icon: HelpCircle, permission: "faq.manage" },
  { label: "Contact", href: "/admin/contact", icon: Mail, permission: "contact.view" },
  { label: "Team", href: "/admin/team", icon: Users, permission: "team.manage" },
];
