"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { placeOrder, type CheckoutState } from "@/lib/actions/checkout";
import type { AddressDoc } from "@/lib/data/users";

const initialState: CheckoutState = {};

const inputClass =
  "h-11 border border-ink/20 bg-transparent px-4 font-sans text-sm text-ink placeholder:text-ink/40 focus:border-accent-dark focus:outline-none";

type FormFields = {
  fullName: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
};

const EMPTY_FIELDS: FormFields = {
  fullName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
};

function fieldsFromAddress(address: AddressDoc): FormFields {
  return {
    fullName: address.fullName,
    phone: address.phone,
    line1: address.line1,
    line2: address.line2 ?? "",
    city: address.city,
    state: address.state,
    pincode: address.pincode,
  };
}

export function CheckoutForm({ savedAddresses = [] }: { savedAddresses?: AddressDoc[] }) {
  const [state, formAction, isPending] = useActionState(placeOrder, initialState);

  const defaultAddress = savedAddresses.find((a) => a.isDefault) ?? savedAddresses[0];
  const [fields, setFields] = useState<FormFields>(
    defaultAddress ? fieldsFromAddress(defaultAddress) : EMPTY_FIELDS,
  );
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    defaultAddress?._id ?? null,
  );

  function updateField(key: keyof FormFields, value: string) {
    setSelectedAddressId(null);
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <form action={formAction} className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <span className="font-sans text-xs font-semibold uppercase tracking-[0.15em] text-ink/50">
          Shipping Address
        </span>

        {savedAddresses.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {savedAddresses.map((address) => (
              <button
                key={address._id}
                type="button"
                onClick={() => {
                  setSelectedAddressId(address._id);
                  setFields(fieldsFromAddress(address));
                }}
                className={cn(
                  "border px-4 py-2 font-sans text-xs uppercase tracking-[0.1em] transition-colors",
                  selectedAddressId === address._id
                    ? "border-accent-dark bg-accent/10 text-accent-dark"
                    : "border-ink/20 text-ink/60 hover:border-accent-dark hover:text-accent-dark",
                )}
              >
                {address.label}
              </button>
            ))}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <input
            name="fullName"
            required
            placeholder="Full Name"
            value={fields.fullName}
            onChange={(e) => updateField("fullName", e.target.value)}
            className={inputClass}
          />
          <input
            name="phone"
            required
            placeholder="Phone Number"
            value={fields.phone}
            onChange={(e) => updateField("phone", e.target.value)}
            className={inputClass}
          />
          <input
            name="line1"
            required
            placeholder="Address Line 1"
            value={fields.line1}
            onChange={(e) => updateField("line1", e.target.value)}
            className={cn(inputClass, "sm:col-span-2")}
          />
          <input
            name="line2"
            placeholder="Address Line 2 (optional)"
            value={fields.line2}
            onChange={(e) => updateField("line2", e.target.value)}
            className={cn(inputClass, "sm:col-span-2")}
          />
          <input
            name="city"
            required
            placeholder="City"
            value={fields.city}
            onChange={(e) => updateField("city", e.target.value)}
            className={inputClass}
          />
          <input
            name="state"
            required
            placeholder="State"
            value={fields.state}
            onChange={(e) => updateField("state", e.target.value)}
            className={inputClass}
          />
          <input
            name="pincode"
            required
            placeholder="Pincode"
            value={fields.pincode}
            onChange={(e) => updateField("pincode", e.target.value)}
            className={inputClass}
          />
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
