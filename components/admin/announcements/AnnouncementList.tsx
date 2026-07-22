"use client";

import { useTransition } from "react";
import { toggleAnnouncementActive, deleteAnnouncement } from "@/lib/actions/announcements";
import type { AdminAnnouncement } from "@/lib/data/announcements";
import { AdminCard } from "@/components/admin/ui/AdminCard";

function Row({ announcement }: { announcement: AdminAnnouncement }) {
  const [isPending, startTransition] = useTransition();

  return (
    <tr className="border-b border-admin-border last:border-0">
      <td className="px-4 py-3 text-sm text-admin-ink">{announcement.text}</td>
      <td className="px-4 py-3 text-xs text-admin-ink-faint">{announcement.link || "—"}</td>
      <td className="px-4 py-3 text-xs text-admin-ink-faint">{announcement.order}</td>
      <td className="px-4 py-3">
        <div className="flex gap-2">
          <button
            type="button"
            disabled={isPending}
            onClick={() => startTransition(() => toggleAnnouncementActive(announcement.id, !announcement.isActive))}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium uppercase disabled:opacity-50 ${
              announcement.isActive
                ? "border-admin-success-bg bg-admin-success-bg text-admin-success"
                : "border-admin-border text-admin-ink-faint"
            }`}
          >
            {announcement.isActive ? "Active" : "Hidden"}
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => startTransition(() => deleteAnnouncement(announcement.id))}
            className="rounded-lg border border-admin-danger-bg px-3 py-1.5 text-xs font-medium uppercase text-admin-danger disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}

export function AnnouncementList({ announcements }: { announcements: AdminAnnouncement[] }) {
  if (announcements.length === 0) {
    return <p className="text-sm text-admin-ink-faint">No announcements yet.</p>;
  }

  return (
    <AdminCard className="overflow-x-auto">
      <table className="w-full min-w-[560px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-admin-border bg-admin-bg text-left text-xs font-semibold uppercase tracking-wide text-admin-ink-faint">
            <th className="px-4 py-2.5">Text</th>
            <th className="px-4 py-2.5">Link</th>
            <th className="px-4 py-2.5">Order</th>
            <th className="px-4 py-2.5">Status</th>
          </tr>
        </thead>
        <tbody>
          {announcements.map((a) => (
            <Row key={a.id} announcement={a} />
          ))}
        </tbody>
      </table>
    </AdminCard>
  );
}
