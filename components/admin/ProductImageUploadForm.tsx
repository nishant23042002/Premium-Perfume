"use client";

import { useActionState } from "react";
import { uploadProductImageAction, type UploadState } from "@/lib/actions/admin";
import type { AdminProduct } from "@/lib/data/products";

const initialState: UploadState = {};

const inputClass =
  "h-10 w-full border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-500 focus:outline-none";

export function ProductImageUploadForm({ products }: { products: AdminProduct[] }) {
  const [state, formAction, isPending] = useActionState(uploadProductImageAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4 border border-gray-200 bg-gray-50 p-5">
      <h3 className="font-semibold text-gray-900">Upload Product Image</h3>
      <p className="text-xs text-gray-500">
        The new image becomes the primary photo shown on cards and the product page.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        <select name="productId" required className={inputClass} defaultValue="">
          <option value="" disabled>
            Choose a product
          </option>
          {products.map((product) => (
            <option key={product._id} value={product._id}>
              {product.name}
            </option>
          ))}
        </select>
        <input name="alt" required placeholder="Alt text (required)" className={inputClass} />
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
        {isPending ? "Uploading..." : "Upload Image"}
      </button>
    </form>
  );
}
