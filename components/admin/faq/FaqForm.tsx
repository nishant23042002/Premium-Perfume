"use client";

import { useActionState, useRef, useEffect } from "react";
import { createFaq, type FaqFormState } from "@/lib/actions/faqs";

const initialState: FaqFormState = {};

const inputClass =
  "w-full rounded-lg border border-admin-border bg-admin-bg px-3 text-sm text-admin-ink placeholder:text-admin-ink-faint focus:border-admin-accent-dark focus:outline-none";

export function FaqForm() {
  const [state, formAction, isPending] = useActionState(createFaq, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) formRef.current?.reset();
  }, [state?.success]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-3">
      <input name="question" required placeholder="Question" className={`${inputClass} h-10`} />
      <textarea name="answer" required placeholder="Answer" rows={3} className={`${inputClass} py-2`} />
      <div className="grid gap-3 sm:grid-cols-3">
        <select name="category" defaultValue="general" className={`${inputClass} h-10`}>
          <option value="general">General</option>
          <option value="product">Product</option>
          <option value="shipping">Shipping</option>
        </select>
        <input name="order" type="number" placeholder="Order (default 0)" className={`${inputClass} h-10`} />
        <button
          type="submit"
          disabled={isPending}
          className="h-10 rounded-lg bg-admin-ink text-sm font-semibold text-admin-surface transition-colors hover:bg-admin-ink/90 disabled:opacity-50"
        >
          {isPending ? "Adding..." : "Add FAQ"}
        </button>
      </div>
      {state?.error && <p className="text-sm text-admin-danger">{state.error}</p>}
      {state?.success && <p className="text-sm text-admin-success">{state.success}</p>}
    </form>
  );
}
