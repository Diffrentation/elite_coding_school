import { PortalShell } from "@/components/portal-shell";
import { StudentQueries } from "@/components/student-queries";
export default function StudentQueriesPage() {
  return (
    <PortalShell kind="student">
      <main className="portal-content">
        <StudentQueries />
      </main>
    </PortalShell>
  );
}
