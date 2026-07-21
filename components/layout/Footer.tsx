import { Leaf, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Divider } from "@/components/ui/Divider";
import { FooterLinkSection } from "@/components/layout/FooterLinkSection";
import { getNavCategories } from "@/lib/data/categories";
import { siteConfig } from "@/lib/site";

const trustPoints = [
  { icon: Truck, label: "Free shipping over ₹999" },
  { icon: RotateCcw, label: "7-day easy returns" },
  { icon: Leaf, label: "Cruelty-free & vegan" },
  { icon: ShieldCheck, label: "Dermatologically tested" },
];

const helpLinks = [
  { href: "/faq", label: "FAQ" },
  { href: "/shipping-returns", label: "Shipping & Returns" },
  { href: "/contact", label: "Contact Us" },
  { href: "/privacy-terms", label: "Privacy & Terms" },
];

export async function Footer() {
  const categories = await getNavCategories();

  return (
    <footer className="border-t border-ink/10 bg-ivory-2">
      <div className="border-b border-ink/10 py-10">
        <Container className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {trustPoints.map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-2 text-center">
              <Icon className="h-6 w-6 text-accent-dark" strokeWidth={1.5} />
              <span className="font-sans text-xs text-ink/70">{label}</span>
            </div>
          ))}
        </Container>
      </div>

      <Container className="flex flex-col gap-3 py-8 sm:grid sm:grid-cols-2 sm:gap-10 sm:py-14 lg:grid-cols-4">
        <div className="flex flex-col gap-3 pb-4 sm:pb-0">
          <span className="font-display text-xl text-secondary">{siteConfig.name}</span>
          <p className="max-w-xs font-sans text-sm text-ink/60">{siteConfig.description}</p>
        </div>

        <FooterLinkSection
          title="Shop"
          links={categories.map((category) => ({
            href: `/perfumes/${category.slug}`,
            label: category.name,
          }))}
        />

        <FooterLinkSection title="Help" links={helpLinks} />

        <FooterLinkSection title="Company" links={[{ href: "/about", label: "Our Story" }]} />
      </Container>

      <div className="py-6">
        <Container className="flex flex-col items-center gap-3 text-center">
          <Divider />
          <p className="font-sans text-xs text-ink/40">
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
        </Container>
      </div>
    </footer>
  );
}
