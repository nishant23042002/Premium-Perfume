import { getActiveAnnouncement } from "@/lib/data/announcements";

export async function AnnouncementBar() {
  const announcement = await getActiveAnnouncement();
  if (!announcement) return null;

  const content = (
    <p className="font-sans text-xs uppercase tracking-[0.2em] text-secondary">
      {announcement.text}
    </p>
  );

  return (
    <div className="flex items-center justify-center bg-accent/20 px-4 py-2.5 text-center">
      {announcement.link ? <a href={announcement.link}>{content}</a> : content}
    </div>
  );
}
