"use client";

import { useActionState, useRef, useEffect } from "react";
import { createCategory, type CategoryFormState } from "@/lib/actions/categories";

const initialState: CategoryFormState = {};

const inputClass =
  "h-10 w-full rounded-lg border border-admin-border bg-admin-bg px-3 text-sm text-admin-ink placeholder:text-admin-ink-faint focus:border-admin-accent-dark focus:outline-none";

export function CategoryForm() {
  const [state, formAction, isPending] = useActionState(createCategory, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) formRef.current?.reset();
  }, [state?.success]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <input name="name" required placeholder="Category name, e.g. For Her" className={inputClass} />
        <input name="order" type="number" placeholder="Order (default 0)" className={inputClass} />
        <input name="description" placeholder="Description (optional)" className={`${inputClass} sm:col-span-2`} />
        <input
          type="file"
          name="image"
          accept="image/*"
          className="text-sm text-admin-ink-soft file:mr-3 file:rounded-lg file:border-0 file:bg-admin-ink file:px-3 file:py-2 file:text-xs file:font-medium file:uppercase file:text-admin-surface sm:col-span-2"
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="h-10 w-fit rounded-lg bg-admin-ink px-5 text-sm font-semibold text-admin-surface transition-colors hover:bg-admin-ink/90 disabled:opacity-50"
      >
        {isPending ? "Creating..." : "Create Category"}
      </button>
      {state?.error && <p className="text-sm text-admin-danger">{state.error}</p>}
      {state?.success && <p className="text-sm text-admin-success">{state.success}</p>}
    </form>
  );
}
