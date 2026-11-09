import { CourseDetailSkeleton } from "@/components/ui/skeleton-patterns";
import { Navbar } from "@/components/navbar";

export default function CourseSlugLoading() {
  return (
    <>
      <Navbar activePage="courses" />
      <CourseDetailSkeleton />
    </>
  );
}
