"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/db/connect";
import { BannerModel } from "@/models/Banner";
import { ProductModel } from "@/models/Product";
import { uploadImageBuffer, deleteImage } from "@/lib/cloudinary-server";

export type UploadState = { error?: string; success?: string };

function revalidateAfterImageChange(productSlug?: string) {
  revalidatePath("/", "layout");
  revalidatePath("/admin");
  if (productSlug) revalidatePath(`/product/${productSlug}`);
}

async function readImageFile(formData: FormData): Promise<
  | { ok: true; buffer: Buffer }
  | { ok: false; error: string }
> {
  const file = formData.get("image");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Please choose an image file." };
  }
  if (!file.type.startsWith("image/")) {
    return { ok: false, error: "Please choose a valid image file." };
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  return { ok: true, buffer };
}

export async function uploadBannerAction(
  _prevState: UploadState,
  formData: FormData,
): Promise<UploadState> {
  const alt = String(formData.get("alt") ?? "").trim();
  if (!alt) return { error: "Alt text is required for accessibility/SEO." };

  const fileResult = await readImageFile(formData);
  if (!fileResult.ok) return { error: fileResult.error };

  try {
    await connectToDatabase();
    const uploaded = await uploadImageBuffer(fileResult.buffer, "vellora/banners");

    const title = String(formData.get("title") ?? "").trim();
    const subtitle = String(formData.get("subtitle") ?? "").trim();
    const linkHref = String(formData.get("linkHref") ?? "").trim();

    await BannerModel.create({
      title: title || undefined,
      subtitle: subtitle || undefined,
      image: { publicId: uploaded.publicId, alt, width: uploaded.width, height: uploaded.height },
      linkHref: linkHref || undefined,
      placement: "homepage-hero",
      isActive: true,
    });

    revalidateAfterImageChange();
    return { success: "Banner uploaded and set live on the homepage." };
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
    await banner.deleteOne();
  }
  revalidateAfterImageChange();
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
