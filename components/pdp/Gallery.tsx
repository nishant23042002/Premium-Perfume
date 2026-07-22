"use client";

import { useState } from "react";
import { ProductImage } from "@/components/ui/ProductImage";
import { cn } from "@/lib/utils";

export function Gallery({ images }: { images: { publicId: string; alt: string }[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = images[activeIndex];

  return (
    <div className="flex flex-col gap-3">
      <ProductImage
        publicId={active.publicId}
        alt={active.alt}
        className="aspect-square w-full sm:aspect-[4/5]"
        sizes="(min-width: 1024px) 40vw, 100vw"
      />
      {images.length > 1 && (
        <div className="flex gap-3">
          {images.map((image, i) => (
            <button
              key={image.publicId}
              type="button"
              onClick={() => setActiveIndex(i)}
              aria-label={`View image ${i + 1} of ${images.length}`}
              aria-pressed={i === activeIndex}
              className={cn(
                "h-20 w-16 overflow-hidden border-2 transition-colors",
                i === activeIndex ? "border-accent-dark" : "border-transparent",
              )}
            >
              <ProductImage publicId={image.publicId} alt="" className="h-full w-full" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
