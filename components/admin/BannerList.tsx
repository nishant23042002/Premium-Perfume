"use client";

import { useTransition } from "react";
import { ProductImage } from "@/components/ui/ProductImage";
import { BannerMobileImageForm } from "@/components/admin/BannerMobileImageForm";
import { toggleBannerActive, deleteBanner } from "@/lib/actions/admin";
import type { AdminBanner } from "@/lib/data/banners";

export function BannerList({ banners }: { banners: AdminBanner[] }) {
  const [isPending, startTransition] = useTransition();

  if (banners.length === 0) {
    return <p className="text-sm text-gray-500">No banners uploaded yet.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {banners.map((banner) => {
        const hasMobileImage = Boolean(banner.mobileImage?.publicId);
        return (
          <div key={banner._id} className="flex flex-col gap-3 border border-gray-200 bg-white p-4">
            <div className="flex items-center gap-4">
              <div className="flex shrink-0 gap-2">
                <div className="relative h-16 w-28 bg-gray-100">
                  <ProductImage publicId={banner.image.publicId} alt={banner.image.alt} className="h-full w-full" />
                </div>
                <div className="relative h-16 w-10 bg-gray-100">
                  {hasMobileImage ? (
                    <ProductImage
                      publicId={banner.mobileImage!.publicId}
                      alt={banner.mobileImage!.alt}
                      className="h-full w-full"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-center text-[9px] leading-tight text-gray-400">
                      No mobile crop
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{banner.title || "(no title)"}</p>
                <p className="text-xs text-gray-500">{banner.image.alt}</p>
                <p className="text-xs text-gray-400">Order: {banner.order}</p>
              </div>
              <span
                className={
                  banner.isActive
                    ? "px-2 py-1 text-xs font-medium uppercase text-green-700"
                    : "px-2 py-1 text-xs font-medium uppercase text-gray-400"
                }
              >
                {banner.isActive ? "Live" : "Hidden"}
              </span>
              <button
                type="button"
                disabled={isPending}
                onClick={() => startTransition(() => toggleBannerActive(banner._id, !banner.isActive))}
                className="border border-gray-300 px-3 py-1.5 text-xs font-medium uppercase text-gray-700 hover:bg-gray-100 disabled:opacity-50"
              >
                {banner.isActive ? "Hide" : "Show"}
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => startTransition(() => deleteBanner(banner._id))}
                className="border border-red-200 px-3 py-1.5 text-xs font-medium uppercase text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                Delete
              </button>
            </div>

            <div className="flex items-center gap-2 border-t border-gray-100 pt-3">
              <span className="text-[10px] font-medium uppercase tracking-wide text-gray-500">
                Mobile crop
              </span>
              <BannerMobileImageForm bannerId={banner._id} hasMobileImage={hasMobileImage} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
