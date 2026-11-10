import { Navbar } from "@/components/navbar";
import { SkeletonBlock } from "@/components/ui/skeleton-patterns";

export default function CoursesCatalogLoading() {
  return (
    <main className="courses-redesign" aria-busy="true" aria-label="Loading courses catalog...">
      <Navbar activePage="courses" />

      {/* Hero skeleton */}
      <section className="courses-catalog-hero" style={{ paddingBottom: "48px" }}>
        <div className="courses-hero-inner">
          <div className="courses-hero-copy">
            <SkeletonBlock width={220} height={28} borderRadius={20} style={{ marginBottom: 16 }} />
            <SkeletonBlock
              width="min(100%, 480px)"
              height={44}
              borderRadius={10}
              style={{ marginBottom: 12 }}
            />
            <SkeletonBlock
              width="min(80%, 380px)"
              height={28}
              borderRadius={8}
              style={{ marginBottom: 16 }}
            />
            <SkeletonBlock
              width="min(100%, 540px)"
              height={16}
              borderRadius={5}
              style={{ marginBottom: 8 }}
            />
            <SkeletonBlock
              width="min(90%, 460px)"
              height={16}
              borderRadius={5}
              style={{ marginBottom: 24 }}
            />
            <div style={{ display: "flex", gap: 10 }}>
              <SkeletonBlock width={140} height={36} borderRadius={8} />
              <SkeletonBlock width={140} height={36} borderRadius={8} />
              <SkeletonBlock width={160} height={36} borderRadius={8} />
            </div>
          </div>
        </div>
      </section>

      {/* Cards Grid Skeleton */}
      <section
        className="catalog-content-section"
        style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px 60px" }}
      >
        <div
          className="courses-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))",
            gap: 24,
          }}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <div className="course-skeleton" key={i} />
          ))}
        </div>
      </section>
    </main>
  );
}
