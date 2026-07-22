import type { Metadata } from "next";
import { CreateProductForm } from "@/components/admin/CreateProductForm";
import { ProductImageUploadForm } from "@/components/admin/ProductImageUploadForm";
import { ProductImageList } from "@/components/admin/ProductImageList";
import { getProductsForAdmin } from "@/lib/data/products";
import { getNavCategories } from "@/lib/data/categories";
import { getCurrentAdmin, hasPermission } from "@/lib/data/adminUsers";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { AdminCard } from "@/components/admin/ui/AdminCard";
import { NoAccess } from "@/components/admin/NoAccess";

export const metadata: Metadata = { title: "Products", robots: { index: false, follow: false } };

export default async function AdminProductsPage() {
  const admin = await getCurrentAdmin();
  if (!hasPermission(admin, "products.view")) return <NoAccess />;
  const canManage = hasPermission(admin, "products.manage");

  const [products, categories] = await Promise.all([getProductsForAdmin(), getNavCategories()]);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Products" description="Catalog, variants, stock, and imagery." />

      {canManage && (
        <AdminCard className="p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-admin-ink-soft">
            Add Product
          </h2>
          <CreateProductForm categories={categories} />
        </AdminCard>
      )}

      <AdminCard className="p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-admin-ink-soft">
          Product Images
        </h2>
        {canManage && <ProductImageUploadForm products={products} />}
        <div className="mt-4">
          <ProductImageList products={products} />
        </div>
      </AdminCard>
    </div>
  );
}
