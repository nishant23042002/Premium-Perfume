"use client";

import { useActionState, useTransition } from "react";
import { ProductImage } from "@/components/ui/ProductImage";
import {
  updateOfferBannerAction,
  toggleOfferBannerActive,
  deleteOfferBanner,
  type UploadState,
} from "@/lib/actions/offerBanners";
import type { AdminOfferBanner } from "@/lib/data/offerBanners";

const initialState: UploadState = {};

const inputClass =
  "h-9 w-full border border-gray-300 bg-white px-2 text-xs text-gray-900 placeholder:text-gray-400 focus:border-gray-500 focus:outline-none";

function OfferBannerRow({ banner }: { banner: AdminOfferBanner }) {
  const [state, formAction, isPending] = useActionState(updateOfferBannerAction, initialState);
  const [isToggling, startTransition] = useTransition();

  return (
    <div className="flex flex-col gap-3 border border-gray-200 bg-white p-4 sm:flex-row sm:items-start">
      <div className="relative h-20 w-32 shrink-0 bg-gray-100">
        <ProductImage publicId={banner.image.publicId} alt={banner.image.alt} className="h-full w-full" />
      </div>

      <form action={formAction} className="grid flex-1 gap-2 sm:grid-cols-2">
        <input type="hidden" name="id" value={banner._id} />
        <input name="eyebrow" defaultValue={banner.eyebrow} placeholder="Eyebrow" className={inputClass} />
        <input
          name="title"
          defaultValue={banner.title}
          required
          placeholder="Main offer text"
          className={inputClass}
        />
        <input name="subtitle" defaultValue={banner.subtitle} placeholder="Subtitle" className={inputClass} />
        <input name="linkHref" defaultValue={banner.linkHref} placeholder="Link URL" className={inputClass} />
        <input
          name="order"
          type="number"
          defaultValue={banner.order}
          placeholder="Order"
          className={inputClass}
        />
        <input
          type="file"
          name="image"
          accept="image/*"
          className="text-xs text-gray-600 file:mr-2 file:border-0 file:bg-gray-700 file:px-2 file:py-1 file:text-[10px] file:font-medium file:uppercase file:text-white"
        />
        <div className="col-span-2 flex items-center gap-3">
          <button
            type="submit"
            disabled={isPending}
            className="border border-gray-300 px-3 py-1.5 text-xs font-medium uppercase text-gray-700 hover:bg-gray-100 disabled:opacity-50"
          >
            {isPending ? "Saving..." : "Save"}
          </button>
          {state?.error && <span className="text-xs text-red-600">{state.error}</span>}
          {state?.success && <span className="text-xs text-green-700">{state.success}</span>}
        </div>
      </form>

      <div className="flex shrink-0 items-center gap-2 sm:flex-col sm:items-stretch">
        <span
          className={
            banner.isActive
              ? "text-center text-xs font-medium uppercase text-green-700"
              : "text-center text-xs font-medium uppercase text-gray-400"
          }
        >
          {banner.isActive ? "Live" : "Hidden"}
        </span>
        <button
          type="button"
          disabled={isToggling}
          onClick={() => startTransition(() => toggleOfferBannerActive(banner._id, !banner.isActive))}
          className="border border-gray-300 px-3 py-1.5 text-xs font-medium uppercase text-gray-700 hover:bg-gray-100 disabled:opacity-50"
        >
          {banner.isActive ? "Hide" : "Show"}
        </button>
        <button
          type="button"
          disabled={isToggling}
          onClick={() => startTransition(() => deleteOfferBanner(banner._id))}
          className="border border-red-200 px-3 py-1.5 text-xs font-medium uppercase text-red-600 hover:bg-red-50 disabled:opacity-50"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export function OfferBannerList({ banners }: { banners: AdminOfferBanner[] }) {
  if (banners.length === 0) {
    return <p className="text-sm text-gray-500">No offer banners yet.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {banners.map((banner) => (
        <OfferBannerRow key={banner._id} banner={banner} />
      ))}
    </div>
  );
}
