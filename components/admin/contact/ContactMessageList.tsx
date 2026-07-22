"use client";

import { useTransition } from "react";
import { markContactMessageRead } from "@/lib/actions/contactMessages";
import type { AdminContactMessage } from "@/lib/data/contactMessages";
import { AdminCard } from "@/components/admin/ui/AdminCard";

function Row({ message }: { message: AdminContactMessage }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-col gap-2 border-b border-admin-border p-4 last:border-0">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-admin-ink">
            {message.name} <span className="text-admin-ink-faint">· {message.email}</span>
            {message.phone && <span className="text-admin-ink-faint"> · {message.phone}</span>}
          </p>
          {message.subject && <p className="text-sm text-admin-ink-soft">{message.subject}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="text-xs text-admin-ink-faint">
            {new Date(message.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
          </span>
          {message.status === "new" && (
            <button
              type="button"
              disabled={isPending}
              onClick={() => startTransition(() => markContactMessageRead(message.id))}
              className="rounded-lg border border-admin-accent-dark px-2 py-1 text-xs font-medium uppercase text-admin-accent-dark disabled:opacity-50"
            >
              Mark Read
            </button>
          )}
        </div>
      </div>
      <p className="text-sm text-admin-ink-soft">{message.message}</p>
    </div>
  );
}

export function ContactMessageList({ messages }: { messages: AdminContactMessage[] }) {
  if (messages.length === 0) {
    return <p className="text-sm text-admin-ink-faint">No messages yet.</p>;
  }

  return (
    <AdminCard>
      {messages.map((message) => (
        <Row key={message.id} message={message} />
      ))}
    </AdminCard>
  );
}
