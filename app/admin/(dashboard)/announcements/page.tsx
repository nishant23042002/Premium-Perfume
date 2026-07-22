import type { Metadata } from "next";
import { getCurrentAdmin, hasPermission } from "@/lib/data/adminUsers";
import { getAllAnnouncements } from "@/lib/data/announcements";
import { AnnouncementForm } from "@/components/admin/announcements/AnnouncementForm";
import { AnnouncementList } from "@/components/admin/announcements/AnnouncementList";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { AdminCard } from "@/components/admin/ui/AdminCard";
import { NoAccess } from "@/components/admin/NoAccess";

export const metadata: Metadata = { title: "Announcements", robots: { index: false, follow: false } };

export default async function AdminAnnouncementsPage() {
  const admin = await getCurrentAdmin();
  if (!hasPermission(admin, "announcements.manage")) return <NoAccess />;

  const announcements = await getAllAnnouncements();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Announcements" description="Messages shown in the site-wide announcement bar." />

      <AdminCard className="p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-admin-ink-soft">
          Add Announcement
        </h2>
        <AnnouncementForm />
      </AdminCard>

      <AnnouncementList announcements={announcements} />
    </div>
  );
}
