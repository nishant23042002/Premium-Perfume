import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FaqAccordion } from "@/components/faq/FaqAccordion";
import { getFaqs } from "@/lib/data/faqs";

export const metadata: Metadata = {
  title: "FAQ",
};

export default async function FaqPage() {
  const faqs = await getFaqs();

  return (
    <Section tone="ivory" className="min-h-[60vh]">
      <Container className="mx-auto flex max-w-2xl flex-col gap-10">
        <SectionHeading eyebrow="Support" title="Frequently Asked Questions" align="left" />
        {faqs.length > 0 ? (
          <FaqAccordion items={faqs} />
        ) : (
          <p className="font-sans text-sm text-ink/60">No questions published yet.</p>
        )}
      </Container>
    </Section>
  );
}
