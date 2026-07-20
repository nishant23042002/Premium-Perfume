import Image from "next/image";
import { FlaskConical } from "lucide-react";
import { getCloudinaryUrl } from "@/lib/cloudinary";
import { cn } from "@/lib/utils";

export function ProductImage({
  publicId,
  alt,
  className,
  sizes = "(min-width: 1024px) 25vw, 50vw",
}: {
  publicId: string;
  alt: string;
  className?: string;
  sizes?: string;
}) {
  const src = getCloudinaryUrl(publicId, { width: 800 });

  if (!src) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-gradient-to-br from-ivory-2 to-accent/20",
          className,
        )}
      >
        <FlaskConical className="h-10 w-10 text-secondary/25" strokeWidth={1.25} />
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <Image src={src} alt={alt} fill sizes={sizes} className="object-cover" />
    </div>
  );
}
