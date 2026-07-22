"use client";

import { useActionState, useRef, useEffect } from "react";
import { createCoupon, type CouponFormState } from "@/lib/actions/coupons";

const initialState: CouponFormState = {};

const inputClass =
  "h-10 w-full rounded-lg border border-admin-border bg-admin-bg px-3 text-sm text-admin-ink placeholder:text-admin-ink-faint focus:border-admin-accent-dark focus:outline-none";

export function CouponForm() {
  const [state, formAction, isPending] = useActionState(createCoupon, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) formRef.current?.reset();
  }, [state?.success]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <input name="code" required placeholder="Code, e.g. WELCOME10" className={`${inputClass} uppercase`} />
        <select name="type" defaultValue="percentage" className={inputClass}>
          <option value="percentage">Percentage off</option>
          <option value="fixed">Fixed amount off</option>
        </select>
        <input name="value" type="number" min="1" step="1" required placeholder="Value" className={inputClass} />
        <input name="usageLimit" type="number" min="1" step="1" placeholder="Usage limit (optional)" className={inputClass} />
        <input
          name="minOrderValue"
          type="number"
          min="0"
          step="1"
          placeholder="Min order value (optional)"
          className={inputClass}
        />
        <input
          name="maxDiscount"
          type="number"
          min="0"
          step="1"
          placeholder="Max discount cap (optional)"
          className={inputClass}
        />
        <input name="expiresAt" type="date" className={inputClass} />
        <button
          type="submit"
          disabled={isPending}
          className="h-10 rounded-lg bg-admin-ink text-sm font-semibold text-admin-surface transition-colors hover:bg-admin-ink/90 disabled:opacity-50"
        >
          {isPending ? "Creating..." : "Create Coupon"}
        </button>
      </div>
      {state?.error && <p className="text-sm text-admin-danger">{state.error}</p>}
      {state?.success && <p className="text-sm text-admin-success">{state.success}</p>}
    </form>
  );
}
