"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/db/connect";
import { BannerModel } from "@/models/Banner";
import { ProductModel } from "@/models/Product";
import { uploadImageBuffer, deleteImage } from "@/lib/cloudinary-server";
import { slugify, readImageFile, readOptionalImageFile } from "@/lib/upload-helpers";

export type UploadState = { error?: string; success?: string };

async function uniqueProductSlug(base: string): Promise<string> {
  let slug = base;
  let counter = 2;
  while (await ProductModel.exists({ slug })) {
    slug = `${base}-${counter}`;
    counter += 1;
  }
  return slug;
}

function revalidateAfterImageChange(productSlug?: string) {
  revalidatePath("/", "layout");
  revalidatePath("/admin");
  if (productSlug) revalidatePath(`/product/${productSlug}`);
}

export async function uploadBannerAction(
  _prevState: UploadState,
  formData: FormData,
): Promise<UploadState> {
  const alt = String(formData.get("alt") ?? "").trim();
  if (!alt) return { error: "Alt text is required for accessibility/SEO." };

  const fileResult = await readImageFile(formData, "image");
  if (!fileResult.ok) return { error: fileResult.error };

  const mobileFileResult = await readOptionalImageFile(formData, "mobileImage");
  if (!mobileFileResult.ok) return { error: mobileFileResult.error };

  try {
    await connectToDatabase();
    const uploaded = await uploadImageBuffer(fileResult.buffer, "vellora/banners");
    const mobileUploaded = mobileFileResult.buffer
      ? await uploadImageBuffer(mobileFileResult.buffer, "vellora/banners/mobile")
      : null;

    const title = String(formData.get("title") ?? "").trim();
    const subtitle = String(formData.get("subtitle") ?? "").trim();
    const linkHref = String(formData.get("linkHref") ?? "").trim();
    const orderRaw = Number(formData.get("order"));
    const order = Number.isFinite(orderRaw) ? orderRaw : 0;

    await BannerModel.create({
      title: title || undefined,
      subtitle: subtitle || undefined,
      image: { publicId: uploaded.publicId, alt, width: uploaded.width, height: uploaded.height },
      mobileImage: mobileUploaded
        ? { publicId: mobileUploaded.publicId, alt, width: mobileUploaded.width, height: mobileUploaded.height }
        : undefined,
      linkHref: linkHref || undefined,
      placement: "homepage-hero",
      isActive: true,
      order,
    });

    revalidateAfterImageChange();
    return { success: "Banner uploaded and set live on the homepage." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Upload failed." };
  }
}

export async function uploadBannerMobileImageAction(
  _prevState: UploadState,
  formData: FormData,
): Promise<UploadState> {
  const bannerId = String(formData.get("bannerId") ?? "");
  if (!bannerId) return { error: "Missing banner." };

  const fileResult = await readImageFile(formData, "mobileImage");
  if (!fileResult.ok) return { error: fileResult.error };

  try {
    await connectToDatabase();
    const banner = await BannerModel.findById(bannerId);
    if (!banner) return { error: "Banner not found." };

    if (banner.mobileImage?.publicId) {
      await deleteImage(banner.mobileImage.publicId).catch(() => {});
    }

    const uploaded = await uploadImageBuffer(fileResult.buffer, "vellora/banners/mobile");
    banner.mobileImage = {
      publicId: uploaded.publicId,
      alt: banner.image.alt,
      width: uploaded.width,
      height: uploaded.height,
    };
    await banner.save();

    revalidateAfterImageChange();
    return { success: "Mobile image updated." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Upload failed." };
  }
}

export async function toggleBannerActive(bannerId: string, isActive: boolean) {
  await connectToDatabase();
  await BannerModel.findByIdAndUpdate(bannerId, { isActive });
  revalidateAfterImageChange();
}

export async function deleteBanner(bannerId: string) {
  await connectToDatabase();
  const banner = await BannerModel.findById(bannerId);
  if (banner) {
    await deleteImage(banner.image.publicId).catch(() => {});
    if (banner.mobileImage?.publicId) {
      await deleteImage(banner.mobileImage.publicId).catch(() => {});
    }
    await banner.deleteOne();
  }
  revalidateAfterImageChange();
}

const CONCENTRATIONS = ["EDP", "EDT", "Parfum", "Attar", "Cologne"] as const;

export async function createProductAction(
  _prevState: UploadState,
  formData: FormData,
): Promise<UploadState> {
  const name = String(formData.get("name") ?? "").trim();
  const concentration = String(formData.get("concentration") ?? "");
  const sizeMl = Number(formData.get("sizeMl"));
  const price = Number(formData.get("price"));
  const stockRaw = Number(formData.get("stock"));
  const alt = String(formData.get("alt") ?? "").trim();
  const categoryIds = formData.getAll("categoryIds").map(String).filter(Boolean);

  if (!name) return { error: "Product name is required." };
  if (!(CONCENTRATIONS as readonly string[]).includes(concentration)) {
    return { error: "Please choose a concentration." };
  }
  if (!Number.isFinite(sizeMl) || sizeMl <= 0) return { error: "Enter a valid size (ml)." };
  if (!Number.isFinite(price) || price <= 0) return { error: "Enter a valid price." };
  if (!alt) return { error: "Alt text is required for the product image." };

  const fileResult = await readImageFile(formData);
  if (!fileResult.ok) return { error: fileResult.error };

  try {
    await connectToDatabase();

    const slug = await uniqueProductSlug(slugify(name));
    const sku = `${slugify(name).toUpperCase().slice(0, 12)}-${sizeMl}`;
    const uploaded = await uploadImageBuffer(fileResult.buffer, "vellora/products");

    const shortDescription = String(formData.get("shortDescription") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    const stock = Number.isFinite(stockRaw) ? stockRaw : 0;

    const product = await ProductModel.create({
      name,
      slug,
      shortDescription: shortDescription || undefined,
      description: description || undefined,
      categoryIds,
      concentration,
      variants: [{ sku, sizeMl, price, stock, isDefault: true }],
      images: [{ publicId: uploaded.publicId, alt, width: uploaded.width, height: uploaded.height }],
      minPrice: price,
      isBestseller: formData.get("isBestseller") === "on",
      isNewArrival: formData.get("isNewArrival") === "on",
      status: "active",
    });

    revalidateAfterImageChange(product.slug);
    revalidatePath("/perfumes");
    revalidatePath("/perfumes/[category]", "page");
    return { success: `${name} created and live on the site.` };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to create product." };
  }
}

export async function uploadProductImageAction(
  _prevState: UploadState,
  formData: FormData,
): Promise<UploadState> {
  const productId = String(formData.get("productId") ?? "");
  const alt = String(formData.get("alt") ?? "").trim();

  if (!productId) return { error: "Please choose a product." };
  if (!alt) return { error: "Alt text is required for accessibility/SEO." };

  const fileResult = await readImageFile(formData);
  if (!fileResult.ok) return { error: fileResult.error };

  try {
    await connectToDatabase();
    const product = await ProductModel.findById(productId);
    if (!product) return { error: "Product not found." };

    const uploaded = await uploadImageBuffer(fileResult.buffer, "vellora/products");

    // New upload becomes the primary image so it's immediately visible
    // wherever the product is shown (card, gallery, etc).
    product.images.unshift({
      publicId: uploaded.publicId,
      alt,
      width: uploaded.width,
      height: uploaded.height,
    });
    await product.save();

    revalidateAfterImageChange(product.slug);
    return { success: `Image added to ${product.name}.` };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Upload failed." };
  }
}

export async function removeProductImage(productId: string, publicId: string) {
  await connectToDatabase();
  const product = await ProductModel.findById(productId);
  if (!product) return;

  product.images = product.images.filter((img: { publicId: string }) => img.publicId !== publicId);
  await product.save();
  await deleteImage(publicId).catch(() => {});

  revalidateAfterImageChange(product.slug);
}
