import { AdminDashboard } from "@/components/admin-dashboard";
import { PortalShell } from "@/components/portal-shell";

export default function AdminPage() {
  return (
    <PortalShell kind="admin">
      <AdminDashboard />
    </PortalShell>
  );
}
