import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { getCurrentUser } from "@/lib/data/users";
import { getOrdersByUserId } from "@/lib/data/orders";
import { logout } from "@/lib/actions/auth";
import { AccountTabs } from "@/components/account/AccountTabs";

export const metadata: Metadata = { title: "My Account" };

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; placed?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/account");

  const { tab, placed } = await searchParams;
  const orders = await getOrdersByUserId(user.id);
  const initialTab = tab === "address" || tab === "orders" ? tab : "profile";

  return (
    <Section tone="ivory">
      <Container className="flex flex-col gap-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <SectionHeading
            eyebrow="My Account"
            title={`Welcome, ${user.name || user.phone}`}
            align="left"
            className="pb-0"
          />
          <form action={logout}>
            <Button type="submit" variant="secondary" size="sm">
              Sign Out
            </Button>
          </form>
        </div>

        <AccountTabs user={user} orders={orders} initialTab={initialTab} justPlaced={placed} />
      </Container>
    </Section>
  );
}
