import Link from "next/link";
import { Play } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Price } from "@/components/ui/Price";
import { Section } from "@/components/ui/Section";
import { getDefaultVariant } from "@/lib/product";
import { getBestsellerProducts } from "@/lib/data/products";

export async function WatchAndShop() {
  const [product] = await getBestsellerProducts(1);
  if (!product) return null;

  const variant = getDefaultVariant(product.variants);

  return (
    <Section tone="ivory" className="py-0">
      <div className="relative flex min-h-[26rem] items-center justify-center overflow-hidden bg-gradient-to-br from-secondary/90 to-secondary text-ivory">
        <Container className="relative flex flex-col items-center gap-4 py-20 text-center">
          <span className="font-sans text-xs uppercase tracking-[0.35em] text-accent">
            Watch &amp; Shop
          </span>
          <h2 className="max-w-lg font-display text-3xl sm:text-4xl">
            See how it wears, before you buy
          </h2>
          <button
            type="button"
            aria-label="Play brand film"
            className="mt-2 flex h-16 w-16 items-center justify-center rounded-full bg-ivory/15 text-ivory transition-colors hover:bg-ivory/25"
          >
            <Play className="h-6 w-6 translate-x-0.5" fill="currentColor" />
          </button>
        </Container>

        <Link
          href={`/product/${product.slug}`}
          className="absolute bottom-6 right-6 flex items-center gap-3 bg-ivory px-4 py-3 text-left shadow-lg sm:bottom-8 sm:right-8"
        >
          <div className="flex flex-col">
            <span className="font-sans text-xs text-ink/50">Shop the film</span>
            <span className="font-display text-base text-secondary">{product.name}</span>
            <Price value={variant.price} className="mt-0.5" />
          </div>
        </Link>
      </div>
    </Section>
  );
}
