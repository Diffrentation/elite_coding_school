import { model, models, Schema } from "mongoose";

const siteSettingsSchema = new Schema(
  {
    key: { type: String, default: "singleton", unique: true },
    instituteName: { type: String, default: "Elite Coding School" },
    tagline: { type: String, default: "Learn. Build. Grow." },
    about: { type: String, default: "" },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    openingHours: { type: String, default: "" },
    socialLinks: { instagram: String, linkedin: String, youtube: String },
  },
  { timestamps: true, versionKey: "version" },
);

export const SiteSettings = models.SiteSettings || model("SiteSettings", siteSettingsSchema);
