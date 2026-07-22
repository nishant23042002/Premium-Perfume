import type { Metadata } from "next";
import { BannerUploadForm } from "@/components/admin/BannerUploadForm";
import { BannerList } from "@/components/admin/BannerList";
import { CategoryShowcaseForm } from "@/components/admin/CategoryShowcaseForm";
import { CategoryShowcaseList } from "@/components/admin/CategoryShowcaseList";
import { OfferBannerForm } from "@/components/admin/OfferBannerForm";
import { OfferBannerList } from "@/components/admin/OfferBannerList";
import { SiteLogoForm } from "@/components/admin/SiteLogoForm";
import { getAllBanners } from "@/lib/data/banners";
import { getAllCategoryShowcase } from "@/lib/data/categoryShowcase";
import { getAllOfferBanners } from "@/lib/data/offerBanners";
import { getSiteLogo } from "@/lib/data/siteSettings";
import { getCurrentAdmin, hasPermission } from "@/lib/data/adminUsers";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { AdminCard } from "@/components/admin/ui/AdminCard";
import { NoAccess } from "@/components/admin/NoAccess";

export const metadata: Metadata = { title: "Content", robots: { index: false, follow: false } };

export default async function AdminContentPage() {
  const admin = await getCurrentAdmin();
  if (!hasPermission(admin, "content.manage")) return <NoAccess />;

  const [banners, categoryShowcase, offerBanners, logo] = await Promise.all([
    getAllBanners(),
    getAllCategoryShowcase(),
    getAllOfferBanners(),
    getSiteLogo(),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Content" description="Homepage banners, category showcase, offers, and branding." />

      <AdminCard className="p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-admin-ink-soft">Branding</h2>
        <SiteLogoForm logo={logo} />
      </AdminCard>

      <AdminCard className="p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-admin-ink-soft">
          Homepage Banner
        </h2>
        <BannerUploadForm />
        <div className="mt-4">
          <BannerList banners={banners} />
        </div>
      </AdminCard>

      <AdminCard className="p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-admin-ink-soft">
          Shop by Category (Homepage)
        </h2>
        <CategoryShowcaseForm />
        <div className="mt-4">
          <CategoryShowcaseList cards={categoryShowcase} />
        </div>
      </AdminCard>

      <AdminCard className="p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-admin-ink-soft">
          Offer Banners (Homepage)
        </h2>
        <OfferBannerForm />
        <div className="mt-4">
          <OfferBannerList banners={offerBanners} />
        </div>
      </AdminCard>
    </div>
  );
}
