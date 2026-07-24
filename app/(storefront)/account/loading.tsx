import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <Section tone="ivory">
      <Container className="flex flex-col gap-10 px-3">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-3">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-64" />
          </div>
          <Skeleton className="h-9 w-24" />
        </div>
        <div className="flex flex-col gap-4">
          <Skeleton className="h-10 w-full max-w-sm" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </Container>
    </Section>
  );
}
