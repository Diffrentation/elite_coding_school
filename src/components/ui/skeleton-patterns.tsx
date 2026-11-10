"use client";

import React from "react";

/**
 * Single dummy skeleton block with shimmer wave animation
 */
export function SkeletonBlock({
  width = "100%",
  height = "16px",
  borderRadius = "6px",
  className = "",
  style,
}: {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`skeleton-shimmer ${className}`}
      style={{
        width,
        height,
        borderRadius,
        ...style,
      }}
      aria-hidden="true"
    />
  );
}

/**
 * Dummy empty KPI metric cards (used in Admin Dashboard & Stats)
 */
export function SkeletonMetricCards({ count = 4 }: { count?: number }) {
  return (
    <div
      className="admin-dashboard-kpi-grid"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
        gap: 18,
        marginBottom: 30,
      }}
    >
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="skeleton-metric-card">
          <SkeletonBlock width={50} height={50} borderRadius={12} className="skeleton-circle" />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>
            <SkeletonBlock width="45%" height={24} borderRadius={6} />
            <SkeletonBlock width="70%" height={12} borderRadius={4} />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Dummy empty table rows (used in AgTable and Admin Tables)
 */
export function SkeletonTableRows({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rIdx) => (
        <tr key={rIdx} className="skeleton-table-tr">
          {Array.from({ length: cols }).map((_, cIdx) => (
            <td key={cIdx} style={{ padding: "16px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {cIdx === 0 && <SkeletonBlock width={30} height={30} borderRadius="50%" />}
                <SkeletonBlock
                  width={cIdx === 0 ? "65%" : cIdx === cols - 1 ? "40%" : "80%"}
                  height={14}
                  borderRadius={5}
                />
              </div>
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

/**
 * Dummy empty cards (used in recent inquiries, queries, and grid cards)
 */
export function SkeletonCardsGrid({
  count = 4,
  columns = "repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
}: {
  count?: number;
  columns?: string;
}) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: columns, gap: 14 }}>
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="skeleton-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <SkeletonBlock width="55%" height={16} borderRadius={5} />
            <SkeletonBlock width={60} height={20} borderRadius={12} />
          </div>
          <SkeletonBlock width="40%" height={12} borderRadius={4} />
          <SkeletonBlock width="80%" height={12} borderRadius={4} />
          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <SkeletonBlock width={70} height={26} borderRadius={6} />
            <SkeletonBlock width={70} height={26} borderRadius={6} />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Full page skeleton pattern for initial page transitions
 */
export function SkeletonPagePattern({ title = "Loading page..." }: { title?: string }) {
  return (
    <main className="portal-content admin-skeleton-page" aria-busy="true" aria-label={title}>
      {/* Header skeleton */}
      <div style={{ marginBottom: 28, display: "flex", flexDirection: "column", gap: 8 }}>
        <SkeletonBlock width={140} height={12} borderRadius={4} />
        <SkeletonBlock width={280} height={32} borderRadius={8} />
        <SkeletonBlock width={480} height={14} borderRadius={5} />
      </div>

      {/* KPI cards skeleton */}
      <SkeletonMetricCards count={4} />

      {/* Main card skeleton */}
      <div
        style={{
          background: "#0a0f32",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: 18,
          overflow: "hidden",
          padding: 24,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
          <SkeletonBlock width={200} height={20} borderRadius={6} />
          <SkeletonBlock width={100} height={32} borderRadius={8} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {Array.from({ length: 5 }).map((_, idx) => (
            <SkeletonBlock key={idx} width="100%" height={38} borderRadius={8} />
          ))}
        </div>
      </div>
    </main>
  );
}

/**
 * Course detail page component skeleton
 */
export function CourseDetailSkeleton() {
  return (
    <div className="courses-redesign" aria-busy="true" aria-label="Loading course details...">
      {/* 1. Header Hero Skeleton */}
      <section className="courses-catalog-hero" style={{ paddingBottom: "60px", minHeight: "480px" }}>
        <div className="courses-hero-inner">
          <div className="courses-hero-copy">
            {/* Row 1: Back link */}
            <div style={{ marginBottom: "16px" }}>
              <SkeletonBlock width={160} height={18} borderRadius={6} />
            </div>

            {/* Row 2: Badge */}
            <div style={{ marginBottom: "18px" }}>
              <SkeletonBlock width={240} height={28} borderRadius={20} />
            </div>

            {/* Row 3: Heading */}
            <div style={{ marginBottom: "16px", display: "flex", flexDirection: "column", gap: 10 }}>
              <SkeletonBlock width="min(100%, 520px)" height={42} borderRadius={10} />
              <SkeletonBlock width="min(75%, 380px)" height={38} borderRadius={10} />
            </div>

            {/* Row 4: Lead */}
            <div style={{ marginBottom: "24px", display: "flex", flexDirection: "column", gap: 8 }}>
              <SkeletonBlock width="min(100%, 580px)" height={16} borderRadius={5} />
              <SkeletonBlock width="min(90%, 520px)" height={16} borderRadius={5} />
            </div>

            {/* Row 5: 4 Chips */}
            <div
              className="offline-chips-row"
              style={{ marginBottom: "28px", display: "flex", flexWrap: "wrap", gap: 10 }}
            >
              <SkeletonBlock width={140} height={34} borderRadius={8} />
              <SkeletonBlock width={130} height={34} borderRadius={8} />
              <SkeletonBlock width={150} height={34} borderRadius={8} />
              <SkeletonBlock width={160} height={34} borderRadius={8} />
            </div>

            {/* Row 6: Actions */}
            <div className="hero-actions" style={{ display: "flex", gap: 14 }}>
              <SkeletonBlock width={210} height={48} borderRadius={10} />
              <SkeletonBlock width={190} height={48} borderRadius={10} />
            </div>
          </div>

          {/* Right Column: Lab Specs Card */}
          <div
            className="lab-specs-card"
            style={{
              background: "#0a0f32",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: 18,
              padding: 24,
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <SkeletonBlock width={140} height={20} borderRadius={6} />
              <SkeletonBlock width={90} height={24} borderRadius={12} />
            </div>
            <SkeletonBlock width="100%" height={14} borderRadius={4} />
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 8 }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <SkeletonBlock width={24} height={24} borderRadius="50%" />
                  <SkeletonBlock width="75%" height={14} borderRadius={4} />
                </div>
              ))}
            </div>
            <SkeletonBlock width="100%" height={40} borderRadius={10} style={{ marginTop: 12 }} />
          </div>
        </div>
      </section>

      {/* 2. Syllabus / Curriculum Skeleton */}
      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "40px 24px 80px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 360px), 1fr))",
            gap: 36,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <SkeletonBlock width={220} height={28} borderRadius={8} />
            <SkeletonBlock width={360} height={14} borderRadius={4} style={{ marginBottom: 12 }} />
            {Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={idx}
                style={{
                  background: "#0a0f32",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: 14,
                  padding: "20px 24px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <SkeletonBlock width="60%" height={20} borderRadius={6} />
                  <SkeletonBlock width={24} height={24} borderRadius="50%" />
                </div>
                <SkeletonBlock width="40%" height={14} borderRadius={4} />
              </div>
            ))}
          </div>

          {/* Right column: Tuition summary skeleton */}
          <div
            style={{
              background: "#0a0f32",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: 18,
              padding: 24,
              display: "flex",
              flexDirection: "column",
              gap: 16,
              height: "fit-content",
            }}
          >
            <SkeletonBlock width={160} height={22} borderRadius={6} />
            <SkeletonBlock width={120} height={36} borderRadius={8} />
            <SkeletonBlock width="100%" height={14} borderRadius={4} />
            <SkeletonBlock width="100%" height={46} borderRadius={10} style={{ marginTop: 8 }} />
          </div>
        </div>
      </section>
    </div>
  );
}
