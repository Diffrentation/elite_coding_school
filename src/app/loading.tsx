import { SkeletonBlock, SkeletonCardsGrid } from "@/components/ui/skeleton-patterns";

export default function RootLoading() {
  return (
    <div
      style={{
        minHeight: "75vh",
        padding: "48px 24px",
        maxWidth: 1200,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: 28,
      }}
      aria-busy="true"
      aria-label="Loading content..."
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          alignItems: "center",
          textAlign: "center",
          margin: "24px 0",
        }}
      >
        <SkeletonBlock width={130} height={20} borderRadius={20} />
        <SkeletonBlock width="min(90%, 460px)" height={36} borderRadius={10} />
        <SkeletonBlock width="min(80%, 320px)" height={16} borderRadius={6} />
      </div>

      <SkeletonCardsGrid count={6} columns="repeat(auto-fit, minmax(min(100%, 320px), 1fr))" />
    </div>
  );
}
