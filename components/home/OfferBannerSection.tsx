import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { getCloudinaryUrl } from "@/lib/cloudinary";
import { getActiveOfferBanners } from "@/lib/data/offerBanners";

export async function OfferBannerSection() {
  const banners = await getActiveOfferBanners();
  if (banners.length === 0) return null;

  return (
    <Section tone="ivory">
      <Container className="flex px-3 flex-col gap-6">
        {banners.map((banner) => {
          const url = getCloudinaryUrl(banner.image.publicId, { width: 1200 });
          return (
            <Link
              key={banner._id}
              href={banner.linkHref || "/perfumes"}
              className="group relative flex flex-col overflow-hidden bg-ink sm:flex-row sm:items-stretch"
            >
              <div className="relative z-[1] flex flex-1 flex-col justify-center gap-2 p-8 sm:p-12">
                {banner.eyebrow && (
                  <span className="font-sans text-xs uppercase tracking-[0.3em] text-ivory/70 sm:text-sm">
                    {banner.eyebrow}
                  </span>
                )}
                <span className="font-display text-4xl leading-none text-accent sm:text-5xl lg:text-6xl">
                  {banner.title}
                </span>
                {banner.subtitle && (
                  <span className="font-sans text-xs uppercase tracking-[0.3em] text-ivory/70 sm:text-sm">
                    {banner.subtitle}
                  </span>
                )}
              </div>

              <div className="relative h-48 w-full sm:h-auto sm:w-1/2">
                {url && (
                  <Image
                    src={url}
                    alt={banner.image.alt}
                    fill
                    sizes="(min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
              </div>
            </Link>
          );
        })}
      </Container>
    </Section>
  );
}
