import { AdminCourses } from "@/components/admin-courses";
import { PortalShell } from "@/components/portal-shell";

export default function AdminCoursesPage() {
  return (
    <PortalShell kind="admin">
      <main className="portal-content">
        <AdminCourses />
      </main>
    </PortalShell>
  );
}
