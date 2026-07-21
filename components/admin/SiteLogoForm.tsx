"use client";

import { useActionState, useTransition } from "react";
import { ProductImage } from "@/components/ui/ProductImage";
import { uploadSiteLogoAction, removeSiteLogo, type UploadState } from "@/lib/actions/siteSettings";
import type { SiteLogo } from "@/lib/data/siteSettings";

const initialState: UploadState = {};

const inputClass =
  "h-10 w-full border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-500 focus:outline-none";

export function SiteLogoForm({ logo }: { logo: SiteLogo | null }) {
  const [state, formAction, isPending] = useActionState(uploadSiteLogoAction, initialState);
  const [isRemoving, startTransition] = useTransition();

  return (
    <div className="flex flex-col gap-4 border border-gray-200 bg-gray-50 p-5">
      <h3 className="font-semibold text-gray-900">Site Logo</h3>
      <p className="text-xs text-gray-500">
        Shown in the header in place of the text wordmark. Uploads are automatically scaled to fit
        — a wide horizontal logo (e.g. 400×120) works best.
      </p>

      {logo && (
        <div className="flex items-center gap-4 border border-gray-200 bg-white p-3">
          <div className="relative h-12 w-32 shrink-0 bg-gray-100">
            <ProductImage publicId={logo.publicId} alt={logo.alt} className="h-full w-full" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-gray-700">Current logo</span>
            <button
              type="button"
              disabled={isRemoving}
              onClick={() => startTransition(() => removeSiteLogo())}
              className="w-fit border border-red-200 px-3 py-1.5 text-xs font-medium uppercase text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              {isRemoving ? "Removing..." : "Remove (use text wordmark)"}
            </button>
          </div>
        </div>
      )}

      <form action={formAction} className="flex flex-col gap-3">
        <input name="alt" placeholder="Alt text (optional)" className={inputClass} />
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
          {isPending ? "Uploading..." : logo ? "Replace Logo" : "Upload Logo"}
        </button>
      </form>
    </div>
  );
}
