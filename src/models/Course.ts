import { Schema, model, models } from "mongoose";
const moduleSchema = new Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    order: { type: Number, required: true },
    topics: [{ type: String }],
  },
  { _id: false },
);
const courseSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    icon: { type: String, default: "Code2" },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    shortDescription: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    level: { type: String, enum: ["beginner", "intermediate", "advanced"], required: true },
    durationMonths: { type: Number, required: true, min: 1, max: 60 },
    monthlyFee: { type: Number, required: true, min: 0 },
    prerequisites: [String],
    skills: [String],
    syllabus: [moduleSchema],
    thumbnailUrl: { type: String, default: null },
    heroImageUrl: { type: String, default: null },
    mode: { type: String, enum: ["offline"], default: "offline" },
    isFeatured: { type: Boolean, default: false },
    status: { type: String, enum: ["draft", "published", "archived"], default: "draft" },
    order: { type: Number, default: 0 },
  },
  { timestamps: true, versionKey: "version" },
);
courseSchema.index({ status: 1, order: 1 });
export const Course = models.Course || model("Course", courseSchema);
