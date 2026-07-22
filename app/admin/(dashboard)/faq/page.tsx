import type { Metadata } from "next";
import { getCurrentAdmin, hasPermission } from "@/lib/data/adminUsers";
import { getAllFaqsForAdmin } from "@/lib/data/faqs";
import { FaqForm } from "@/components/admin/faq/FaqForm";
import { FaqList } from "@/components/admin/faq/FaqList";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { AdminCard } from "@/components/admin/ui/AdminCard";
import { NoAccess } from "@/components/admin/NoAccess";

export const metadata: Metadata = { title: "FAQ", robots: { index: false, follow: false } };

export default async function AdminFaqPage() {
  const admin = await getCurrentAdmin();
  if (!hasPermission(admin, "faq.manage")) return <NoAccess />;

  const faqs = await getAllFaqsForAdmin();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="FAQ" description="Questions and answers shown on the FAQ page." />

      <AdminCard className="p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-admin-ink-soft">Add FAQ</h2>
        <FaqForm />
      </AdminCard>

      <FaqList faqs={faqs} />
    </div>
  );
}
