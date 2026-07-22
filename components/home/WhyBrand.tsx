import { FlaskConical } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Divider } from "@/components/ui/Divider";
import { Section } from "@/components/ui/Section";
import { siteConfig } from "@/lib/site";

const pillars = [
  {
    title: "Considered Sourcing",
    body: "Every note is chosen for quality and longevity, not just cost — sourced from growers we've worked with for years.",
  },
  {
    title: "Small-Batch Craft",
    body: "Compounded and rested in small batches so every bottle carries the full depth of its composition.",
  },
  {
    title: "Made for India",
    body: "Formulated to perform in Indian heat and humidity — long-lasting from morning meetings to evening plans.",
  },
];

export function WhyBrand() {
  return (
    <Section tone="ivory">
      <Container className="grid px-3 gap-12 lg:grid-cols-2 lg:items-center">
        <div className="flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-ivory to-secondary/10">
          
          <FlaskConical className="h-16 w-16 text-secondary/25" strokeWidth={1} />
        </div>

        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <span className="font-sans text-xs font-medium uppercase tracking-[0.25em] text-accent-dark">
              Why {siteConfig.name}
            </span>
            <h2 className="font-display text-3xl leading-tight sm:text-4xl">
              Fragrance built to last a day, not an hour
            </h2>
          </div>
          <Divider className="justify-start" />
          <div className="flex flex-col gap-6">
            {pillars.map((pillar) => (
              <div key={pillar.title} className="flex flex-col gap-1">
                <h3 className="font-sans text-sm font-semibold uppercase tracking-[0.08em] text-ink">
                  {pillar.title}
                </h3>
                <p className="font-sans text-sm text-ink/65">{pillar.body}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
