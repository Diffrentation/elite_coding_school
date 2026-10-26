import { z } from "zod";
import { failure, success } from "@/lib/api";
import { connectDb } from "@/lib/db";
import { Enrollment } from "@/models/Enrollment";
import { FeeInvoice } from "@/models/FeeInvoice";
import { requireAdminSession } from "@/modules/identity/session";
const schema = z.object({ enrollmentId: z.string().min(1), month: z.string().regex(/^\d{4}-\d{2}$/) });

export async function GET() {
  await connectDb();
  try {
    await requireAdminSession();
    const invoices = await FeeInvoice.find()
      .sort({ month: -1, createdAt: -1 })
      .populate({ path: "enrollmentId", populate: { path: "studentId", select: "fullName studentId" } })
      .lean();
    return success({ invoices });
  } catch {
    return failure("FORBIDDEN", "Administrator access is required.", 403);
  }
}

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return failure("VALIDATION_ERROR", "Use an enrollment and YYYY-MM month.", 422);
  await connectDb();
  try {
    await requireAdminSession();
    const enrollment = await Enrollment.findById(parsed.data.enrollmentId);
    if (!enrollment || enrollment.status !== "active")
      return failure("NOT_FOUND", "Active enrollment not found.", 404);
    const invoice = await FeeInvoice.findOneAndUpdate(
      { enrollmentId: enrollment._id, month: parsed.data.month },
      {
        $setOnInsert: {
          enrollmentId: enrollment._id,
          month: parsed.data.month,
          dueAmount: enrollment.agreedMonthlyFee,
          remainingAmount: enrollment.agreedMonthlyFee,
        },
      },
      { new: true, upsert: true },
    );
    return success({ invoice });
  } catch {
    return failure("FORBIDDEN", "Administrator access is required.", 403);
  }
}
