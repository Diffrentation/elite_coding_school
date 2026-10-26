import { AdminFees } from "@/components/admin-fees";
import { PortalShell } from "@/components/portal-shell";

export default function AdminFeesPage() {
  return (
    <PortalShell kind="admin">
      <AdminFees />
    </PortalShell>
  );
}
