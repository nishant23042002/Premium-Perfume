import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { CartProvider } from "@/lib/cart-context";
import { LoginModal } from "@/components/auth/LoginModal";
import { AuthModalProvider } from "@/lib/auth-modal-context";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { getCart } from "@/lib/data/cart";
import { getRecommendedProducts } from "@/lib/data/products";
import { getCurrentUser } from "@/lib/data/users";
import { siteConfig } from "@/lib/site";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [cart, recommendations, user] = await Promise.all([
    getCart(),
    getRecommendedProducts(8),
    getCurrentUser(),
  ]);

  return (
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-ivory pb-16 text-ink lg:pb-0">
        <AuthModalProvider>
          <CartProvider initialCart={cart} recommendations={recommendations}>
            <Header />
            <main className="flex flex-1 flex-col">{children}</main>
            <Footer />
            <CartDrawer />
            <MobileBottomNav isLoggedIn={Boolean(user)} />
          </CartProvider>
          <LoginModal />
        </AuthModalProvider>
      </body>
    </html>
  );
}
