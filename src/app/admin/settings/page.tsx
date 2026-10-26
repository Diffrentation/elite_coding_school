import { AdminSettings } from "@/components/admin-settings";
import { PortalShell } from "@/components/portal-shell";

export default function AdminSettingsPage() {
  return (
    <PortalShell kind="admin">
      <AdminSettings />
    </PortalShell>
  );
}
