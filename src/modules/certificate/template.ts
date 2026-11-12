import { CertificateTemplate } from "@/models/CertificateTemplate";

/**
 * The institute-issued base artwork is shipped with the application. It is
 * created as the active database template on first use, so certificate issuing
 * never depends on an administrator manually uploading it.
 */
export const DEFAULT_CERTIFICATE_TEMPLATE = {
  name: "Elite Coding School Official Certificate",
  imageUrl: "/certificates/elite-certificate-template-v3.png",
} as const;

const LEGACY_DEFAULT_TEMPLATE_URL = "/certificates/elite-certificate-template.png";
const PREVIOUS_BUNDLED_TEMPLATE_URL = "/certificates/elite-certificate-template-v2.png";

export async function getActiveCertificateTemplate(adminUserId: string) {
  const active = await CertificateTemplate.findOne({ active: true }).sort({ updatedAt: -1 });
  if (active) {
    // Upgrade only the previous bundled default. Uploaded custom artwork and
    // certificate records already issued with the older artwork stay untouched.
    if (active.imageUrl === LEGACY_DEFAULT_TEMPLATE_URL || active.imageUrl === PREVIOUS_BUNDLED_TEMPLATE_URL) {
      active.name = DEFAULT_CERTIFICATE_TEMPLATE.name;
      active.imageUrl = DEFAULT_CERTIFICATE_TEMPLATE.imageUrl;
      await active.save();
    }
    return active;
  }

  const defaultTemplate = await CertificateTemplate.findOneAndUpdate(
    { imageUrl: DEFAULT_CERTIFICATE_TEMPLATE.imageUrl },
    {
      $setOnInsert: {
        ...DEFAULT_CERTIFICATE_TEMPLATE,
        updatedBy: adminUserId,
      },
      $set: { active: true },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );

  // An upload can replace this template later, but only one template is active.
  await CertificateTemplate.updateMany(
    { _id: { $ne: defaultTemplate._id }, active: true },
    { $set: { active: false } },
  );

  return defaultTemplate;
}
