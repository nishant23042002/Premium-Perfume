import { Hero } from "@/components/home/Hero";
import { USPStrip } from "@/components/home/USPStrip";
import { BestSellers } from "@/components/home/BestSellers";
import { WhyBrand } from "@/components/home/WhyBrand";
import { WatchAndShop } from "@/components/home/WatchAndShop";
import { Testimonials } from "@/components/home/Testimonials";
import { Newsletter } from "@/components/home/Newsletter";

export default function Home() {
  return (
    <>
      <Hero />
      <USPStrip />
      <BestSellers />
      <WhyBrand />
      <WatchAndShop />
      <Testimonials />
      <Newsletter />
    </>
  );
}
