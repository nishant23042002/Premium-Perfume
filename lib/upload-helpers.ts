export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function readImageFile(
  formData: FormData,
  fieldName = "image",
): Promise<{ ok: true; buffer: Buffer } | { ok: false; error: string }> {
  const file = formData.get(fieldName);
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Please choose an image file." };
  }
  if (!file.type.startsWith("image/")) {
    return { ok: false, error: "Please choose a valid image file." };
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  return { ok: true, buffer };
}

/** Like readImageFile, but a missing/empty field is not an error — used for
 * optional secondary images (e.g. mobile crops) that fall back gracefully. */
export async function readOptionalImageFile(
  formData: FormData,
  fieldName: string,
): Promise<{ ok: true; buffer: Buffer | null } | { ok: false; error: string }> {
  const file = formData.get(fieldName);
  if (!(file instanceof File) || file.size === 0) return { ok: true, buffer: null };
  if (!file.type.startsWith("image/")) {
    return { ok: false, error: "Please choose a valid image file." };
  }
  return { ok: true, buffer: Buffer.from(await file.arrayBuffer()) };
}
