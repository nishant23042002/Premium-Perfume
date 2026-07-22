"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/db/connect";
import { CategoryModel } from "@/models/Category";
import { CollectionModel } from "@/models/Collection";
import { uploadImageBuffer, deleteImage } from "@/lib/cloudinary-server";
import { readOptionalImageFile, slugify } from "@/lib/upload-helpers";
import { getCurrentAdmin, hasPermission } from "@/lib/data/adminUsers";

export type CategoryFormState = { error?: string; success?: string };

async function canManage(): Promise<boolean> {
  const admin = await getCurrentAdmin();
  return hasPermission(admin, "categories.manage");
}

function revalidate() {
  revalidatePath("/", "layout");
  revalidatePath("/perfumes");
  revalidatePath("/admin/categories");
}

export async function createCategory(
  _prevState: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  if (!(await canManage())) return { error: "You don't have permission to manage categories." };

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const orderRaw = Number(formData.get("order"));
  if (!name) return { error: "Category name is required." };

  const imageResult = await readOptionalImageFile(formData, "image");
  if (!imageResult.ok) return { error: imageResult.error };

  await connectToDatabase();
  const slug = slugify(name);
  const existing = await CategoryModel.findOne({ slug });
  if (existing) return { error: "A category with that name already exists." };

  let image: { publicId: string; alt: string } | undefined;
  if (imageResult.buffer) {
    const uploaded = await uploadImageBuffer(imageResult.buffer, "vellora/categories");
    image = { publicId: uploaded.publicId, alt: name };
  }

  await CategoryModel.create({
    name,
    slug,
    description: description || undefined,
    image,
    order: Number.isFinite(orderRaw) ? orderRaw : 0,
  });

  revalidate();
  return { success: `Category "${name}" created.` };
}

export async function deleteCategory(id: string): Promise<void> {
  if (!(await canManage())) return;
  await connectToDatabase();
  const category = await CategoryModel.findById(id);
  if (category) {
    if (category.image?.publicId) await deleteImage(category.image.publicId).catch(() => {});
    await category.deleteOne();
  }
  revalidate();
}

export type CollectionFormState = { error?: string; success?: string };

export async function createCollection(
  _prevState: CollectionFormState,
  formData: FormData,
): Promise<CollectionFormState> {
  if (!(await canManage())) return { error: "You don't have permission to manage collections." };

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const isFeatured = formData.get("isFeatured") === "on";
  if (!name) return { error: "Collection name is required." };

  const imageResult = await readOptionalImageFile(formData, "image");
  if (!imageResult.ok) return { error: imageResult.error };

  await connectToDatabase();
  const slug = slugify(name);
  const existing = await CollectionModel.findOne({ slug });
  if (existing) return { error: "A collection with that name already exists." };

  let image: { publicId: string; alt: string } | undefined;
  if (imageResult.buffer) {
    const uploaded = await uploadImageBuffer(imageResult.buffer, "vellora/collections");
    image = { publicId: uploaded.publicId, alt: name };
  }

  await CollectionModel.create({
    name,
    slug,
    description: description || undefined,
    image,
    isFeatured,
  });

  revalidate();
  return { success: `Collection "${name}" created.` };
}

export async function toggleCollectionFeatured(id: string, isFeatured: boolean): Promise<void> {
  if (!(await canManage())) return;
  await connectToDatabase();
  await CollectionModel.findByIdAndUpdate(id, { isFeatured });
  revalidate();
}

export async function deleteCollection(id: string): Promise<void> {
  if (!(await canManage())) return;
  await connectToDatabase();
  const collection = await CollectionModel.findById(id);
  if (collection) {
    if (collection.image?.publicId) await deleteImage(collection.image.publicId).catch(() => {});
    await collection.deleteOne();
  }
  revalidate();
}
