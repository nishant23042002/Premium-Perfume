import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Price } from "@/components/ui/Price";
import { getCurrentUser } from "@/lib/data/users";
import { getOrdersByUserId } from "@/lib/data/orders";

export const metadata: Metadata = { title: "Order History" };

const statusLabel: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

export default async function OrderHistoryPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/account/orders");

  const orders = await getOrdersByUserId(user.id);

  return (
    <Section tone="ivory">
      <Container className="flex flex-col gap-8">
        <SectionHeading eyebrow="My Account" title="Order History" align="left" className="pb-0" />

        {orders.length === 0 ? (
          <p className="font-sans text-sm text-ink/50">
            You haven&apos;t placed any orders yet.{" "}
            <Link href="/perfumes" className="text-accent-dark underline underline-offset-4">
              Start shopping
            </Link>
            .
          </p>
        ) : (
          <div className="flex flex-col divide-y divide-ink/10 border-t border-ink/10">
            {orders.map((order) => (
              <Link
                key={order.orderNumber}
                href={`/checkout/confirmation/${order.orderNumber}`}
                className="flex flex-wrap items-center justify-between gap-3 py-5 font-sans text-sm hover:bg-ivory-2"
              >
                <div className="flex flex-col gap-1">
                  <span className="font-semibold text-ink">#{order.orderNumber}</span>
                  <span className="text-ink/50">
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}{" "}
                    · {order.itemCount} item{order.itemCount === 1 ? "" : "s"}
                  </span>
                </div>
                <div className="flex items-center gap-6">
                  <span className="text-xs uppercase tracking-[0.1em] text-accent-dark">
                    {statusLabel[order.status] ?? order.status}
                  </span>
                  <Price value={order.total} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </Container>
    </Section>
  );
}
