"use client";

import Link from "next/link";
import { SkeletonBlock, SkeletonTableRows, SkeletonCardsGrid } from "@/components/ui/skeleton-patterns";
import { useEffect, useState } from "react";
import {
  Users,
  BookOpen,
  MessageSquare,
  ArrowUpRight,
  Inbox,
  Sparkles,
  Phone,
  MessageCircle,
  Plus,
  Receipt,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
} from "lucide-react";

type DashboardData = {
  metrics: {
    students: number;
    activeCourses: number;
    openQueries: number;
    newInquiries?: number;
  };
  recentStudents: Array<{
    _id: string;
    studentId: string;
    fullName: string;
    admissionStatus: string;
    registrationDate: string;
  }>;
  recentQueries: Array<{
    _id: string;
    subject: string;
    category: string;
    status: string;
    createdAt: string;
    userId?: { pendingName?: string; email?: string } | null;
  }>;
  recentInquiries?: Array<{
    _id: string;
    fullName: string;
    phone: string;
    type: string;
    interestedCourse: string;
    status: string;
    createdAt: string;
  }>;
};

const displayDate = (date: string) =>
  new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(
    new Date(date),
  );

export function AdminDashboard() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error?.message ?? "Could not load the dashboard.");
        setDashboard(body.data);
      })
      .catch((reason: Error) => setError(reason.message))
      .finally(() => setLoading(false));
  }, []);

  const metrics = dashboard?.metrics ?? {
    students: 0,
    activeCourses: 0,
    openQueries: 0,
    newInquiries: 0,
  };

  return (
    <main className="portal-content admin-dashboard-page">
      {/* Top Banner / Command Center Header */}
      <section className="admin-command-hero">
        <div className="admin-command-hero-copy">
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                fontWeight: 700,
                color: "#38bdf8",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                background: "rgba(56, 189, 248, 0.12)",
                padding: "3px 10px",
                borderRadius: 20,
                border: "1px solid rgba(56, 189, 248, 0.25)",
              }}
            >
              ADMIN COMMAND CENTER
            </span>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: 12,
                color: "#34d399",
                fontWeight: 600,
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#10b981",
                  boxShadow: "0 0 0 3px rgba(16, 185, 129, 0.3)",
                }}
              />
              Live institute operations
            </span>
          </div>

          <h1
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(22px, 3.2vw, 36px)",
              color: "#ffffff",
              margin: "6px 0 10px",
              lineHeight: 1.2,
            }}
          >
            Institute at a <span style={{ color: "#c084fc" }}>glance.</span>
          </h1>

          <p style={{ color: "#94a3b8", fontSize: "14px", margin: 0, lineHeight: 1.6 }}>
            Real-time management of registered students, curriculum offerings, public admission leads, and support queries.
          </p>
        </div>

        {/* Quick Action Shortcuts */}
        <div className="admin-hero-actions">
          <Link
            href="/admin/courses"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 18px",
              borderRadius: 10,
              background: "linear-gradient(135deg, #7c3aed, #9333ea)",
              color: "#ffffff",
              fontSize: 13,
              fontWeight: 700,
              textDecoration: "none",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              boxShadow: "0 6px 18px rgba(124, 58, 237, 0.4)",
              transition: "transform 0.15s ease",
            }}
          >
            <Plus size={16} /> Add Course
          </Link>

          <Link
            href="/admin/students"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 18px",
              borderRadius: 10,
              background: "rgba(255, 255, 255, 0.06)",
              color: "#e2e8f0",
              fontSize: 13,
              fontWeight: 600,
              textDecoration: "none",
              border: "1px solid rgba(255, 255, 255, 0.12)",
            }}
          >
            <Users size={16} /> Students & Leads
          </Link>

          <Link
            href="/admin/fees"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 18px",
              borderRadius: 10,
              background: "rgba(255, 255, 255, 0.06)",
              color: "#e2e8f0",
              fontSize: 13,
              fontWeight: 600,
              textDecoration: "none",
              border: "1px solid rgba(255, 255, 255, 0.12)",
            }}
          >
            <Receipt size={16} /> Invoices & Fees
          </Link>
        </div>
      </section>

      {error && (
        <div style={{ background: "rgba(239, 68, 68, 0.12)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#fca5a5", padding: "14px 18px", borderRadius: 12, marginBottom: 24 }}>
          {error}
        </div>
      )}

      {/* 4 KPI Metric Cards */}
      <section
        className="admin-dashboard-kpi-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
          gap: 18,
          marginBottom: 30,
        }}
      >
        {/* Metric 1: Students */}
        <div
          style={{
            background: "#0a0f32",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: 16,
            padding: 22,
            display: "flex",
            alignItems: "center",
            gap: 16,
            position: "relative",
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.25)",
          }}
        >
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: 12,
              background: "rgba(124, 58, 237, 0.18)",
              color: "#c084fc",
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
            }}
          >
            <Users size={24} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <strong style={{ fontSize: 28, fontFamily: "var(--font-heading)", color: "#ffffff", display: "block", lineHeight: 1.1 }}>
              {loading ? <SkeletonBlock width={52} height={28} borderRadius={6} /> : metrics.students.toLocaleString("en-IN")}
            </strong>
            <span style={{ fontSize: 13, color: "#94a3b8", display: "block", marginTop: 4 }}>
              Registered Students
            </span>
          </div>
          <Link
            href="/admin/students"
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "rgba(255, 255, 255, 0.05)",
              display: "grid",
              placeItems: "center",
              color: "#94a3b8",
              textDecoration: "none",
            }}
            title="View students"
          >
            <ArrowUpRight size={16} />
          </Link>
        </div>

        {/* Metric 2: Courses */}
        <div
          style={{
            background: "#0a0f32",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: 16,
            padding: 22,
            display: "flex",
            alignItems: "center",
            gap: 16,
            position: "relative",
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.25)",
          }}
        >
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: 12,
              background: "rgba(16, 185, 129, 0.18)",
              color: "#34d399",
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
            }}
          >
            <BookOpen size={24} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <strong style={{ fontSize: 28, fontFamily: "var(--font-heading)", color: "#ffffff", display: "block", lineHeight: 1.1 }}>
              {loading ? <SkeletonBlock width={52} height={28} borderRadius={6} /> : metrics.activeCourses.toLocaleString("en-IN")}
            </strong>
            <span style={{ fontSize: 13, color: "#94a3b8", display: "block", marginTop: 4 }}>
              Published Courses
            </span>
          </div>
          <Link
            href="/admin/courses"
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "rgba(255, 255, 255, 0.05)",
              display: "grid",
              placeItems: "center",
              color: "#94a3b8",
              textDecoration: "none",
            }}
            title="View courses"
          >
            <ArrowUpRight size={16} />
          </Link>
        </div>

        {/* Metric 3: Leads & Inquiries */}
        <div
          style={{
            background: "#0a0f32",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: 16,
            padding: 22,
            display: "flex",
            alignItems: "center",
            gap: 16,
            position: "relative",
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.25)",
          }}
        >
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: 12,
              background: "rgba(56, 189, 248, 0.18)",
              color: "#38bdf8",
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
            }}
          >
            <Inbox size={24} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <strong style={{ fontSize: 28, fontFamily: "var(--font-heading)", color: "#ffffff", display: "block", lineHeight: 1.1 }}>
              {loading ? <SkeletonBlock width={52} height={28} borderRadius={6} /> : (dashboard?.recentInquiries?.length ?? metrics.newInquiries ?? 0)}
            </strong>
            <span style={{ fontSize: 13, color: "#94a3b8", display: "block", marginTop: 4 }}>
              Website Demo Leads
            </span>
          </div>
          <Link
            href="/admin/inquiries"
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "rgba(255, 255, 255, 0.05)",
              display: "grid",
              placeItems: "center",
              color: "#94a3b8",
              textDecoration: "none",
            }}
            title="View inquiries"
          >
            <ArrowUpRight size={16} />
          </Link>
        </div>

        {/* Metric 4: Open Queries */}
        <div
          style={{
            background: "#0a0f32",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: 16,
            padding: 22,
            display: "flex",
            alignItems: "center",
            gap: 16,
            position: "relative",
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.25)",
          }}
        >
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: 12,
              background: "rgba(245, 158, 11, 0.18)",
              color: "#fbbf24",
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
            }}
          >
            <MessageSquare size={24} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <strong style={{ fontSize: 28, fontFamily: "var(--font-heading)", color: "#ffffff", display: "block", lineHeight: 1.1 }}>
              {loading ? <SkeletonBlock width={52} height={28} borderRadius={6} /> : metrics.openQueries.toLocaleString("en-IN")}
            </strong>
            <span style={{ fontSize: 13, color: "#94a3b8", display: "block", marginTop: 4 }}>
              Pending Student Queries
            </span>
          </div>
          <Link
            href="/admin/queries"
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "rgba(255, 255, 255, 0.05)",
              display: "grid",
              placeItems: "center",
              color: "#94a3b8",
              textDecoration: "none",
            }}
            title="Answer queries"
          >
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </section>

      {/* Main Grid: Recent Students & Recent Queries */}
      <div className="admin-dashboard-dual-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 460px), 1fr))", gap: 24, marginBottom: 28 }}>
        {/* Card 1: Recent Registered Students */}
        <section
          style={{
            background: "#0a0f32",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: 18,
            overflow: "hidden",
            boxShadow: "0 14px 35px rgba(0, 0, 0, 0.35)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              padding: "20px 24px",
              borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <h2 style={{ margin: 0, fontSize: 17, fontFamily: "var(--font-heading)", color: "#ffffff" }}>
                Recent Students
              </h2>
              <p style={{ margin: "3px 0 0", fontSize: 12.5, color: "#94a3b8" }}>
                Latest learners registered on the platform
              </p>
            </div>
            <Link
              href="/admin/students"
              style={{
                fontSize: 12.5,
                fontWeight: 600,
                color: "#c084fc",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              View all &rarr;
            </Link>
          </div>

          <div style={{ overflowX: "auto" }}>
            {loading ? (
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#070b24", borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}>
                    <th style={{ padding: "12px 20px", color: "#94a3b8", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Student</th>
                    <th style={{ padding: "12px 16px", color: "#94a3b8", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Student ID</th>
                    <th style={{ padding: "12px 16px", color: "#94a3b8", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Admission</th>
                    <th style={{ padding: "12px 20px", color: "#94a3b8", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  <SkeletonTableRows rows={5} cols={4} />
                </tbody>
              </table>
            ) : dashboard?.recentStudents.length ? (
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#070b24", borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}>
                    <th style={{ padding: "12px 20px", color: "#94a3b8", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Student</th>
                    <th style={{ padding: "12px 16px", color: "#94a3b8", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Student ID</th>
                    <th style={{ padding: "12px 16px", color: "#94a3b8", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Admission</th>
                    <th style={{ padding: "12px 20px", color: "#94a3b8", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.recentStudents.map((student) => {
                    const statusColor =
                      student.admissionStatus === "approved"
                        ? { bg: "rgba(16, 185, 129, 0.15)", text: "#34d399", border: "rgba(16, 185, 129, 0.3)" }
                        : student.admissionStatus === "pending"
                        ? { bg: "rgba(245, 158, 11, 0.15)", text: "#fbbf24", border: "rgba(245, 158, 11, 0.3)" }
                        : student.admissionStatus === "rejected"
                        ? { bg: "rgba(239, 68, 68, 0.15)", text: "#f87171", border: "rgba(239, 68, 68, 0.3)" }
                        : { bg: "rgba(148, 163, 184, 0.15)", text: "#cbd5e1", border: "rgba(148, 163, 184, 0.3)" };

                    return (
                      <tr key={student._id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>
                        <td style={{ padding: "14px 20px", whiteSpace: "nowrap" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: "50%",
                                background: "linear-gradient(135deg, #7c3aed, #a855f7)",
                                color: "#ffffff",
                                display: "grid",
                                placeItems: "center",
                                fontWeight: 700,
                                fontSize: 12,
                                flexShrink: 0,
                              }}
                            >
                              {student.fullName.slice(0, 1).toUpperCase()}
                            </span>
                            <span style={{ fontWeight: 600, color: "#ffffff" }}>{student.fullName}</span>
                          </div>
                        </td>
                        <td style={{ padding: "14px 16px", whiteSpace: "nowrap" }}>
                          <span
                            style={{
                              fontFamily: "var(--font-mono)",
                              fontSize: 11.5,
                              color: "#cbd5e1",
                              background: "rgba(255, 255, 255, 0.05)",
                              padding: "2px 8px",
                              borderRadius: 5,
                              border: "1px solid rgba(255, 255, 255, 0.1)",
                            }}
                          >
                            {student.studentId}
                          </span>
                        </td>
                        <td style={{ padding: "14px 16px", whiteSpace: "nowrap" }}>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              textTransform: "uppercase",
                              padding: "3px 8px",
                              borderRadius: 5,
                              background: statusColor.bg,
                              color: statusColor.text,
                              border: `1px solid ${statusColor.border}`,
                            }}
                          >
                            {student.admissionStatus.replace("_", " ")}
                          </span>
                        </td>
                        <td style={{ padding: "14px 20px", color: "#94a3b8", fontSize: 12, whiteSpace: "nowrap" }}>
                          {displayDate(student.registrationDate)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div style={{ padding: 36, textAlign: "center", color: "#64748b" }}>
                No registered students recorded yet.
              </div>
            )}
          </div>
        </section>

        {/* Card 2: Recent Support Queries */}
        <section
          style={{
            background: "#0a0f32",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: 18,
            overflow: "hidden",
            boxShadow: "0 14px 35px rgba(0, 0, 0, 0.35)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              padding: "20px 24px",
              borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <h2 style={{ margin: 0, fontSize: 17, fontFamily: "var(--font-heading)", color: "#ffffff" }}>
                Recent Student Queries
              </h2>
              <p style={{ margin: "3px 0 0", fontSize: 12.5, color: "#94a3b8" }}>
                Student questions requiring instructor or admin response
              </p>
            </div>
            <Link
              href="/admin/queries"
              style={{
                fontSize: 12.5,
                fontWeight: 600,
                color: "#c084fc",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              View all &rarr;
            </Link>
          </div>

          <div style={{ overflowX: "auto" }}>
            {loading ? (
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#070b24", borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}>
                    <th style={{ padding: "12px 20px", color: "#94a3b8", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Query & Topic</th>
                    <th style={{ padding: "12px 16px", color: "#94a3b8", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Student</th>
                    <th style={{ padding: "12px 16px", color: "#94a3b8", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Status</th>
                    <th style={{ padding: "12px 20px", color: "#94a3b8", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  <SkeletonTableRows rows={4} cols={4} />
                </tbody>
              </table>
            ) : dashboard?.recentQueries.length ? (
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#070b24", borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}>
                    <th style={{ padding: "12px 20px", color: "#94a3b8", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Query & Topic</th>
                    <th style={{ padding: "12px 16px", color: "#94a3b8", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Student</th>
                    <th style={{ padding: "12px 16px", color: "#94a3b8", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Status</th>
                    <th style={{ padding: "12px 20px", color: "#94a3b8", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.recentQueries.map((query) => {
                    const statusColor =
                      query.status === "answered"
                        ? { bg: "rgba(16, 185, 129, 0.15)", text: "#34d399", border: "rgba(16, 185, 129, 0.3)" }
                        : query.status === "new"
                        ? { bg: "rgba(56, 189, 248, 0.15)", text: "#38bdf8", border: "rgba(56, 189, 248, 0.3)" }
                        : { bg: "rgba(148, 163, 184, 0.15)", text: "#cbd5e1", border: "rgba(148, 163, 184, 0.3)" };

                    return (
                      <tr key={query._id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>
                        <td style={{ padding: "14px 20px" }}>
                          <b style={{ color: "#ffffff", display: "block", fontSize: 13.5 }}>{query.subject}</b>
                          <span style={{ fontSize: 11, color: "#a855f7", textTransform: "capitalize" }}>{query.category}</span>
                        </td>
                        <td style={{ padding: "14px 16px", color: "#e2e8f0", whiteSpace: "nowrap" }}>
                          {query.userId?.pendingName || "Student"}
                        </td>
                        <td style={{ padding: "14px 16px", whiteSpace: "nowrap" }}>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              textTransform: "uppercase",
                              padding: "3px 8px",
                              borderRadius: 5,
                              background: statusColor.bg,
                              color: statusColor.text,
                              border: `1px solid ${statusColor.border}`,
                            }}
                          >
                            {query.status}
                          </span>
                        </td>
                        <td style={{ padding: "14px 20px", color: "#94a3b8", fontSize: 12, whiteSpace: "nowrap" }}>
                          {displayDate(query.createdAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div style={{ padding: 36, textAlign: "center", color: "#64748b" }}>
                No pending queries from students.
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Card 3: Latest Public Inquiries & Leads (Full width bar) */}
      {(loading || (dashboard?.recentInquiries && dashboard.recentInquiries.length > 0)) && (
        <section
          style={{
            background: "#0a0f32",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: 18,
            padding: "24px",
            boxShadow: "0 14px 35px rgba(0, 0, 0, 0.35)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 17, fontFamily: "var(--font-heading)", color: "#ffffff", display: "flex", alignItems: "center", gap: 8 }}>
                <Sparkles size={18} color="#38bdf8" /> Latest Website Demo & Admission Leads
              </h3>
              <p style={{ margin: "3px 0 0", fontSize: 12.5, color: "#94a3b8" }}>
                Prospective students who reached out via the website for trial classes or fee inquiries
              </p>
            </div>
            <Link
              href="/admin/inquiries"
              style={{
                fontSize: 12.5,
                fontWeight: 600,
                color: "#38bdf8",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              All Inquiries &rarr;
            </Link>
          </div>

          {loading ? (
            <SkeletonCardsGrid count={4} columns="repeat(auto-fit, minmax(min(100%, 260px), 1fr))" />
          ) : (
            <div className="admin-dashboard-inquiries-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))", gap: 14 }}>
              {dashboard?.recentInquiries?.map((inquiry) => {
const rawPhone = inquiry.phone.replace(/[^0-9]/g, "");
              const waPhone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;
              const waUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(
                `Hi ${inquiry.fullName}, greetings from Elite Coding School regarding your ${inquiry.type === "demo" ? "free demo class" : "admission inquiry"}.`,
              )}`;

              return (
                <div
                  key={inquiry._id}
                  style={{
                    background: "#070b24",
                    border: "1px solid rgba(255, 255, 255, 0.06)",
                    borderRadius: 12,
                    padding: 16,
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <b style={{ color: "#ffffff", fontSize: 14 }}>{inquiry.fullName}</b>
                      <span
                        style={{
                          display: "inline-block",
                          marginLeft: 8,
                          fontSize: 10,
                          fontWeight: 700,
                          textTransform: "uppercase",
                          padding: "2px 6px",
                          borderRadius: 4,
                          background: inquiry.type === "demo" ? "rgba(56, 189, 248, 0.15)" : "rgba(168, 85, 247, 0.15)",
                          color: inquiry.type === "demo" ? "#38bdf8" : "#c084fc",
                        }}
                      >
                        {inquiry.type === "demo" ? "Demo Trial" : "Admission"}
                      </span>
                    </div>
                    <span style={{ fontSize: 11, color: "#64748b" }}>{displayDate(inquiry.createdAt)}</span>
                  </div>

                  <div style={{ fontSize: 12, color: "#94a3b8" }}>
                    Course: <strong style={{ color: "#cbd5e1" }}>{inquiry.interestedCourse || "General Counseling"}</strong>
                  </div>

                  <div style={{ display: "flex", gap: 8, marginTop: "auto", paddingTop: 8, borderTop: "1px solid rgba(255, 255, 255, 0.06)" }}>
                    <a
                      href={`tel:${inquiry.phone}`}
                      style={{
                        flex: 1,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 5,
                        padding: "6px 10px",
                        borderRadius: 6,
                        background: "rgba(56, 189, 248, 0.1)",
                        color: "#38bdf8",
                        fontSize: 11.5,
                        fontWeight: 600,
                        textDecoration: "none",
                        border: "1px solid rgba(56, 189, 248, 0.2)",
                      }}
                    >
                      <Phone size={11} /> Call
                    </a>
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        flex: 1,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 5,
                        padding: "6px 10px",
                        borderRadius: 6,
                        background: "rgba(34, 197, 94, 0.12)",
                        color: "#4ade80",
                        fontSize: 11.5,
                        fontWeight: 600,
                        textDecoration: "none",
                        border: "1px solid rgba(34, 197, 94, 0.25)",
                      }}
                    >
                      <MessageCircle size={11} /> WhatsApp
                    </a>
                  </div>
                </div>
              );
            })}
            </div>
          )}
        </section>
      )}
    </main>
  );
}
