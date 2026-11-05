import { v2 as cloudinary } from "cloudinary";
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
export function uploadProfileImage(buffer: Buffer, userId: string) {
  return new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "elite-coding-school/profiles",
        public_id: userId,
        overwrite: true,
        resource_type: "image",
        transformation: [{ width: 600, height: 600, crop: "limit" }],
      },
      (error, result) => (error || !result ? reject(error ?? new Error("Upload failed")) : resolve(result)),
    );
    stream.end(buffer);
  });
}

export function uploadAdminAsset(buffer: Buffer, folder: string) {
  return new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `elite-coding-school/${folder}`,
        resource_type: "image",
      },
      (error, result) => (error || !result ? reject(error ?? new Error("Upload failed")) : resolve(result)),
    );
    stream.end(buffer);
  });
}
export async function deleteImage(publicId?: string | null) {
  if (publicId) await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
}
