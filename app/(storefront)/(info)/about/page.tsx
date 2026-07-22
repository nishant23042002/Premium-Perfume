import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Divider } from "@/components/ui/Divider";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Our Story",
  description: siteConfig.description,
};

const FRAGRANCES = ["AUREVAN", "VAYRÉN", "ORVÉLIS"];

export default function AboutPage() {
  return (
    <Section tone="ivory">
      <Container className="flex flex-col items-center gap-14 px-4 text-center">
        <div className="flex flex-col items-center gap-4">
          <span className="font-sans text-xs font-medium uppercase tracking-[0.35em] text-accent-dark">
            {siteConfig.name} — About
          </span>
          <h1 className="max-w-2xl font-display text-4xl leading-tight text-secondary sm:text-5xl">
            Your Scent. Your Signature.
          </h1>
          <Divider />
        </div>

        <div className="flex max-w-2xl flex-col gap-6 font-sans text-base leading-relaxed text-ink/70">
          <p>
            At {siteConfig.name}, we believe fragrance is more than something you wear. It becomes
            part of your presence — the way you feel, the way you show up, and sometimes, the way
            people remember you.
          </p>
          <p>
            We create modern fragrances for different sides of you. Fresh when you want to keep it
            effortless. Magnetic when you want to be noticed. Deep when you want to leave something
            behind.
          </p>
          <p className="font-display text-2xl text-secondary">Find the scent that feels like you.</p>
        </div>

        <div className="flex flex-col items-center gap-6">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
            {FRAGRANCES.map((name, index) => (
              <span key={name} className="flex items-center gap-x-8">
                <span className="font-display text-2xl tracking-wide text-ink sm:text-3xl">
                  {name}
                </span>
                {index < FRAGRANCES.length - 1 && (
                  <span className="hidden h-1.5 w-1.5 rotate-45 bg-accent sm:inline-block" />
                )}
              </span>
            ))}
          </div>
          <p className="font-sans text-sm uppercase tracking-[0.2em] text-ink/50">
            Three fragrances. Three moods. One signature — yours.
          </p>
        </div>

        <div className="flex flex-col items-center gap-2 border-t border-ink/10 pt-10">
          <span className="font-display text-xl text-secondary">{siteConfig.name}</span>
          <p className="font-sans text-sm text-ink/60">
            Made to be worn.
            <br />
            Made to be remembered.
          </p>
        </div>
      </Container>
    </Section>
  );
}
