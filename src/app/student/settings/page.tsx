import { PortalShell } from "@/components/portal-shell";
import { StudentSettings } from "@/components/student-settings";

export default function StudentSettingsPage() {
  return (
    <PortalShell kind="student">
      <StudentSettings />
    </PortalShell>
  );
}
