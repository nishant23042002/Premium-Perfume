"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/db/connect";
import { OfferBannerModel } from "@/models/OfferBanner";
import { uploadImageBuffer, deleteImage } from "@/lib/cloudinary-server";
import { readImageFile, readOptionalImageFile } from "@/lib/upload-helpers";

export type UploadState = { error?: string; success?: string };

function revalidateHome() {
  revalidatePath("/", "layout");
  revalidatePath("/admin");
}

export async function createOfferBannerAction(
  _prevState: UploadState,
  formData: FormData,
): Promise<UploadState> {
  const eyebrow = String(formData.get("eyebrow") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const subtitle = String(formData.get("subtitle") ?? "").trim();
  const linkHref = String(formData.get("linkHref") ?? "").trim();
  const alt = String(formData.get("alt") ?? "").trim();
  const orderRaw = Number(formData.get("order"));
  const order = Number.isFinite(orderRaw) ? orderRaw : 0;

  if (!title) return { error: "Offer text is required (e.g. \"3 at ₹1299\")." };
  if (!alt) return { error: "Alt text is required." };

  const fileResult = await readImageFile(formData);
  if (!fileResult.ok) return { error: fileResult.error };

  try {
    await connectToDatabase();
    const uploaded = await uploadImageBuffer(fileResult.buffer, "vellora/offer-banners");

    await OfferBannerModel.create({
      eyebrow: eyebrow || undefined,
      title,
      subtitle: subtitle || undefined,
      linkHref: linkHref || undefined,
      image: { publicId: uploaded.publicId, alt, width: uploaded.width, height: uploaded.height },
      isActive: true,
      order,
    });

    revalidateHome();
    return { success: "Offer banner created and live on the homepage." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Upload failed." };
  }
}

export async function updateOfferBannerAction(
  _prevState: UploadState,
  formData: FormData,
): Promise<UploadState> {
  const id = String(formData.get("id") ?? "");
  const eyebrow = String(formData.get("eyebrow") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const subtitle = String(formData.get("subtitle") ?? "").trim();
  const linkHref = String(formData.get("linkHref") ?? "").trim();
  const orderRaw = Number(formData.get("order"));

  if (!id) return { error: "Missing banner." };
  if (!title) return { error: "Offer text is required." };

  const imageResult = await readOptionalImageFile(formData, "image");
  if (!imageResult.ok) return { error: imageResult.error };

  try {
    await connectToDatabase();
    const banner = await OfferBannerModel.findById(id);
    if (!banner) return { error: "Banner not found." };

    banner.eyebrow = eyebrow || undefined;
    banner.title = title;
    banner.subtitle = subtitle || undefined;
    banner.linkHref = linkHref || undefined;
    if (Number.isFinite(orderRaw)) banner.order = orderRaw;

    if (imageResult.buffer) {
      const uploaded = await uploadImageBuffer(imageResult.buffer, "vellora/offer-banners");
      await deleteImage(banner.image.publicId).catch(() => {});
      banner.image = {
        publicId: uploaded.publicId,
        alt: banner.image.alt,
        width: uploaded.width,
        height: uploaded.height,
      };
    }

    await banner.save();
    revalidateHome();
    return { success: "Banner updated." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Update failed." };
  }
}

export async function toggleOfferBannerActive(id: string, isActive: boolean) {
  await connectToDatabase();
  await OfferBannerModel.findByIdAndUpdate(id, { isActive });
  revalidateHome();
}

export async function deleteOfferBanner(id: string) {
  await connectToDatabase();
  const banner = await OfferBannerModel.findById(id);
  if (banner) {
    await deleteImage(banner.image.publicId).catch(() => {});
    await banner.deleteOne();
  }
  revalidateHome();
}
