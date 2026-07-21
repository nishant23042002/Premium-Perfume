"use client";

import { useActionState } from "react";
import { uploadBannerAction, type UploadState } from "@/lib/actions/admin";

const initialState: UploadState = {};

const inputClass =
  "h-10 w-full border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-500 focus:outline-none";

export function BannerUploadForm() {
  const [state, formAction, isPending] = useActionState(uploadBannerAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4 border border-gray-200 bg-gray-50 p-5">
      <h3 className="font-semibold text-gray-900">Upload Homepage Banner</h3>
      <p className="text-xs text-gray-500">
        Recommended: wide image (e.g. 1920×960 or similar). It becomes the live hero backdrop
        immediately.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        <input name="title" placeholder="Title (optional)" className={inputClass} />
        <input name="subtitle" placeholder="Subtitle (optional)" className={inputClass} />
        <input name="linkHref" placeholder="Link URL (optional)" className={inputClass} />
        <input
          name="alt"
          required
          placeholder="Alt text (required)"
          className={inputClass}
        />
        <input
          name="order"
          type="number"
          placeholder="Slide order (optional, default 0)"
          className={inputClass}
        />
      </div>
      <p className="text-xs text-gray-500">
        Multiple active banners auto-rotate as a carousel every 5 seconds, ordered by this number
        (lowest first).
      </p>

      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium text-gray-700">
          Desktop image (required) — recommended 1920×960 (2:1)
        </span>
        <input
          type="file"
          name="image"
          accept="image/*"
          required
          className="text-sm text-gray-700 file:mr-3 file:border-0 file:bg-gray-900 file:px-3 file:py-2 file:text-xs file:font-medium file:uppercase file:text-white"
        />
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium text-gray-700">
          Mobile image (optional — shown on phones instead of the desktop image above) —
          recommended 1080×1350 (4:5)
        </span>
        <input
          type="file"
          name="mobileImage"
          accept="image/*"
          className="text-sm text-gray-700 file:mr-3 file:border-0 file:bg-gray-900 file:px-3 file:py-2 file:text-xs file:font-medium file:uppercase file:text-white"
        />
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.success && <p className="text-sm text-green-700">{state.success}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="w-fit bg-gray-900 px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-white disabled:opacity-50"
      >
        {isPending ? "Uploading..." : "Upload Banner"}
      </button>
    </form>
  );
}
