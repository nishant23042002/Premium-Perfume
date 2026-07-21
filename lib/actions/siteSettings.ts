"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/db/connect";
import { SiteSettingsModel } from "@/models/SiteSettings";
import { uploadImageBuffer, deleteImage } from "@/lib/cloudinary-server";
import { readImageFile } from "@/lib/upload-helpers";

export type UploadState = { error?: string; success?: string };

function revalidateSite() {
  revalidatePath("/", "layout");
  revalidatePath("/admin");
}

export async function uploadSiteLogoAction(
  _prevState: UploadState,
  formData: FormData,
): Promise<UploadState> {
  const alt = String(formData.get("alt") ?? "").trim() || "Site logo";

  const fileResult = await readImageFile(formData);
  if (!fileResult.ok) return { error: fileResult.error };

  try {
    await connectToDatabase();
    const uploaded = await uploadImageBuffer(fileResult.buffer, "vellora/site");

    const existing = await SiteSettingsModel.findOne({});
    if (existing?.logo?.publicId) {
      await deleteImage(existing.logo.publicId).catch(() => {});
    }

    await SiteSettingsModel.findOneAndUpdate(
      {},
      { logo: { publicId: uploaded.publicId, alt, width: uploaded.width, height: uploaded.height } },
      { upsert: true },
    );

    revalidateSite();
    return { success: "Logo updated." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Upload failed." };
  }
}

export async function removeSiteLogo() {
  await connectToDatabase();
  const existing = await SiteSettingsModel.findOne({});
  if (existing?.logo?.publicId) {
    await deleteImage(existing.logo.publicId).catch(() => {});
    existing.logo = undefined;
    await existing.save();
  }
  revalidateSite();
}
