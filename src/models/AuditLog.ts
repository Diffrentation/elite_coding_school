import { model, models, Schema } from "mongoose";
const auditLogSchema = new Schema(
  {
    actorUserId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    action: { type: String, required: true, index: true },
    entityType: { type: String, required: true },
    entityId: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);
auditLogSchema.index({ createdAt: -1 });
export const AuditLog = models.AuditLog || model("AuditLog", auditLogSchema);
