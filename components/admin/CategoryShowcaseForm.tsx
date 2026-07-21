"use client";

import { useActionState } from "react";
import { createCategoryShowcaseAction, type UploadState } from "@/lib/actions/categoryShowcase";

const initialState: UploadState = {};

const inputClass =
  "h-10 w-full border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-500 focus:outline-none";

export function CategoryShowcaseForm() {
  const [state, formAction, isPending] = useActionState(createCategoryShowcaseAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4 border border-gray-200 bg-gray-50 p-5">
      <h3 className="font-semibold text-gray-900">Add Category Card</h3>
      <p className="text-xs text-gray-500">
        Shown as an image tile in the &quot;Shop by Category&quot; section on the homepage, just
        below New Arrivals.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        <input name="title" required placeholder="Title (e.g. Unisex)" className={inputClass} />
        <input
          name="linkHref"
          required
          placeholder="Link URL (e.g. /perfumes/unisex)"
          className={inputClass}
        />
        <input name="alt" required placeholder="Alt text (required)" className={inputClass} />
        <input
          name="order"
          type="number"
          placeholder="Order (optional, default 0)"
          className={inputClass}
        />
      </div>

      <input
        type="file"
        name="image"
        accept="image/*"
        required
        className="text-sm text-gray-700 file:mr-3 file:border-0 file:bg-gray-900 file:px-3 file:py-2 file:text-xs file:font-medium file:uppercase file:text-white"
      />

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.success && <p className="text-sm text-green-700">{state.success}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="w-fit bg-gray-900 px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-white disabled:opacity-50"
      >
        {isPending ? "Uploading..." : "Add Card"}
      </button>
    </form>
  );
}
