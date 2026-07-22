"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/Button";
import { updateProfile, type AccountActionState } from "@/lib/actions/account";
import type { CurrentUser } from "@/lib/data/users";

const inputClass =
  "h-11 border border-ink/20 bg-transparent px-4 font-sans text-sm text-ink placeholder:text-ink/40 focus:border-accent-dark focus:outline-none";

const initialState: AccountActionState = {};

export function ProfileTab({ user }: { user: CurrentUser }) {
  const [isEditing, setIsEditing] = useState(false);
  const [state, formAction, isPending] = useActionState(updateProfile, initialState);

  // Derived during render (not an effect) — mirrors the pattern already used
  // by CartProvider for reacting to a value changing without an extra pass.
  const [prevSuccess, setPrevSuccess] = useState(state.success);
  if (state.success !== prevSuccess) {
    setPrevSuccess(state.success);
    if (state.success && isEditing) setIsEditing(false);
  }

  if (!isEditing) {
    return (
      <div className="flex max-w-md flex-col gap-4">
        <div className="flex flex-col gap-2 border border-ink/10 p-6 font-sans text-sm text-ink">
          <div className="flex justify-between">
            <span className="text-ink/60">Mobile Number</span>
            <span>+{user.phone.replace("+", "")}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink/60">Name</span>
            <span>{user.name || "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink/60">Email</span>
            <span>{user.email || "—"}</span>
          </div>
        </div>
        <Button type="button" variant="ghost" className="w-fit" onClick={() => setIsEditing(true)}>
          Edit Profile
        </Button>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex max-w-md flex-col gap-4">
      <input name="name" defaultValue={user.name ?? ""} placeholder="Full Name" className={inputClass} />
      <input
        name="email"
        type="email"
        defaultValue={user.email ?? ""}
        placeholder="Email"
        className={inputClass}
      />
      {state.error && <p className="font-sans text-sm text-secondary">{state.error}</p>}
      <div className="flex gap-3">
        <Button type="submit" variant="primary" disabled={isPending}>
          {isPending ? "Saving..." : "Save Changes"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
