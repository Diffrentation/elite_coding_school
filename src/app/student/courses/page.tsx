import { PortalShell } from "@/components/portal-shell";
import { StudentCourses } from "@/components/student-courses";

export default function StudentCoursesPage() {
  return (
    <PortalShell kind="student">
      <StudentCourses />
    </PortalShell>
  );
}
