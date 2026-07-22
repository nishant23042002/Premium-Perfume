"use client";

import { useEffect } from "react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Section tone="ivory" className="flex min-h-[60vh] items-center">
      <Container className="flex justify-center">
        <div className="flex max-w-md flex-col items-center gap-6 text-center">
          <SectionHeading
            eyebrow="Something Went Wrong"
            title="This page hit a snag"
            description="Nothing was lost — try again, or head back to the homepage."
          />
          <div className="flex flex-wrap justify-center gap-3">
            <Button onClick={() => reset()}>Try Again</Button>
            <Button href="/" variant="secondary">
              Back to Home
            </Button>
          </div>
        </div>
      </Container>
    </Section>
  );
}
