import { NextRequest } from "next/server";
import { connectDb } from "@/lib/db";
import { failure, success } from "@/lib/api";
import { requireAdminSession } from "@/modules/identity/session";
import { Category } from "@/models/Category";
import { Course } from "@/models/Course";
import { z } from "zod";

const createCategorySchema = z.object({
  name: z.string().trim().min(2, "Category name must be at least 2 characters.").max(100),
  icon: z.string().trim().default("Code2"),
  description: z.string().trim().max(1000).optional().default(""),
  techTags: z
    .union([z.array(z.string().trim()), z.string()])
    .optional()
    .default([]),
  ctaLabel: z.string().trim().max(100).optional().default(""),
  color: z.string().trim().max(40).optional().default("#a855f7"),
});

export async function GET() {
  await connectDb();
  try {
    await requireAdminSession();
    const categories = await Category.find().sort({ createdAt: -1 }).lean();
    return success({ categories });
  } catch {
    return failure("FORBIDDEN", "Administrator access is required.", 403);
  }
}

export async function POST(request: NextRequest) {
  await connectDb();
  try {
    await requireAdminSession();
    const body = await request.json();
    const parsed = createCategorySchema.safeParse(body);
    if (!parsed.success) {
      return failure("VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "Invalid category data.", 422);
    }

    const { name, icon, description, ctaLabel, color } = parsed.data;
    let techTagsArray: string[] = [];
    if (Array.isArray(parsed.data.techTags)) {
      techTagsArray = parsed.data.techTags.map((t) => t.trim()).filter(Boolean);
    } else if (typeof parsed.data.techTags === "string") {
      techTagsArray = parsed.data.techTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const existing = await Category.findOne({
      $or: [{ name: new RegExp(`^${name}$`, "i") }, { slug }],
    });

    if (existing) {
      return failure("CONFLICT", "A category with this name already exists.", 409);
    }

    const category = await Category.create({
      name,
      slug,
      icon: icon || "Code2",
      description: description || "",
      techTags: techTagsArray,
      ctaLabel: ctaLabel || `View ${name} Courses`,
      color: color || "#a855f7",
    });

    return success({ category }, { status: 201 });
  } catch (err: any) {
    if (err?.code === 11000) {
      return failure("CONFLICT", "A category with this name or slug already exists.", 409);
    }
    return failure("FORBIDDEN", "Administrator access is required.", 403);
  }
}

export async function DELETE(request: NextRequest) {
  await connectDb();
  try {
    await requireAdminSession();
    const { searchParams } = request.nextUrl;
    const id = searchParams.get("id");
    const name = searchParams.get("name");

    if (!id && !name) {
      return failure("BAD_REQUEST", "Category ID or name is required.", 400);
    }

    const query: any = id ? { _id: id } : { name };
    const category = await Category.findOne(query);
    if (!category) {
      return failure("NOT_FOUND", "Category not found.", 404);
    }

    // Check if courses are using this category
    const inUse = await Course.countDocuments({ category: category.name });
    if (inUse > 0) {
      return failure(
        "CONFLICT",
        `Cannot delete "${category.name}" because ${inUse} course(s) are currently assigned to it.`,
        409,
      );
    }

    await Category.deleteOne({ _id: category._id });
    return success({ message: "Category deleted successfully." });
  } catch {
    return failure("FORBIDDEN", "Administrator access is required.", 403);
  }
}
