"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { getCloudinaryUrl } from "@/lib/cloudinary";
import { siteConfig } from "@/lib/site";
import type { ActiveBanner } from "@/lib/data/banners";

const AUTO_ADVANCE_MS = 5000;

export function HeroCarousel({ slides }: { slides: ActiveBanner[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const goTo = useCallback(
    (index: number) => {
      setActiveIndex((index + slides.length) % slides.length);
    },
    [slides.length],
  );

  useEffect(() => {
    if (slides.length <= 1 || isPaused) return;
    const id = setInterval(() => {
      setActiveIndex((i) => (i + 1) % slides.length);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(id);
  }, [slides.length, isPaused]);

  useEffect(() => {
    function handleVisibility() {
      setIsPaused(document.hidden);
    }
    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  const active = slides[activeIndex];

  return (
    <section
      // Aspect-ratio driven instead of fixed min-heights — the banner scales
      // proportionally with viewport width at every breakpoint (portrait on
      // phones, matching the admin's recommended upload ratio on desktop)
      // instead of stretching a fixed-height box across whatever width the
      // screen happens to be.
      className="relative flex aspect-[4/5] max-h-[720px] flex-col items-stretch justify-start overflow-hidden bg-ivory sm:aspect-[3/2] sm:justify-center lg:aspect-[21/9]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {slides.map((slide, index) => {
        const desktopUrl = getCloudinaryUrl(slide.image.publicId, { width: 1920 });
        const mobileSource = slide.mobileImage?.publicId ? slide.mobileImage : slide.image;
        const mobileUrl = getCloudinaryUrl(mobileSource.publicId, { width: 960 });
        if (!desktopUrl || !mobileUrl) return null;
        const isActive = index === activeIndex;
        return (
          <div
            key={slide._id}
            aria-hidden={!isActive}
            className={cn(
              "absolute inset-0 transition-opacity duration-1000 ease-in-out",
              isActive ? "opacity-100" : "opacity-0",
            )}
          >
            {/* Art-directed crop swap: a dedicated mobile image (falling back
                to the desktop one if none was uploaded) below the `sm`
                breakpoint, the wide desktop image above it. */}
            <div className="absolute inset-0 sm:hidden">
              <Image
                src={mobileUrl}
                alt={mobileSource.alt}
                fill
                priority={index === 0}
                sizes="100vw"
                className={cn("object-cover", isActive && "animate-kenburns")}
              />
            </div>
            <div className="absolute inset-0 hidden sm:block">
              <Image
                src={desktopUrl}
                alt={slide.image.alt}
                fill
                priority={index === 0}
                sizes="100vw"
                className={cn("object-cover", isActive && "animate-kenburns")}
              />
            </div>
          </div>
        );
      })}

      {/* Soft directional scrim, not a card — fades to fully transparent, so
          the product stays visible everywhere except this thin edge. Text
          sits directly on the photo (shadowed for legibility), it doesn't
          sit in a boxed panel. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink/55 via-ink/15 to-transparent sm:bg-gradient-to-r sm:from-ink/50 sm:via-ink/10 sm:to-transparent"
      />

      <Container className="relative z-[1] flex flex-1 flex-col justify-start px-4 pt-6 pb-8 sm:flex-none sm:justify-center sm:py-0">
        <div className="mx-auto flex max-w-[13rem] flex-col items-center text-center sm:mx-0 sm:max-w-md sm:items-start sm:text-left">
          <span
            key={`subtitle-${active._id}`}
            className="animate-fade-in text-shadow-banner font-sans text-[9px] uppercase tracking-[0.2em] text-ivory sm:text-xs sm:tracking-[0.35em]"
          >
            {active.subtitle || "Crafted in small batches"}
          </span>
          <h1
            key={`title-${active._id}`}
            className="animate-fade-in text-shadow-banner mt-0.5 font-display text-2xl leading-tight text-ivory sm:mt-3 sm:text-5xl"
          >
            {active.title || siteConfig.tagline}
          </h1>
          {active.linkHref && (
            <div className="hidden sm:block">
              <Button
                key={`cta-${active._id}`}
                href={active.linkHref}
                variant="primary"
                size="sm"
                className="animate-fade-in mt-3 sm:mt-5"
              >
                Shop Now
              </Button>
            </div>
          )}
        </div>
      </Container>

      {/* Mobile only — the same CTA, re-anchored to the bottom-center of the
          banner instead of sitting inline under the headline. Desktop keeps
          the button above unchanged (hidden here via the sm:hidden wrapper). */}
      {active.linkHref && (
        <div className="absolute bottom-8 left-1/2 z-[1] -translate-x-1/2 sm:hidden">
          <Button
            key={`cta-mobile-${active._id}`}
            href={active.linkHref}
            variant="primary"
            size="sm"
            className="animate-fade-in"
          >
            Shop Now
          </Button>
        </div>
      )}

      {slides.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous slide"
            onClick={() => goTo(activeIndex - 1)}
            className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center border border-ivory/30 bg-ink/30 text-ivory backdrop-blur transition-colors hover:bg-ink/50 sm:left-6"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Next slide"
            onClick={() => goTo(activeIndex + 1)}
            className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center border border-ivory/30 bg-ink/30 text-ivory backdrop-blur transition-colors hover:bg-ink/50 sm:right-6"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2">
            {slides.map((slide, index) => (
              <button
                key={slide._id}
                type="button"
                aria-label={`Go to slide ${index + 1}`}
                aria-current={index === activeIndex}
                onClick={() => goTo(index)}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  index === activeIndex
                    ? "w-6 bg-accent"
                    : "w-1.5 bg-ivory/50 hover:bg-ivory/70",
                )}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
