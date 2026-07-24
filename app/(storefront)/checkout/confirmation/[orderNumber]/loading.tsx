import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <Section tone="ivory" className="min-h-[60vh]">
      <Container className="mx-auto flex max-w-2xl flex-col gap-8 px-4">
        <div className="flex flex-col gap-3">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-8 w-72" />
        </div>
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-12 w-full" />
      </Container>
    </Section>
  );
}
