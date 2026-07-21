import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { getCurrentUser } from "@/lib/data/users";
import { logout } from "@/lib/actions/auth";

export const metadata: Metadata = { title: "My Account" };

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/account");

  return (
    <Section tone="ivory">
      <Container className="flex flex-col gap-12">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <SectionHeading eyebrow="My Account" title={user.name || user.phone} align="left" className="pb-0" />
          <form action={logout}>
            <Button type="submit" variant="secondary" size="sm">
              Sign Out
            </Button>
          </form>
        </div>

        <div className="grid gap-10 lg:grid-cols-2">
          <div className="flex flex-col gap-4">
            <span className="font-sans text-xs font-semibold uppercase tracking-[0.15em] text-ink/50">
              Profile
            </span>
            <div className="flex flex-col gap-2 border border-ink/10 p-6 font-sans text-sm text-ink">
              <div className="flex justify-between">
                <span className="text-ink/60">Mobile Number</span>
                <span>+{user.phone.replace("+", "")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink/60">Name</span>
                <span>{user.name || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink/60">Email</span>
                <span>{user.email || "—"}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <span className="font-sans text-xs font-semibold uppercase tracking-[0.15em] text-ink/50">
              Saved Addresses
            </span>
            {user.addresses.length === 0 ? (
              <p className="border border-ink/10 p-6 font-sans text-sm text-ink/50">
                No saved addresses yet. Add one at checkout to speed up your next order.
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {user.addresses.map((address) => (
                  <div key={address._id} className="border border-ink/10 p-4 font-sans text-sm text-ink">
                    <div className="flex items-center gap-2 pb-1">
                      <span className="font-semibold">{address.label}</span>
                      {address.isDefault && (
                        <span className="text-xs uppercase tracking-wide text-accent-dark">Default</span>
                      )}
                    </div>
                    <p className="text-ink/70">{address.fullName}</p>
                    <p className="text-ink/70">
                      {address.line1}
                      {address.line2 ? `, ${address.line2}` : ""}, {address.city}, {address.state}{" "}
                      {address.pincode}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <Button href="/account/orders" variant="ghost" className="w-fit">
          View Order History →
        </Button>
      </Container>
    </Section>
  );
}
