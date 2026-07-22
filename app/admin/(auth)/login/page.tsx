import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/data/adminUsers";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

export const metadata: Metadata = { title: "Admin Sign In", robots: { index: false, follow: false } };

export default async function AdminLoginPage() {
  const admin = await getCurrentAdmin();
  if (admin) redirect("/admin");

  return (
    <div className="flex min-h-screen items-center justify-center bg-admin-sidebar px-6 font-sans">
      <div className="flex w-full max-w-sm flex-col gap-8">
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.35em] text-admin-accent">
            THE RARESKIN
          </span>
          <h1 className="text-2xl font-semibold text-admin-sidebar-text">Admin Panel</h1>
          <p className="text-sm text-admin-sidebar-text-soft">Sign in with your team account to continue.</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 shadow-2xl shadow-black/40">
          <AdminLoginForm />
        </div>

        <p className="text-center text-xs text-admin-sidebar-text-soft">
          Don&apos;t have an account? Ask an owner to invite you from Team settings.
        </p>
      </div>
    </div>
  );
}
