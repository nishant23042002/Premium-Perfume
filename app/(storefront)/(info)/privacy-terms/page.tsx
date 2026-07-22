import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/misc/PlaceholderPage";

export const metadata: Metadata = { title: "Privacy & Terms" };

export default function PrivacyTermsPage() {
  return (
    <PlaceholderPage
      eyebrow="Legal"
      title="Privacy & Terms"
      note="Legal copy is pending review and will be published here before launch."
    />
  );
}
