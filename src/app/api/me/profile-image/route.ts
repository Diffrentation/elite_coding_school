import { connectDb } from "@/lib/db";
import { failure, success } from "@/lib/api";
import { requireStudentSession } from "@/modules/identity/session";
import { Student } from "@/models/Student";
import { deleteImage, uploadProfileImage } from "@/lib/cloudinary";
export async function POST(request: Request) {
  await connectDb();
  try {
    const session = await requireStudentSession();
    const form = await request.formData();
    const file = form.get("image");
    if (
      !(file instanceof File) ||
      !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
      file.size > 5 * 1024 * 1024
    )
      return failure("VALIDATION_ERROR", "Upload a JPG, PNG, or WebP image up to 5 MB.", 422);
    const student = await Student.findOne({ userId: session.userId });
    if (!student) return failure("NOT_FOUND", "Student profile not found.", 404);
    const upload = await uploadProfileImage(Buffer.from(await file.arrayBuffer()), session.userId);
    await Student.updateOne(
      { _id: student._id },
      {
        $set: { profileImageUrl: upload.secure_url, profileImagePublicId: upload.public_id },
        $inc: { version: 1 },
      },
    );
    return success({ imageUrl: upload.secure_url });
  } catch (error) {
    return error instanceof Error && error.message === "UNAUTHORIZED"
      ? failure("UNAUTHORIZED", "Log in as a student to continue.", 401)
      : failure("UPLOAD_FAILED", "Unable to upload the profile image. Please try again.", 502);
  }
}
export async function DELETE() {
  await connectDb();
  try {
    const session = await requireStudentSession();
    const student = await Student.findOne({ userId: session.userId });
    if (!student) return failure("NOT_FOUND", "Student profile not found.", 404);
    await deleteImage(student.profileImagePublicId);
    await Student.updateOne(
      { _id: student._id },
      { $set: { profileImageUrl: null, profileImagePublicId: null }, $inc: { version: 1 } },
    );
    return success({ message: "Profile image removed." });
  } catch (error) {
    return error instanceof Error && error.message === "UNAUTHORIZED"
      ? failure("UNAUTHORIZED", "Log in as a student to continue.", 401)
      : failure("IMAGE_DELETE_FAILED", "Unable to remove the profile image. Please try again.", 502);
  }
}
