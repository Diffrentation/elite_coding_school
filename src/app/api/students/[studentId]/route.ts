import { failure, success } from "@/lib/api";
import { connectDb } from "@/lib/db";
import { Certificate } from "@/models/Certificate";
import { Student } from "@/models/Student";

export async function GET(_: Request, { params }: { params: Promise<{ studentId: string }> }) {
  await connectDb();
  const { studentId } = await params;
  const student = await Student.findOne({ studentId, publicProfile: true })
    .select("studentId fullName profileImageUrl publicPhotoConsent registrationDate completionDate")
    .lean();
  if (!student) return failure("NOT_FOUND", "Public student profile not found.", 404);
  const certificates = await Certificate.find({ studentId: student._id, status: "active" })
    .select(
      "certificateId courseNameSnapshot batchSnapshot joiningDateSnapshot completionDate issueDate verificationPath templateUrl status",
    )
    .lean();
  return success({
    student: {
      studentId: student.studentId,
      fullName: student.fullName,
      profileImageUrl: student.publicPhotoConsent ? student.profileImageUrl : null,
      joiningDate: student.registrationDate,
      completionDate: student.completionDate,
      certificates,
    },
  });
}
