import { Leaf, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";

const points = [
  { icon: Truck, label: "Free Shipping", detail: "On orders over ₹999" },
  { icon: RotateCcw, label: "Easy Returns", detail: "7-day return window" },
  { icon: Leaf, label: "Cruelty-Free", detail: "Never tested on animals" },
  { icon: ShieldCheck, label: "Dermatologically Tested", detail: "Safe for daily wear" },
];

export function USPStrip() {
  return (
    <Section tone="ivory-2" className="py-10 sm:py-12">
      <Container className="grid grid-cols-2 gap-x-6 gap-y-8 px-3 sm:gap-8 lg:grid-cols-4">
        {points.map(({ icon: Icon, label, detail }) => (
          <div key={label} className="flex flex-col items-center gap-2 text-center">
            <Icon className="h-7 w-7 text-accent-dark" strokeWidth={1.5} />
            <span className="font-sans text-sm font-medium text-ink">{label}</span>
            <span className="font-sans text-xs text-ink/50">{detail}</span>
          </div>
        ))}
      </Container>
    </Section>
  );
}
