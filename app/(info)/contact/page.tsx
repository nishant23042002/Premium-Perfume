import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/misc/PlaceholderPage";

export const metadata: Metadata = { title: "Contact Us" };

export default function ContactPage() {
  return (
    <PlaceholderPage
      eyebrow="Support"
      title="Contact Us"
      note="A contact form and support details will be added here."
    />
  );
}
