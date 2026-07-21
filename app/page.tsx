import { Hero } from "@/components/home/Hero";
import { USPStrip } from "@/components/home/USPStrip";
import { NewArrivals } from "@/components/home/NewArrivals";
import { CategoryShowcase } from "@/components/home/CategoryShowcase";
import { OfferBannerSection } from "@/components/home/OfferBannerSection";
import { WhyBrand } from "@/components/home/WhyBrand";
import { WatchAndShop } from "@/components/home/WatchAndShop";
import { Testimonials } from "@/components/home/Testimonials";
import { Newsletter } from "@/components/home/Newsletter";

export default function Home() {
  return (
    <>
      <Hero />
      <USPStrip />
      <NewArrivals />
      <CategoryShowcase />
      <OfferBannerSection />
      <WhyBrand />
      <WatchAndShop />
      <Testimonials />
      <Newsletter />
    </>
  );
}
