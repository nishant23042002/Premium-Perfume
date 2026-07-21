"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Store, ShoppingBag, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/lib/cart-context";
import { useAuthModal } from "@/lib/auth-modal-context";

export function MobileBottomNav({ isLoggedIn }: { isLoggedIn: boolean }) {
  const pathname = usePathname();
  const { cart, isOpen, openCart } = useCart();
  const { openLogin } = useAuthModal();

  const isHome = pathname === "/";
  const isShop =
    pathname.startsWith("/perfumes") ||
    pathname.startsWith("/collections") ||
    pathname.startsWith("/product");
  const isAccount = pathname.startsWith("/account");

  const itemClass = (active: boolean) =>
    cn(
      "flex flex-1 flex-col items-center justify-center gap-1 py-2.5 font-sans text-[10px] font-medium uppercase tracking-wide transition-colors",
      active ? "text-accent-dark" : "text-ink/60 hover:text-ink",
    );

  return (
    <nav
      aria-label="Mobile quick navigation"
      className="fixed inset-x-0 bottom-0 z-40 flex border-t border-ink/10 bg-ivory/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
    >
      <Link href="/" className={itemClass(isHome)}>
        <Home className="h-5 w-5" strokeWidth={1.5} />
        Home
      </Link>

      <Link href="/perfumes" className={itemClass(isShop)}>
        <Store className="h-5 w-5" strokeWidth={1.5} />
        Shop
      </Link>

      <button type="button" onClick={openCart} className={cn(itemClass(isOpen), "relative")}>
        <span className="relative">
          <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
          {cart.itemCount > 0 && (
            <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-secondary px-1 font-sans text-[9px] font-medium text-ivory">
              {cart.itemCount}
            </span>
          )}
        </span>
        Cart
      </button>

      {isLoggedIn ? (
        <Link href="/account" className={itemClass(isAccount)}>
          <User className="h-5 w-5" strokeWidth={1.5} />
          Account
        </Link>
      ) : (
        <button type="button" onClick={openLogin} className={itemClass(false)}>
          <User className="h-5 w-5" strokeWidth={1.5} />
          Sign In
        </button>
      )}
    </nav>
  );
}
