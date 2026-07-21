"use client";

import { useActionState } from "react";
import { uploadBannerMobileImageAction, type UploadState } from "@/lib/actions/admin";

const initialState: UploadState = {};

export function BannerMobileImageForm({ bannerId, hasMobileImage }: { bannerId: string; hasMobileImage: boolean }) {
  const [state, formAction, isPending] = useActionState(uploadBannerMobileImageAction, initialState);

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="bannerId" value={bannerId} />
      <input
        type="file"
        name="mobileImage"
        accept="image/*"
        required
        className="text-xs text-gray-600 file:mr-2 file:border-0 file:bg-gray-700 file:px-2 file:py-1 file:text-[10px] file:font-medium file:uppercase file:text-white"
      />
      <button
        type="submit"
        disabled={isPending}
        className="shrink-0 border border-gray-300 px-2.5 py-1.5 text-[10px] font-medium uppercase text-gray-700 hover:bg-gray-100 disabled:opacity-50"
      >
        {isPending ? "Uploading..." : hasMobileImage ? "Replace" : "Add"}
      </button>
      {state?.error && <span className="text-[10px] text-red-600">{state.error}</span>}
      {state?.success && <span className="text-[10px] text-green-700">Saved</span>}
    </form>
  );
}
