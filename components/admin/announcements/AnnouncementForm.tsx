"use client";

import { useActionState, useRef, useEffect } from "react";
import { createAnnouncement, type AnnouncementFormState } from "@/lib/actions/announcements";

const initialState: AnnouncementFormState = {};

const inputClass =
  "h-10 w-full rounded-lg border border-admin-border bg-admin-bg px-3 text-sm text-admin-ink placeholder:text-admin-ink-faint focus:border-admin-accent-dark focus:outline-none";

export function AnnouncementForm() {
  const [state, formAction, isPending] = useActionState(createAnnouncement, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) formRef.current?.reset();
  }, [state?.success]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-3">
        <input
          name="text"
          required
          placeholder="e.g. Free shipping on orders above ₹999"
          className={`${inputClass} sm:col-span-2`}
        />
        <input name="link" placeholder="Link (optional)" className={inputClass} />
        <input name="order" type="number" placeholder="Order (default 0)" className={inputClass} />
        <button
          type="submit"
          disabled={isPending}
          className="h-10 rounded-lg bg-admin-ink text-sm font-semibold text-admin-surface transition-colors hover:bg-admin-ink/90 disabled:opacity-50 sm:col-span-1"
        >
          {isPending ? "Adding..." : "Add Announcement"}
        </button>
      </div>
      {state?.error && <p className="text-sm text-admin-danger">{state.error}</p>}
      {state?.success && <p className="text-sm text-admin-success">{state.success}</p>}
    </form>
  );
}
