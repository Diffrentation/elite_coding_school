import { PortalShell } from "@/components/portal-shell";
import { StudentFees } from "@/components/student-fees";

export default function StudentFeesPage() {
  return (
    <PortalShell kind="student">
      <StudentFees />
    </PortalShell>
  );
}
