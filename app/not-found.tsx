import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Page Not Found" };

export default function NotFound() {
  return (
    <Section tone="ivory" className="flex min-h-[60vh] items-center">
      <Container className="flex justify-center px-4">
        <div className="flex max-w-md flex-col items-center gap-6 text-center">
          <span className="font-display text-6xl text-accent-dark">404</span>
          <SectionHeading
            eyebrow="Lost Your Way"
            title="We couldn't find that page"
            description="The link may be broken, or the page may have moved. Let's get you back to the collection."
          />
          <div className="flex flex-wrap justify-center gap-3">
            <Button href="/">Back to Home</Button>
            <Button href="/perfumes" variant="secondary">
              Shop Perfumes
            </Button>
          </div>
        </div>
      </Container>
    </Section>
  );
}
