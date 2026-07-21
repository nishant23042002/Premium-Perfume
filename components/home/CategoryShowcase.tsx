import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { getCloudinaryUrl } from "@/lib/cloudinary";
import { getActiveCategoryShowcase } from "@/lib/data/categoryShowcase";

export async function CategoryShowcase() {
  const cards = await getActiveCategoryShowcase();
  if (cards.length === 0) return null;

  return (
    <Section tone="ivory-2">
      <Container>
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {cards.map((card) => {
            const url = getCloudinaryUrl(card.image.publicId, { width: 600 });
            return (
              <Link
                key={card._id}
                href={card.linkHref}
                className="group relative flex aspect-[4/5] flex-col justify-between overflow-hidden bg-ivory p-4 sm:aspect-square sm:p-5"
              >
                {url && (
                  <Image
                    src={url}
                    alt={card.image.alt}
                    fill
                    sizes="(min-width: 1024px) 25vw, 50vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
                <span className="relative z-[1] w-fit bg-ivory/90 px-3 py-1.5 font-display text-lg text-secondary sm:text-xl">
                  {card.title}
                </span>
                <span className="relative z-[1] flex h-9 w-9 items-center justify-center rounded-full bg-ivory text-ink transition-colors duration-300 group-hover:bg-accent-dark group-hover:text-ivory">
                  <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
                </span>
              </Link>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
