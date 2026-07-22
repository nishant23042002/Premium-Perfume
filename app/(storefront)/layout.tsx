import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { CartProvider } from "@/lib/cart-context";
import { LoginModal } from "@/components/auth/LoginModal";
import { AuthModalProvider } from "@/lib/auth-modal-context";
import { CheckoutModal } from "@/components/checkout/CheckoutModal";
import { CheckoutModalProvider } from "@/lib/checkout-modal-context";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { getCart } from "@/lib/data/cart";
import { getRecommendedProducts } from "@/lib/data/products";
import { getCurrentUser } from "@/lib/data/users";
import { getActiveCategoryShowcase } from "@/lib/data/categoryShowcase";

export default async function StorefrontLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [cart, recommendations, user, categoryShowcase] = await Promise.all([
    getCart(),
    getRecommendedProducts(8),
    getCurrentUser(),
    getActiveCategoryShowcase(),
  ]);

  return (
    <div className="flex min-h-full flex-col bg-ivory pb-16 text-ink lg:pb-0">
      <AuthModalProvider>
        <CartProvider
          initialCart={cart}
          recommendations={recommendations}
          savedAddresses={user?.addresses ?? []}
          categoryShowcase={categoryShowcase}
        >
          <CheckoutModalProvider>
            <Header />
            <main className="flex flex-1 flex-col">{children}</main>
            <Footer />
            <CartDrawer />
            <CheckoutModal />
            <MobileBottomNav isLoggedIn={Boolean(user)} />
          </CheckoutModalProvider>
        </CartProvider>
        <LoginModal />
      </AuthModalProvider>
    </div>
  );
}
