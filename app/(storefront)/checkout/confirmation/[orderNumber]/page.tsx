import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Price } from "@/components/ui/Price";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getOrderByNumber } from "@/lib/data/orders";

export const metadata: Metadata = { title: "Order Confirmed" };

const PAYMENT_LABEL: Record<string, string> = {
  cod: "Cash on Delivery",
  razorpay: "Paid Online (Razorpay)",
  stripe: "Paid Online (Stripe)",
};

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const order = await getOrderByNumber(orderNumber);
  if (!order) notFound();

  return (
    <Section tone="ivory" className="min-h-[60vh]">
      <Container className="mx-auto flex max-w-2xl flex-col gap-8 px-4">
        <SectionHeading
          eyebrow="Thank You"
          title="Your order is confirmed"
          description={`Order ${order.orderNumber}`}
        />

        <div className="flex flex-col gap-4 border border-ink/10 p-6">
          {order.items.map((item) => (
            <div key={item.sku} className="flex justify-between font-sans text-sm">
              <span className="text-ink/70">
                {item.name} ({item.sizeMl}ml) × {item.quantity}
              </span>
              <Price value={item.price * item.quantity} />
            </div>
          ))}
          {order.discount > 0 && (
            <div className="flex justify-between border-t border-ink/10 pt-3 font-sans text-sm text-accent-dark">
              <span>Discount{order.couponCode ? ` (${order.couponCode})` : ""}</span>
              <span>−<Price value={order.discount} /></span>
            </div>
          )}
          <div className="flex justify-between border-t border-ink/10 pt-3 font-sans text-base font-semibold">
            <span>Total</span>
            <Price value={order.total} />
          </div>
        </div>

        <div className="flex flex-col gap-1 font-sans text-sm text-ink/70">
          <span className="font-semibold text-ink">Shipping to</span>
          <span>{order.shippingAddress.fullName}</span>
          <span>
            {order.shippingAddress.line1}
            {order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ""}
          </span>
          <span>
            {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
            {order.shippingAddress.pincode}
          </span>
          <span className="pt-2">
            Payment: {PAYMENT_LABEL[order.payment.provider ?? "cod"] ?? "Cash on Delivery"}
          </span>
        </div>

        <Button href="/perfumes" variant="primary">
          Continue Shopping
        </Button>
      </Container>
    </Section>
  );
}
