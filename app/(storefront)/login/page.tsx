import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PhoneLoginForm } from "@/components/auth/PhoneLoginForm";
import { getCurrentUser } from "@/lib/data/users";

export const metadata: Metadata = { title: "Login" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect: redirectTo } = await searchParams;
  const user = await getCurrentUser();
  if (user) redirect(redirectTo || "/account");

  return (
    <Section tone="ivory">
      <Container className="flex justify-center px-4">
        <div className="flex w-full max-w-sm flex-col gap-8">
          <SectionHeading
            eyebrow="Welcome"
            title="Sign In"
            align="left"
            className="pb-0"
          />
          <p className="-mt-4 font-sans text-sm text-ink/60">
            Enter your mobile number and we&apos;ll send a one-time code to sign you in.
          </p>
          <PhoneLoginForm redirectTo={redirectTo || "/account"} />
        </div>
      </Container>
    </Section>
  );
}
