import { v2 as cloudinary } from "cloudinary";

function ensureConfigured() {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloudName) {
    throw new Error(
      "Cloudinary is not configured. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env.local.",
    );
  }

  // Configured lazily (not at module load time) so it reads env vars at call
  // time rather than whenever this module happens to first be imported.
  cloudinary.config({
    cloud_name: cloudName,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export type CloudinaryUploadResult = {
  publicId: string;
  width: number;
  height: number;
};

/**
 * Server-only signed upload. The API secret never leaves the server, so this
 * must only be called from Server Actions / Route Handlers behind the admin
 * gate — never imported into a Client Component.
 */
export async function uploadImageBuffer(
  buffer: Buffer,
  folder: string,
): Promise<CloudinaryUploadResult> {
  ensureConfigured();

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Cloudinary upload failed"));
          return;
        }
        resolve({ publicId: result.public_id, width: result.width, height: result.height });
      },
    );
    uploadStream.end(buffer);
  });
}

export async function deleteImage(publicId: string): Promise<void> {
  ensureConfigured();
  await cloudinary.uploader.destroy(publicId);
}
