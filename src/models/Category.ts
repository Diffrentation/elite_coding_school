import { Schema, model, models } from "mongoose";

const categorySchema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    icon: { type: String, default: "Code2" },
    description: { type: String, default: "" },
    techTags: [{ type: String }],
    ctaLabel: { type: String, default: "" },
    color: { type: String, default: "#a855f7" },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

categorySchema.index({ slug: 1 });

export const Category = models.Category || model("Category", categorySchema);
