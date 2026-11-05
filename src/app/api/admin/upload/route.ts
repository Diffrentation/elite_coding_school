import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { failure, success } from "@/lib/api";
import { uploadAdminAsset } from "@/lib/cloudinary";
import { requireAdminSession } from "@/modules/identity/session";

export async function POST(request: Request) {
  try {
    await requireAdminSession();
    const form = await request.formData();
    const file = form.get("file");
    const folder = String(form.get("folder") || "general").replace(/[^a-z0-9_-]/gi, "");

    if (!(file instanceof File)) {
      return failure("VALIDATION_ERROR", "A valid image file must be uploaded.", 422);
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
    if (!allowedTypes.includes(file.type)) {
      return failure("VALIDATION_ERROR", "Upload a JPG, PNG, WebP, GIF, or SVG image.", 422);
    }

    if (file.size > 10 * 1024 * 1024) {
      return failure("VALIDATION_ERROR", "File size must not exceed 10 MB.", 422);
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // 1. Try Cloudinary if configured
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
      try {
        const upload = await uploadAdminAsset(buffer, folder);
        if (upload?.secure_url) {
          return success({
            url: upload.secure_url,
            fileName: file.name,
            provider: "cloudinary",
          });
        }
      } catch (cloudErr) {
        console.warn("Cloudinary upload failed, falling back to local storage:", cloudErr);
      }
    }

    // 2. Fallback to local public/uploads directory
    const uploadDir = join(process.cwd(), "public", "uploads", folder);
    await mkdir(uploadDir, { recursive: true });

    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const uniqueFileName = `${Date.now()}-${safeName}`;
    const filePath = join(uploadDir, uniqueFileName);

    await writeFile(filePath, buffer);
    const localUrl = `/uploads/${folder}/${uniqueFileName}`;

    return success({
      url: localUrl,
      fileName: file.name,
      provider: "local",
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return failure("UNAUTHORIZED", "Administrator credentials required.", 401);
    }
    return failure("UPLOAD_FAILED", "Could not process image upload.", 500);
  }
}

