import { PortalShell } from "@/components/portal-shell";
import { StudentDashboard } from "@/components/student-dashboard";

export default function StudentPage() {
  return (
    <PortalShell kind="student">
      <StudentDashboard />
    </PortalShell>
  );
}
