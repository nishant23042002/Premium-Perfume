import type { Metadata } from "next";
import { getCurrentAdmin, hasPermission } from "@/lib/data/adminUsers";
import { getAllContactMessages } from "@/lib/data/contactMessages";
import { ContactMessageList } from "@/components/admin/contact/ContactMessageList";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { NoAccess } from "@/components/admin/NoAccess";

export const metadata: Metadata = { title: "Contact Messages", robots: { index: false, follow: false } };

export default async function AdminContactPage() {
  const admin = await getCurrentAdmin();
  if (!hasPermission(admin, "contact.view")) return <NoAccess />;

  const messages = await getAllContactMessages();

  return (
    <div>
      <PageHeader title="Contact Messages" description="Submissions from the site's contact form." />
      <ContactMessageList messages={messages} />
    </div>
  );
}
