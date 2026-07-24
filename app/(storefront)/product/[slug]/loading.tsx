import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <Section tone="ivory">
      <Container className="flex flex-col gap-10 px-4 sm:gap-16">
        <Skeleton className="h-4 w-64" />
        <div className="grid gap-8 sm:gap-10 lg:grid-cols-2 lg:items-start lg:gap-12">
          <Skeleton className="aspect-square w-full sm:aspect-[4/5]" />
          <div className="flex flex-col gap-6">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-48" />
          </div>
        </div>
      </Container>
    </Section>
  );
}
