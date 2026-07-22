import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/data/adminUsers";
import { AdminShell } from "@/components/admin/AdminShell";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  return (
    <AdminShell admin={admin} permissions={admin.permissions}>
      {children}
    </AdminShell>
  );
}
