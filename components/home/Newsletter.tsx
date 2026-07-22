"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    // No newsletter backend yet — this just confirms intent locally.
    setSubmitted(true);
  }

  return (
    <Section tone="ivory">
      <Container className="flex px-3 flex-col items-center gap-6 text-center">
        <SectionHeading
          eyebrow="Stay in the Loop"
          title="Get 10% off your first order"
          description="Join our list for early access to new fragrances and members-only offers."
        />
        {submitted ? (
          <p className="font-sans text-sm text-accent-dark">
            Thanks — keep an eye on your inbox for your welcome offer.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex w-full max-w-md flex-col gap-3 sm:flex-row">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              className="h-11 flex-1 border border-ink/25 bg-transparent px-4 font-sans text-sm text-ink placeholder:text-ink/40 focus:border-accent-dark focus:outline-none"
            />
            <Button type="submit" variant="primary">
              Subscribe
            </Button>
          </form>
        )}
      </Container>
    </Section>
  );
}
