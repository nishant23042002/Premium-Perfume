"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { placeOrder, type CheckoutState } from "@/lib/actions/checkout";

const initialState: CheckoutState = {};

const inputClass =
  "h-11 border border-ink/20 bg-transparent px-4 font-sans text-sm text-ink placeholder:text-ink/40 focus:border-accent-dark focus:outline-none";

export function CheckoutForm() {
  const [state, formAction, isPending] = useActionState(placeOrder, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <span className="font-sans text-xs font-semibold uppercase tracking-[0.15em] text-ink/50">
          Shipping Address
        </span>
        <div className="grid gap-4 sm:grid-cols-2">
          <input name="fullName" required placeholder="Full Name" className={inputClass} />
          <input name="phone" required placeholder="Phone Number" className={inputClass} />
          <input
            name="line1"
            required
            placeholder="Address Line 1"
            className={cn(inputClass, "sm:col-span-2")}
          />
          <input
            name="line2"
            placeholder="Address Line 2 (optional)"
            className={cn(inputClass, "sm:col-span-2")}
          />
          <input name="city" required placeholder="City" className={inputClass} />
          <input name="state" required placeholder="State" className={inputClass} />
          <input name="pincode" required placeholder="Pincode" className={inputClass} />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <span className="font-sans text-xs font-semibold uppercase tracking-[0.15em] text-ink/50">
          Payment Method
        </span>
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-3 border border-accent-dark bg-accent/10 p-4">
            <input
              type="radio"
              name="payment"
              value="cod"
              defaultChecked
              className="accent-accent-dark"
            />
            <span className="font-sans text-sm text-ink">Cash on Delivery</span>
          </label>
          <div className="flex items-center gap-3 border border-ink/10 p-4 opacity-40">
            <input type="radio" disabled />
            <span className="font-sans text-sm text-ink/50">Razorpay (UPI/Cards) — coming soon</span>
          </div>
        </div>
      </div>

      {state?.error && <p className="font-sans text-sm text-secondary">{state.error}</p>}

      <Button type="submit" variant="primary" size="lg" disabled={isPending}>
        {isPending ? "Placing Order..." : "Place Order"}
      </Button>
    </form>
  );
}
