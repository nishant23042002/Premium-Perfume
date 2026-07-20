import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/misc/PlaceholderPage";

export const metadata: Metadata = { title: "Shipping & Returns" };

export default function ShippingReturnsPage() {
  return (
    <PlaceholderPage
      eyebrow="Support"
      title="Shipping & Returns"
      note="Full shipping timelines and the return process will be documented here."
    />
  );
}
