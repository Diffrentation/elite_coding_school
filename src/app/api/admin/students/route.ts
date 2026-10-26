import { NextRequest } from "next/server";
import { failure, success } from "@/lib/api";
import { connectDb } from "@/lib/db";
import { Student } from "@/models/Student";
import { requireAdminSession } from "@/modules/identity/session";

const sortable = new Set(["fullName", "studentId", "registrationDate", "admissionStatus", "createdAt"]);

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
    if (search)
      filter.$or = [
        { fullName: new RegExp(search, "i") },
        { studentId: new RegExp(search, "i") },
        { phone: new RegExp(search, "i") },
      ];
    const [students, total] = await Promise.all([
      Student.find(filter)
        .sort({ [sortBy]: sortDirection })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("userId", "email accountStatus")
        .lean(),
      Student.countDocuments(filter),
    ]);
    return success({ students, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch {
    return failure("FORBIDDEN", "Administrator access is required.", 403);
  }
}
