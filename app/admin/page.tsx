import type { Metadata } from "next";
import { BannerUploadForm } from "@/components/admin/BannerUploadForm";
import { BannerList } from "@/components/admin/BannerList";
import { CreateProductForm } from "@/components/admin/CreateProductForm";
import { ProductImageUploadForm } from "@/components/admin/ProductImageUploadForm";
import { ProductImageList } from "@/components/admin/ProductImageList";
import { getAllBanners } from "@/lib/data/banners";
import { getProductsForAdmin } from "@/lib/data/products";
import { getNavCategories } from "@/lib/data/categories";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

export default async function AdminPage() {
  const [banners, products, categories] = await Promise.all([
    getAllBanners(),
    getProductsForAdmin(),
    getNavCategories(),
  ]);

  return (
    <div className="min-h-screen bg-gray-100 py-10 font-sans text-gray-900">
      <div className="mx-auto flex max-w-4xl flex-col gap-10 px-5">
        <div className="border-b border-gray-300 pb-4">
          <h1 className="text-2xl font-bold">Vellora Admin — Temporary</h1>
          <p className="text-sm text-gray-500">
            Basic image uploads for banners and products, wired through Cloudinary into the
            database. This is a placeholder tool for visually checking content — a full admin
            panel comes later.
          </p>
        </div>

        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Homepage Banner</h2>
          <BannerUploadForm />
          <BannerList banners={banners} />
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Products</h2>
          <CreateProductForm categories={categories} />
          <ProductImageUploadForm products={products} />
          <ProductImageList products={products} />
        </section>
      </div>
    </div>
  );
}
