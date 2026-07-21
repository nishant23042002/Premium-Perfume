import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Price } from "@/components/ui/Price";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { ProductCard } from "@/components/product/ProductCard";
import { getCart } from "@/lib/data/cart";
import { getRecommendedProducts } from "@/lib/data/products";
import { getCurrentUser } from "@/lib/data/users";

export const metadata: Metadata = { title: "Checkout" };

const FREE_SHIPPING_THRESHOLD = 999;
const SHIPPING_FEE = 99;

export default async function CheckoutPage() {
  const [cart, user] = await Promise.all([getCart(), getCurrentUser()]);
  if (cart.items.length === 0) redirect("/perfumes");

  const shippingFee = cart.subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const total = cart.subtotal + shippingFee;

  const cartProductIds = new Set(cart.items.map((item) => item.productId));
  const upsellCandidates = await getRecommendedProducts(8);
  const upsell = upsellCandidates.filter((p) => !cartProductIds.has(p._id)).slice(0, 4);

  return (
    <Section tone="ivory">
      <Container className="grid gap-12 lg:grid-cols-3">
        <div className="flex flex-col gap-14 lg:col-span-2">
          <div>
            <SectionHeading
              eyebrow="Checkout"
              title="Shipping & Payment"
              align="left"
              className="pb-8"
            />
            <CheckoutForm savedAddresses={user?.addresses ?? []} />
          </div>

          {upsell.length > 0 && (
            <div className="flex flex-col gap-6">
              <SectionHeading eyebrow="Before You Go" title="You May Also Like" align="left" />
              <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
                {upsell.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex h-fit flex-col gap-4 border border-ink/10 p-6">
          <span className="font-sans text-xs font-semibold uppercase tracking-[0.15em] text-ink/50">
            Order Summary
          </span>
          {cart.items.map(
            (item) =>
              item.product && (
                <div key={item.sku} className="flex justify-between font-sans text-sm">
                  <span className="text-ink/70">
                    {item.product.name} × {item.quantity}
                  </span>
                  <Price value={item.priceSnapshot * item.quantity} />
                </div>
              ),
          )}
          <div className="flex justify-between border-t border-ink/10 pt-3 font-sans text-sm">
            <span className="text-ink/60">Subtotal</span>
            <Price value={cart.subtotal} />
          </div>
          <div className="flex justify-between font-sans text-sm">
            <span className="text-ink/60">Shipping</span>
            {shippingFee === 0 ? (
              <span className="text-accent-dark">Free</span>
            ) : (
              <Price value={shippingFee} />
            )}
          </div>
          <div className="flex justify-between border-t border-ink/10 pt-3 font-sans text-base font-semibold">
            <span>Total</span>
            <Price value={total} />
          </div>
        </div>
      </Container>
    </Section>
  );
}
