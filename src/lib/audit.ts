import { AuditLog } from "@/models/AuditLog";
export async function audit(
  action: string,
  entityType: string,
  entityId: string,
  actorUserId?: string,
  metadata: Record<string, unknown> = {},
) {
  await AuditLog.create({ action, entityType, entityId, actorUserId: actorUserId ?? null, metadata });
}
