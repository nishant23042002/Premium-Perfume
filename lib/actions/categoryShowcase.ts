"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/db/connect";
import { CategoryShowcaseModel } from "@/models/CategoryShowcase";
import { uploadImageBuffer, deleteImage } from "@/lib/cloudinary-server";
import { readImageFile, readOptionalImageFile } from "@/lib/upload-helpers";

export type UploadState = { error?: string; success?: string };

function revalidateHome() {
  revalidatePath("/", "layout");
  revalidatePath("/admin");
}

export async function createCategoryShowcaseAction(
  _prevState: UploadState,
  formData: FormData,
): Promise<UploadState> {
  const title = String(formData.get("title") ?? "").trim();
  const linkHref = String(formData.get("linkHref") ?? "").trim();
  const alt = String(formData.get("alt") ?? "").trim();
  const orderRaw = Number(formData.get("order"));
  const order = Number.isFinite(orderRaw) ? orderRaw : 0;

  if (!title) return { error: "Title is required." };
  if (!linkHref) return { error: "Link URL is required (e.g. /perfumes/unisex)." };
  if (!alt) return { error: "Alt text is required." };

  const fileResult = await readImageFile(formData);
  if (!fileResult.ok) return { error: fileResult.error };

  try {
    await connectToDatabase();
    const uploaded = await uploadImageBuffer(fileResult.buffer, "vellora/category-showcase");

    await CategoryShowcaseModel.create({
      title,
      linkHref,
      image: { publicId: uploaded.publicId, alt, width: uploaded.width, height: uploaded.height },
      isActive: true,
      order,
    });

    revalidateHome();
    return { success: "Category card created and live on the homepage." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Upload failed." };
  }
}

export async function updateCategoryShowcaseAction(
  _prevState: UploadState,
  formData: FormData,
): Promise<UploadState> {
  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const linkHref = String(formData.get("linkHref") ?? "").trim();
  const orderRaw = Number(formData.get("order"));

  if (!id) return { error: "Missing card." };
  if (!title) return { error: "Title is required." };
  if (!linkHref) return { error: "Link URL is required." };

  const imageResult = await readOptionalImageFile(formData, "image");
  if (!imageResult.ok) return { error: imageResult.error };

  try {
    await connectToDatabase();
    const card = await CategoryShowcaseModel.findById(id);
    if (!card) return { error: "Card not found." };

    card.title = title;
    card.linkHref = linkHref;
    if (Number.isFinite(orderRaw)) card.order = orderRaw;

    if (imageResult.buffer) {
      const uploaded = await uploadImageBuffer(imageResult.buffer, "vellora/category-showcase");
      await deleteImage(card.image.publicId).catch(() => {});
      card.image = {
        publicId: uploaded.publicId,
        alt: card.image.alt,
        width: uploaded.width,
        height: uploaded.height,
      };
    }

    await card.save();
    revalidateHome();
    return { success: "Card updated." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Update failed." };
  }
}

export async function toggleCategoryShowcaseActive(id: string, isActive: boolean) {
  await connectToDatabase();
  await CategoryShowcaseModel.findByIdAndUpdate(id, { isActive });
  revalidateHome();
}

export async function deleteCategoryShowcase(id: string) {
  await connectToDatabase();
  const card = await CategoryShowcaseModel.findById(id);
  if (card) {
    await deleteImage(card.image.publicId).catch(() => {});
    await card.deleteOne();
  }
  revalidateHome();
}
