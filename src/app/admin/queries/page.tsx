import { AdminQueries } from "@/components/admin-queries";
import { PortalShell } from "@/components/portal-shell";

export default function AdminQueriesPage() {
  return (
    <PortalShell kind="admin">
      <AdminQueries />
    </PortalShell>
  );
}
