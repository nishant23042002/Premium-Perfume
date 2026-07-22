"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { saveAddress, deleteAddress, setDefaultAddress, type AddressFormState } from "@/lib/actions/account";
import type { AddressDoc } from "@/lib/data/users";

const inputClass =
  "h-11 border border-ink/20 bg-transparent px-4 font-sans text-sm text-ink placeholder:text-ink/40 focus:border-accent-dark focus:outline-none";

const initialState: AddressFormState = {};

function AddressForm({ address, onDone }: { address?: AddressDoc; onDone: () => void }) {
  const [state, formAction, isPending] = useActionState(saveAddress, initialState);

  useEffect(() => {
    if (state.success) onDone();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.success]);

  return (
    <form action={formAction} className="grid gap-4 border border-ink/10 p-6 sm:grid-cols-2">
      {address && <input type="hidden" name="addressId" value={address._id} />}
      <input
        name="label"
        defaultValue={address?.label ?? "Home"}
        placeholder="Label (e.g. Home, Work)"
        className={inputClass}
      />
      <input
        name="fullName"
        defaultValue={address?.fullName}
        required
        placeholder="Full Name"
        className={inputClass}
      />
      <input
        name="phone"
        defaultValue={address?.phone}
        required
        placeholder="Phone Number"
        className={inputClass}
      />
      <input
        name="line1"
        defaultValue={address?.line1}
        required
        placeholder="Address Line 1"
        className={cn(inputClass, "sm:col-span-2")}
      />
      <input
        name="line2"
        defaultValue={address?.line2}
        placeholder="Address Line 2 (optional)"
        className={cn(inputClass, "sm:col-span-2")}
      />
      <input name="city" defaultValue={address?.city} required placeholder="City" className={inputClass} />
      <input
        name="state"
        defaultValue={address?.state}
        required
        placeholder="State"
        className={inputClass}
      />
      <input
        name="pincode"
        defaultValue={address?.pincode}
        required
        placeholder="Pincode"
        className={inputClass}
      />
      <label className="flex items-center gap-2 font-sans text-sm text-ink/70 sm:col-span-2">
        <input
          type="checkbox"
          name="isDefault"
          defaultChecked={address?.isDefault ?? false}
          className="accent-accent-dark"
        />
        Set as default address
      </label>
      {state.error && <p className="font-sans text-sm text-secondary sm:col-span-2">{state.error}</p>}
      <div className="flex gap-3 sm:col-span-2">
        <Button type="submit" variant="primary" disabled={isPending}>
          {isPending ? "Saving..." : "Save Address"}
        </Button>
        <Button type="button" variant="ghost" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

export function AddressTab({ addresses }: { addresses: AddressDoc[] }) {
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex max-w-2xl flex-col gap-4">
      {addresses.map((address) =>
        editing === address._id ? (
          <AddressForm key={address._id} address={address} onDone={() => setEditing(null)} />
        ) : (
          <div
            key={address._id}
            className="flex items-start justify-between gap-4 border border-ink/10 p-5 font-sans text-sm text-ink"
          >
            <div>
              <div className="flex items-center gap-2 pb-1">
                <span className="font-semibold">{address.label}</span>
                {address.isDefault && (
                  <span className="text-xs uppercase tracking-wide text-accent-dark">Default</span>
                )}
              </div>
              <p className="text-ink/70">
                {address.fullName} · {address.phone}
              </p>
              <p className="text-ink/70">
                {address.line1}
                {address.line2 ? `, ${address.line2}` : ""}, {address.city}, {address.state}{" "}
                {address.pincode}
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-2">
              <button
                type="button"
                onClick={() => setEditing(address._id)}
                className="font-sans text-xs uppercase tracking-wide text-accent-dark hover:underline"
              >
                Edit
              </button>
              {!address.isDefault && (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => startTransition(() => setDefaultAddress(address._id))}
                  className="font-sans text-xs uppercase tracking-wide text-ink/50 hover:text-ink disabled:opacity-50"
                >
                  Set Default
                </button>
              )}
              <button
                type="button"
                disabled={isPending}
                onClick={() => startTransition(() => deleteAddress(address._id))}
                className="font-sans text-xs uppercase tracking-wide text-ink/40 hover:text-secondary disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          </div>
        ),
      )}

      {addresses.length === 0 && editing !== "new" && (
        <p className="border border-ink/10 p-6 font-sans text-sm text-ink/50">No saved addresses yet.</p>
      )}

      {editing === "new" ? (
        <AddressForm onDone={() => setEditing(null)} />
      ) : (
        <Button type="button" variant="ghost" className="w-fit" onClick={() => setEditing("new")}>
          + Add New Address
        </Button>
      )}
    </div>
  );
}
