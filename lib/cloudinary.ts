const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

/**
 * Returns null until NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is configured and real
 * assets are uploaded — callers should fall back to a placeholder in that case.
 */
export function getCloudinaryUrl(
  publicId: string,
  options?: { width?: number; height?: number },
): string | null {
  if (!CLOUD_NAME) return null;

  const transforms = ["f_auto", "q_auto"];
  if (options?.width) transforms.push(`w_${options.width}`);
  if (options?.height) transforms.push(`h_${options.height}`);

  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transforms.join(",")}/${publicId}`;
}
