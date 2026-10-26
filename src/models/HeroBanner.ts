import { model, models, Schema } from "mongoose";

const heroBannerSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 140 },
    description: { type: String, maxlength: 400, default: "" },
    desktopImageUrl: { type: String, default: null },
    mobileImageUrl: { type: String, default: null },
    ctaLabel: { type: String, maxlength: 50, default: "Explore courses" },
    ctaUrl: { type: String, maxlength: 250, default: "/courses" },
    status: { type: String, enum: ["draft", "published", "archived"], default: "draft" },
    order: { type: Number, default: 0 },
  },
  { timestamps: true, versionKey: "version" },
);

heroBannerSchema.index({ status: 1, order: 1 });
export const HeroBanner = models.HeroBanner || model("HeroBanner", heroBannerSchema);
