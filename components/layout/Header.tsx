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
      // Same limit as the storefront layout's own getRecommendedProducts(8)
      // call — cache() only dedupes calls with matching arguments, so this
      // has to match exactly to actually share the one query instead of
      // firing a second one just for a different slice length.
      getRecommendedProducts(8),
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
