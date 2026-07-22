import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function PlaceholderPage({
  eyebrow,
  title,
  note,
}: {
  eyebrow: string;
  title: string;
  note: string;
}) {
  return (
    <Section tone="ivory" className="min-h-[50vh]">
      <Container className="mx-auto flex max-w-2xl flex-col gap-4 px-4 text-center">
        <SectionHeading eyebrow={eyebrow} title={title} />
        <p className="font-sans text-sm text-ink/50">{note}</p>
      </Container>
    </Section>
  );
}
