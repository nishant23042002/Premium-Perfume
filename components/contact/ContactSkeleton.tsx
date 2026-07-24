import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Skeleton } from "@/components/ui/Skeleton";

const DETAIL_ROWS = 4;

/** Mirrors the contact page's own shape — a left-aligned heading, a details
 * column (icon + label + value, one row per contact method), and the
 * form's real field layout (2-col name/email/phone/subject, then a taller
 * message textarea, then the submit button) — not a generic block stack. */
export function ContactSkeleton() {
  return (
    <Section tone="ivory">
      <Container className="flex flex-col gap-10 px-4 sm:gap-12">
        <div className="flex flex-col items-start gap-3">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-8 w-56 sm:h-9 sm:w-72" />
          <Skeleton className="h-4 w-full max-w-xl" />
          <Skeleton className="h-4 w-2/3 max-w-md" />
        </div>

        <div className="grid gap-10 lg:grid-cols-3 lg:gap-12">
          <div className="flex flex-col gap-6">
            {Array.from({ length: DETAIL_ROWS }).map((_, i) => (
              <div key={i} className="flex items-start gap-4">
                <Skeleton className="h-10 w-10 shrink-0" />
                <div className="flex flex-1 flex-col gap-2 pt-1">
                  <Skeleton className="h-2.5 w-14" />
                  <Skeleton className="h-4 w-36" />
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-4 lg:col-span-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-11 w-full" />
            </div>
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-13 w-36" />
          </div>
        </div>
      </Container>
    </Section>
  );
}
