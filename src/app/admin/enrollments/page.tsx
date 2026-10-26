import { AdminEnrollments } from "@/components/admin-enrollments";
import { PortalShell } from "@/components/portal-shell";

export default function AdminEnrollmentsPage() {
  return (
    <PortalShell kind="admin">
      <AdminEnrollments />
    </PortalShell>
  );
}
