import { AdminStudents } from "@/components/admin-students";
import { PortalShell } from "@/components/portal-shell";

export default function AdminStudentsPage() {
  return (
    <PortalShell kind="admin">
      <AdminStudents />
    </PortalShell>
  );
}
