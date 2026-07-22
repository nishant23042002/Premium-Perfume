import type { Metadata } from "next";
import { getCurrentAdmin, hasPermission } from "@/lib/data/adminUsers";
import { getAllCategoriesForAdmin } from "@/lib/data/categories";
import { getAllCollectionsForAdmin } from "@/lib/data/collections";
import { CategoryForm } from "@/components/admin/categories/CategoryForm";
import { CategoryList } from "@/components/admin/categories/CategoryList";
import { CollectionForm } from "@/components/admin/categories/CollectionForm";
import { CollectionList } from "@/components/admin/categories/CollectionList";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { AdminCard } from "@/components/admin/ui/AdminCard";
import { NoAccess } from "@/components/admin/NoAccess";

export const metadata: Metadata = { title: "Categories", robots: { index: false, follow: false } };

export default async function AdminCategoriesPage() {
  const admin = await getCurrentAdmin();
  if (!hasPermission(admin, "categories.manage")) return <NoAccess />;

  const [categories, collections] = await Promise.all([
    getAllCategoriesForAdmin(),
    getAllCollectionsForAdmin(),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Categories & Collections" description="Site taxonomy and curated product groups." />

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-admin-ink-soft">Categories</h2>
        <AdminCard className="mb-4 p-5">
          <CategoryForm />
        </AdminCard>
        <CategoryList categories={categories} />
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-admin-ink-soft">Collections</h2>
        <AdminCard className="mb-4 p-5">
          <CollectionForm />
        </AdminCard>
        <CollectionList collections={collections} />
      </div>
    </div>
  );
}
