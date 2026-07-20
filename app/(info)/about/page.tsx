import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/misc/PlaceholderPage";

export const metadata: Metadata = { title: "Our Story" };

export default function AboutPage() {
  return (
    <PlaceholderPage
      eyebrow="Company"
      title="Our Story"
      note="Full brand story content is being finalized and will publish here."
    />
  );
}
