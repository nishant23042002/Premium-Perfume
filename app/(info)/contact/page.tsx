import type { Metadata } from "next";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ContactForm } from "@/components/contact/ContactForm";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with the THE RARESKIN team for order support, product questions, or general enquiries.",
};

const contactDetails = [
  {
    icon: Mail,
    label: "Email",
    value: "support@therareskin.in",
    href: "mailto:support@therareskin.in",
  },
  {
    icon: Phone,
    label: "Phone",
    value: "+91 98765 43210",
    href: "tel:+919876543210",
  },
  {
    icon: MapPin,
    label: "Studio",
    value: "Bandra Kurla Complex, Mumbai, Maharashtra 400051",
  },
  {
    icon: Clock,
    label: "Support Hours",
    value: "Mon – Sat, 10 AM – 7 PM IST",
  },
];

export default function ContactPage() {
  return (
    <Section tone="ivory">
      <Container className="flex flex-col gap-10 sm:gap-12">
        <SectionHeading
          eyebrow="Support"
          title="Get In Touch"
          description="Questions about an order, a fragrance, or anything else? We'd love to hear from you — our team typically replies within 1-2 business days."
          align="left"
        />

        <div className="grid gap-10 lg:grid-cols-3 lg:gap-12">
          <div className="flex flex-col gap-6">
            {contactDetails.map(({ icon: Icon, label, value, href }) => (
              <div key={label} className="flex items-start gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-accent-dark/30 bg-accent/10 text-accent-dark">
                  <Icon className="h-4 w-4" strokeWidth={1.5} />
                </span>
                <div className="flex flex-col">
                  <span className="font-sans text-xs font-semibold uppercase tracking-[0.15em] text-ink/50">
                    {label}
                  </span>
                  {href ? (
                    <a href={href} className="font-sans text-sm text-ink hover:text-accent-dark">
                      {value}
                    </a>
                  ) : (
                    <span className="font-sans text-sm text-ink/80">{value}</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-2">
            <ContactForm />
          </div>
        </div>
      </Container>
    </Section>
  );
}
