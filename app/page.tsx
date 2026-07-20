import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Divider } from "@/components/ui/Divider";
import { Price } from "@/components/ui/Price";
import { Rating } from "@/components/ui/Rating";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Skeleton } from "@/components/ui/Skeleton";
import { siteConfig } from "@/lib/site";

const swatches = [
  { name: "Ivory Silk", className: "bg-ivory border border-ink/10" },
  { name: "Ivory Silk 2", className: "bg-ivory-2 border border-ink/10" },
  { name: "Glowing Amber", className: "bg-accent" },
  { name: "Amber Dark", className: "bg-accent-dark" },
  { name: "Toasted Clay", className: "bg-secondary" },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      {/* Hero — light, premium gradient. No black/near-black surfaces by default. */}
      <Section
        tone="ivory"
        className="flex flex-col items-center gap-6 bg-gradient-to-b from-ivory via-ivory to-accent/10 text-center"
      >
        <Container className="flex flex-col items-center gap-6">
          <span className="font-sans text-xs uppercase tracking-[0.4em] text-accent-dark">
            Design System Preview — Phase 1
          </span>
          <h1 className="font-display text-5xl text-secondary sm:text-7xl">{siteConfig.name}</h1>
          <p className="max-w-md font-sans text-base text-ink/70">
            {siteConfig.tagline} — {siteConfig.description}
          </p>
          <Divider />
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button href="#" variant="primary" size="lg">
              Shop the Collection
            </Button>
            <Button
              href="#"
              variant="secondary"
              size="lg"
              className="border-secondary/40 text-secondary hover:border-secondary hover:bg-secondary/5 hover:text-secondary"
            >
              Our Story
            </Button>
          </div>
        </Container>
      </Section>

      {/* Typography */}
      <Section tone="ivory">
        <Container className="flex flex-col gap-10">
          <SectionHeading
            eyebrow="Typography"
            title="Display serif, clean sans"
            description="Playfair Display carries headlines and brand moments; Inter carries body copy and UI."
          />
          <div className="flex flex-col gap-4">
            <p className="font-display text-4xl">The Art of Fragrance — Aa Bb Cc</p>
            <p className="font-display text-2xl italic">A signature scent, composed for you</p>
            <p className="max-w-2xl font-sans text-base text-ink/70">
              Inter body copy — used for product descriptions, notes, ingredients, and every
              interface label across the storefront. Legible at small sizes, neutral in tone, and
              never competing with the display serif for attention.
            </p>
          </div>
        </Container>
      </Section>

      {/* Palette */}
      <Section tone="ivory-2">
        <Container className="flex flex-col gap-10">
          <SectionHeading
            eyebrow="Palette"
            title="Midnight Amber & Ochre"
            align="left"
          />
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 lg:grid-cols-5">
            {swatches.map((s) => (
              <div key={s.name} className="flex flex-col gap-2">
                <div className={`h-20 w-full ${s.className}`} />
                <span className="font-sans text-xs text-ink/60">{s.name}</span>
              </div>
            ))}
          </div>
          <p className="font-sans text-xs text-ink/40">
            A dark surface token is reserved for a possible future light/dark theme toggle — it
            isn&apos;t used anywhere in the default design.
          </p>
        </Container>
      </Section>

      {/* Components */}
      <Section tone="ivory">
        <Container className="flex flex-col gap-14">
          <SectionHeading eyebrow="Components" title="Core UI primitives" align="left" />

          <div className="flex flex-col gap-4">
            <span className="font-sans text-xs uppercase tracking-[0.2em] text-ink/50">
              Buttons
            </span>
            <div className="flex flex-wrap gap-4">
              <Button href="#" variant="primary">
                Add to Bag
              </Button>
              <Button href="#" variant="secondary">
                Notify Me
              </Button>
              <Button href="#" variant="ghost">
                View Details
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <span className="font-sans text-xs uppercase tracking-[0.2em] text-ink/50">
              Badges
            </span>
            <div className="flex flex-wrap gap-3">
              <Badge tone="accent">Bestseller</Badge>
              <Badge tone="ink">New Arrival</Badge>
              <Badge tone="secondary">Limited Edition</Badge>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <span className="font-sans text-xs uppercase tracking-[0.2em] text-ink/50">
              Price &amp; Rating
            </span>
            <div className="flex flex-wrap items-center gap-8">
              <Price value={4250} compareAtValue={5000} />
              <Rating value={4.5} count={128} />
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <span className="font-sans text-xs uppercase tracking-[0.2em] text-ink/50">
              Loading skeleton
            </span>
            <div className="flex max-w-sm flex-col gap-3">
              <Skeleton className="h-56 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        </Container>
      </Section>

      {/* Footer — light, premium */}
      <Section tone="ivory-2" className="py-10">
        <Container className="flex flex-col items-center gap-2 text-center">
          <Divider />
          <p className="font-sans text-xs uppercase tracking-[0.3em] text-ink/50">
            {siteConfig.name} — Phase 3 will replace this with the full site shell
          </p>
        </Container>
      </Section>
    </div>
  );
}
