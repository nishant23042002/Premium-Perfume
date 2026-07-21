import { HeaderShell } from "@/components/layout/HeaderShell";
import { getNavCategories } from "@/lib/data/categories";
import { getCurrentUser } from "@/lib/data/users";
import { getActiveAnnouncements } from "@/lib/data/announcements";

export async function Header() {
  const [categories, user, announcements] = await Promise.all([
    getNavCategories(),
    getCurrentUser(),
    getActiveAnnouncements(),
  ]);

  return (
    <HeaderShell
      categories={categories}
      announcements={announcements}
      isLoggedIn={Boolean(user)}
    />
  );
}
