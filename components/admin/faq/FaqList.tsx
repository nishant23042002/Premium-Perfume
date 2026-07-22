"use client";

import { useTransition } from "react";
import { deleteFaq } from "@/lib/actions/faqs";
import type { AdminFaq } from "@/lib/data/faqs";
import { AdminCard } from "@/components/admin/ui/AdminCard";

function Row({ faq }: { faq: AdminFaq }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-start justify-between gap-4 border-b border-admin-border p-4 last:border-0">
      <div className="flex-1">
        <p className="text-sm font-medium text-admin-ink">{faq.question}</p>
        <p className="mt-1 text-sm text-admin-ink-soft">{faq.answer}</p>
        <span className="mt-2 inline-block rounded-full bg-admin-bg px-2 py-0.5 text-xs uppercase text-admin-ink-faint">
          {faq.category}
        </span>
      </div>
      <button
        type="button"
        disabled={isPending}
        onClick={() => startTransition(() => deleteFaq(faq.id))}
        className="shrink-0 rounded-lg border border-admin-danger-bg px-3 py-1.5 text-xs font-medium uppercase text-admin-danger disabled:opacity-50"
      >
        Delete
      </button>
    </div>
  );
}

export function FaqList({ faqs }: { faqs: AdminFaq[] }) {
  if (faqs.length === 0) {
    return <p className="text-sm text-admin-ink-faint">No FAQs yet.</p>;
  }

  return (
    <AdminCard>
      {faqs.map((faq) => (
        <Row key={faq.id} faq={faq} />
      ))}
    </AdminCard>
  );
}
