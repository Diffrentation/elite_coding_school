import { NextRequest } from "next/server";
import { z } from "zod";
import { audit } from "@/lib/audit";
import { failure, success } from "@/lib/api";
import { connectDb } from "@/lib/db";
import { Certificate } from "@/models/Certificate";
import { Counter } from "@/models/Counter";
import { Enrollment } from "@/models/Enrollment";
import { Student } from "@/models/Student";
import { User } from "@/models/User";
import { requireAdminSession } from "@/modules/identity/session";

const sortable = new Set(["fullName", "studentId", "registrationDate", "admissionStatus", "createdAt"]);
const addressSchema = z
  .object({
    line1: z.string().trim().max(160).optional(),
    line2: z.string().trim().max(160).optional(),
    city: z.string().trim().max(80).optional(),
    state: z.string().trim().max(80).optional(),
    postalCode: z.string().trim().max(16).optional(),
  })
  .optional();
const studentFieldsSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().min(7).max(25),
  registrationDate: z.coerce.date().optional(),
  completionDate: z.coerce.date().nullable().optional(),
  admissionStatus: z
    .enum(["not_enrolled", "pending", "approved", "enrolled", "completed", "rejected"])
    .optional(),
  profileImageUrl: z.string().trim().url().nullable().optional(),
  publicProfile: z.boolean().optional(),
  publicPhotoConsent: z.boolean().optional(),
  additionalInfo: z.string().trim().max(2000).optional(),
  address: addressSchema,
});

export async function GET(request: NextRequest) {
  await connectDb();
  try {
    await requireAdminSession();
    const { searchParams } = request.nextUrl;
    const search = searchParams.get("search")?.trim();
    const admissionStatus = searchParams.get("admissionStatus")?.trim();
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 20));
    const sortBy = sortable.has(searchParams.get("sortBy") ?? "") ? searchParams.get("sortBy")! : "createdAt";
    const sortDirection = searchParams.get("sortDirection") === "asc" ? 1 : -1;
    const filter: Record<string, unknown> = {};
    if (admissionStatus) filter.admissionStatus = admissionStatus;
    if (search) {
      const matchingUsers = await User.find({ email: new RegExp(search, "i") })
        .select("_id")
        .lean();
      filter.$or = [
        { fullName: new RegExp(search, "i") },
        { studentId: new RegExp(search, "i") },
        { email: new RegExp(search, "i") },
        { phone: new RegExp(search, "i") },
        ...(matchingUsers.length ? [{ userId: { $in: matchingUsers.map((user) => user._id) } }] : []),
      ];
    }
    const [students, total] = await Promise.all([
      Student.find(filter)
        .sort({ [sortBy]: sortDirection })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("userId", "email accountStatus emailVerifiedAt")
        .lean(),
      Student.countDocuments(filter),
    ]);
    return success({ students, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch {
    return failure("FORBIDDEN", "Administrator access is required.", 403);
  }
}

export async function POST(request: NextRequest) {
  const parsed = studentFieldsSchema.safeParse(await request.json());
  if (!parsed.success)
    return failure("VALIDATION_ERROR", "Enter a valid name, private email, and mobile number.", 422);
  await connectDb();
  try {
    const admin = await requireAdminSession();
    const data = parsed.data;
    const email = data.email.toLowerCase();
    const [existingStudent, existingUser] = await Promise.all([
      Student.findOne({ email }).lean(),
      User.findOne({ email }).lean(),
    ]);
    if (existingStudent || existingUser)
      return failure("CONFLICT", "This email already belongs to a student or portal account.", 409);
    const counter = await Counter.findOneAndUpdate(
      { _id: "studentId" },
      { $inc: { seq: 1 } },
      { upsert: true, new: true },
    );
    const student = await Student.create({
      ...data,
      email,
      studentId: `ECS${String(counter.seq).padStart(6, "0")}`,
      registrationDate: data.registrationDate ?? new Date(),
      profileImageUrl: data.profileImageUrl ?? null,
      completionDate: data.completionDate ?? null,
    });
    await audit("student.created", "student", String(student._id), admin.userId, {
      studentId: student.studentId,
    });
    return success({ student }, { status: 201 });
  } catch (error) {
    return failure(
      "CREATE_FAILED",
      error instanceof Error ? error.message : "Unable to create student.",
      500,
    );
  }
}

export async function PATCH(request: NextRequest) {
  await connectDb();
  try {
    const admin = await requireAdminSession();
    const body = await request.json();
    const { studentId, ...payload } = body;
    if (!studentId) return failure("VALIDATION_ERROR", "studentId is required.", 400);
    const parsed = studentFieldsSchema.partial().safeParse(payload);
    if (!parsed.success || !Object.keys(parsed.data).length)
      return failure("VALIDATION_ERROR", "Provide at least one valid student field to update.", 422);
    const update = { ...parsed.data } as Record<string, unknown>;
    if (typeof update.email === "string") {
      update.email = update.email.toLowerCase();
      const currentStudent = await Student.findById(studentId).select("userId").lean();
      const duplicate = await Student.exists({ email: update.email, _id: { $ne: studentId } });
      const portalDuplicate = await User.exists({
        email: update.email,
        ...(currentStudent?.userId ? { _id: { $ne: currentStudent.userId } } : {}),
      });
      if (duplicate || portalDuplicate) return failure("CONFLICT", "This email is already in use.", 409);
    }
    if (update.publicPhotoConsent === false) update.publicProfile = false;
    const student = await Student.findByIdAndUpdate(
      studentId,
      { $set: update },
      { new: true, runValidators: true },
    )
      .populate("userId", "email accountStatus emailVerifiedAt")
      .lean();
    if (!student) {
      return failure("NOT_FOUND", "Student record not found.", 404);
    }
    await audit("student.updated", "student", studentId, admin.userId, { fields: Object.keys(update) });
    return success({ student });
  } catch (error) {
    return failure(
      "UPDATE_FAILED",
      error instanceof Error ? error.message : "Unable to update student status.",
      500,
    );
  }
}

export async function DELETE(request: NextRequest) {
  await connectDb();
  try {
    const admin = await requireAdminSession();
    const studentId = request.nextUrl.searchParams.get("studentId");
    if (!studentId) return failure("VALIDATION_ERROR", "studentId is required.", 400);
    const [enrollment, certificate] = await Promise.all([
      Enrollment.exists({ studentId }),
      Certificate.exists({ studentId }),
    ]);
    if (enrollment || certificate)
      return failure(
        "CONFLICT",
        "Students with enrollment or certificate history cannot be deleted. Keep the record for audit history.",
        409,
      );
    const student = await Student.findByIdAndDelete(studentId);
    if (!student) return failure("NOT_FOUND", "Student record not found.", 404);
    await audit("student.deleted", "student", studentId, admin.userId, { studentId: student.studentId });
    return success({ deleted: true });
  } catch {
    return failure("DELETE_FAILED", "Unable to delete student.", 500);
  }
}
