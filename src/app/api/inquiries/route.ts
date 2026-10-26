import { failure, success } from "@/lib/api";
import { connectDb } from "@/lib/db";
import { Inquiry } from "@/models/Inquiry";
import { inquirySchema } from "@/modules/inquiry/schema";
import { enforceRateLimit } from "@/lib/security";
export async function POST(request: Request) {
  const limited = enforceRateLimit(request, { name: "public-inquiry", limit: 5, windowMs: 15 * 60_000 });
  if (limited) return limited;
  const parsed = inquirySchema.safeParse(await request.json());
  if (!parsed.success) return failure("VALIDATION_ERROR", "Please complete the inquiry form.", 422);
  await connectDb();
  const inquiry = await Inquiry.create(parsed.data);
  return success({ inquiryId: inquiry._id, message: "Thanks. Our team will contact you." }, { status: 201 });
}
