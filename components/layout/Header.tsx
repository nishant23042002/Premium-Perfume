import { HeaderShell } from "@/components/layout/HeaderShell";
import { getNavCategories } from "@/lib/data/categories";
import { getCurrentUser } from "@/lib/data/users";
import { getActiveAnnouncements } from "@/lib/data/announcements";
import { getSiteLogo } from "@/lib/data/siteSettings";
import { getActiveCategoryShowcase } from "@/lib/data/categoryShowcase";
import { getRecommendedProducts } from "@/lib/data/products";

export async function Header() {
  const [categories, user, announcements, logo, categoryShowcase, featuredProducts] =
    await Promise.all([
      getNavCategories(),
      getCurrentUser(),
      getActiveAnnouncements(),
      getSiteLogo(),
      getActiveCategoryShowcase(),
      getRecommendedProducts(6),
    ]);

  return (
    <HeaderShell
      categories={categories}
      announcements={announcements}
      isLoggedIn={Boolean(user)}
      logo={logo}
      categoryShowcase={categoryShowcase}
      featuredProducts={featuredProducts}
    />
  );
}
