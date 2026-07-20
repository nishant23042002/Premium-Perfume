import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Divider } from "@/components/ui/Divider";
import { Section } from "@/components/ui/Section";
import { siteConfig } from "@/lib/site";

export function Hero() {
  return (
    <Section
      tone="ivory"
      className="flex flex-col items-center gap-6 bg-gradient-to-b from-ivory via-ivory to-accent/10 text-center"
    >
      <Container className="flex flex-col items-center gap-6">
        <span className="font-sans text-xs uppercase tracking-[0.4em] text-accent-dark">
          Crafted in small batches
        </span>
        <h1 className="max-w-2xl font-display text-5xl text-secondary sm:text-7xl">
          {siteConfig.tagline}
        </h1>
        <p className="max-w-md font-sans text-base text-ink/70">{siteConfig.description}</p>
        <Divider />
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button href="/perfumes" variant="primary" size="lg">
            Shop the Collection
          </Button>
          <Button
            href="/about"
            variant="secondary"
            size="lg"
            className="border-secondary/40 text-secondary hover:border-secondary hover:bg-secondary/5 hover:text-secondary"
          >
            Our Story
          </Button>
        </div>
      </Container>
    </Section>
  );
}
