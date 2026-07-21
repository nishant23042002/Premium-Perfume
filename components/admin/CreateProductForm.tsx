"use client";

import { useActionState } from "react";
import { createProductAction, type UploadState } from "@/lib/actions/admin";
import type { NavCategory } from "@/lib/data/categories";

const initialState: UploadState = {};

const inputClass =
  "h-10 w-full border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-500 focus:outline-none";

const CONCENTRATIONS = ["EDP", "EDT", "Parfum", "Attar", "Cologne"] as const;

export function CreateProductForm({ categories }: { categories: NavCategory[] }) {
  const [state, formAction, isPending] = useActionState(createProductAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4 border border-gray-200 bg-gray-50 p-5">
      <h3 className="font-semibold text-gray-900">Create Product</h3>
      <p className="text-xs text-gray-500">
        Creates a new, live product with a single size/price variant and one photo. Add more
        photos afterward using the upload form below.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        <input name="name" required placeholder="Product name (required)" className={inputClass} />
        <select name="concentration" required defaultValue="" className={inputClass}>
          <option value="" disabled>
            Choose concentration
          </option>
          {CONCENTRATIONS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input
          name="shortDescription"
          placeholder="Short description (optional)"
          className={inputClass}
        />
        <input name="alt" required placeholder="Image alt text (required)" className={inputClass} />
      </div>

      <textarea
        name="description"
        placeholder="Full description (optional)"
        rows={3}
        className="w-full border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-500 focus:outline-none"
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <input
          name="sizeMl"
          type="number"
          min="1"
          required
          placeholder="Size (ml)"
          className={inputClass}
        />
        <input
          name="price"
          type="number"
          min="1"
          required
          placeholder="Price (₹)"
          className={inputClass}
        />
        <input name="stock" type="number" min="0" placeholder="Stock (default 0)" className={inputClass} />
      </div>

      {categories.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Categories
          </span>
          <div className="flex flex-wrap gap-4">
            {categories.map((category) => (
              <label key={category._id} className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" name="categoryIds" value={category._id} />
                {category.name}
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" name="isBestseller" />
          Show in Bestsellers
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" name="isNewArrival" />
          Show in New Arrivals
        </label>
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
        {isPending ? "Creating..." : "Create Product"}
      </button>
    </form>
  );
}
