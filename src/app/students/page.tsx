"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Code2,
  GraduationCap,
  Layers,
  Search,
  ShieldCheck,
  Sparkles,
  Terminal,
  Users,
  X,
} from "lucide-react";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";

type Student = {
  studentId: string;
  fullName: string;
  profileImageUrl?: string | null;
  courseName?: string;
  batch?: string;
  completionDate?: string;
};

const DEFAULT_COURSES = [
  "Full-Stack MERN & Next.js Development",
  "Frontend Development, Tailwind CSS & GSAP",
  "Backend Development & REST APIs",
];

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [course, setCourse] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const query = new URLSearchParams({ limit: "24" });
    if (search.trim()) query.set("search", search.trim());
    if (course) query.set("course", course);
    setLoading(true);
    fetch(`/api/students?${query}`)
      .then((r) => r.json())
      .then((body) => {
        setStudents(body.data?.students ?? []);
        const apiCourses = body.data?.courses ?? [];
        setCourses(apiCourses.length ? apiCourses : DEFAULT_COURSES);
      })
      .catch(() => {
        setStudents([]);
        setCourses(DEFAULT_COURSES);
      })
      .finally(() => setLoading(false));
  }, [search, course]);

  const hasFilters = Boolean(search.trim() || course);

  const resetFilters = () => {
    setSearch("");
    setCourse("");
  };

  return (
    <>
      <Navbar activePage="students" />

      <main className="students-directory-page">
        <div className="students-container">
          {/* 1. HERO SECTION */}
          <section className="students-hero">
            <div className="students-kicker">
              <span className="pulse-dot-green" />
              <span className="students-kicker-desktop">OFFICIAL INSTITUTIONAL REGISTRY · VERIFIED GRADUATES</span>
              <span className="students-kicker-mobile">OFFICIAL REGISTRY · VERIFIED GRADUATES</span>
              <span className="students-kicker-compact">VERIFIED STUDENT DIRECTORY</span>
            </div>

            <h1 className="students-title">
              Our <span className="students-title-gradient">Certified Learners</span> &amp; Alumni
            </h1>

            <p className="students-lead">
              Meet our graduates who have mastered hands-on software engineering at our offline tech lab,
              built production-grade full-stack projects, and earned official institutional credentials.
            </p>

            <div className="students-features-row">
              <div className="students-feature-chip">
                <Terminal size={14} />
                <span>100% Offline Coding Lab</span>
              </div>
              <div className="students-feature-chip">
                <Users size={14} />
                <span>1:1 Instructor Mentorship</span>
              </div>
              <div className="students-feature-chip">
                <ShieldCheck size={14} />
                <span>Cryptographically Verifiable</span>
              </div>
              <div className="students-feature-chip">
                <Code2 size={14} />
                <span>Real Production Projects</span>
              </div>
            </div>
          </section>

          {/* 2. SEARCH & FILTER CONTROLS */}
          <section className="students-controls-card">
            <div className="students-search-row">
              <div className="students-search-wrap">
                <Search size={17} className="students-search-icon" />
                <input
                  aria-label="Search certified learners"
                  className="students-search-input"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by student name or roll number..."
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    aria-label="Clear search"
                    className="students-search-clear"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              <div className="students-select-wrap">
                <select
                  aria-label="Filter by course program"
                  className="students-select"
                  value={course}
                  onChange={(event) => setCourse(event.target.value)}
                >
                  <option value="">All Completed Courses</option>
                  {courses.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
                <ChevronDown size={15} className="students-select-arrow" />
              </div>
            </div>

            {/* Quick Track Filter Pills */}
            <div className="students-quick-pills">
              <span className="students-pill-label">Quick Filter:</span>
              <button
                type="button"
                className={`students-pill-btn ${!course ? "active" : ""}`}
                onClick={() => setCourse("")}
              >
                All Programs
              </button>
              {courses.map((name) => (
                <button
                  key={name}
                  type="button"
                  className={`students-pill-btn ${course === name ? "active" : ""}`}
                  onClick={() => setCourse(course === name ? "" : name)}
                >
                  {name}
                </button>
              ))}
            </div>
          </section>

          {/* 3. RESULTS META */}
          <div className="students-results-meta">
            <div>
              {loading ? (
                <span>Loading certified learners...</span>
              ) : (
                <span>
                  Showing <strong>{students.length}</strong> certified learner
                  {students.length === 1 ? "" : "s"}
                  {hasFilters ? " matching your filter" : ""}
                </span>
              )}
            </div>

            {hasFilters && (
              <button
                type="button"
                onClick={resetFilters}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#c084fc",
                  fontSize: 12.5,
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <X size={13} />
                <span>Reset filters</span>
              </button>
            )}
          </div>

          {/* 4. SKELETON LOADING STATE */}
          {loading && (
            <div className="students-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="student-skeleton-card" />
              ))}
            </div>
          )}

          {/* 5. STUDENT CARDS GRID */}
          {!loading && students.length > 0 && (
            <div className="students-grid">
              {students.map((student) => (
                <Link
                  key={student.studentId}
                  href={`/students/${student.studentId}`}
                  className="student-card"
                >
                  <div>
                    {/* Header: Avatar, Name, ID */}
                    <div className="student-card-header">
                      <div className="student-card-avatar">
                        {student.profileImageUrl ? (
                          <img src={student.profileImageUrl} alt={student.fullName} />
                        ) : (
                          <span>{student.fullName.slice(0, 2).toUpperCase()}</span>
                        )}
                        <span className="student-card-verified-badge" title="Officially Verified Graduate">
                          <CheckCircle2 size={12} strokeWidth={3} />
                        </span>
                      </div>

                      <div className="student-card-names">
                        <h3 className="student-card-name" title={student.fullName}>
                          {student.fullName}
                        </h3>
                        <span className="student-card-id-pill">ID: #{student.studentId}</span>
                      </div>
                    </div>

                    {/* Body: Course, Batch, Date */}
                    <div className="student-card-body">
                      {student.courseName && (
                        <div className="student-card-course">
                          <GraduationCap size={16} />
                          <span>{student.courseName}</span>
                        </div>
                      )}

                      <div className="student-card-meta">
                        {student.batch && (
                          <span className="student-card-meta-item">
                            <Layers size={13} color="#94a3b8" />
                            <span>{student.batch}</span>
                          </span>
                        )}
                        {student.completionDate && (
                          <span className="student-card-meta-item">
                            <Calendar size={13} color="#94a3b8" />
                            <span>
                              {new Date(student.completionDate).toLocaleDateString("en-IN", {
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Footer Action */}
                  <div className="student-card-footer">
                    <span>View Public Profile &amp; Credentials</span>
                    <ArrowRight size={15} className="student-card-arrow" />
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* 6. EMPTY STATE */}
          {!loading && students.length === 0 && (
            <div className="student-empty-state">
              {hasFilters ? (
                <>
                  <div className="student-empty-icon">
                    <Search size={30} />
                  </div>

                  <h2 className="student-empty-title">
                    No matching certified learners found
                  </h2>

                  <p className="student-empty-text">
                    We couldn&apos;t find any public profiles matching &ldquo;{search || course}&rdquo;. Try resetting your filters to view all certified graduates.
                  </p>

                  <button type="button" onClick={resetFilters} className="student-reset-btn">
                    Reset All Filters
                  </button>
                </>
              ) : (
                <>
                  <div className="student-empty-icon" style={{ borderColor: "rgba(168, 85, 247, 0.4)", color: "#c084fc" }}>
                    <ShieldCheck size={36} />
                  </div>

                  <h2 className="student-empty-title">
                    Institutional Alumni &amp; Certified Learners Registry
                  </h2>

                  <p className="student-empty-text" style={{ maxWidth: 580 }}>
                    Learners who complete their offline practical coding programs and pass capstone evaluations appear in this directory once their verified public profile is published.
                  </p>

                  {/* Featured Sample Certificate Demo Card */}
                  <div
                    style={{
                      maxWidth: 540,
                      margin: "24px auto",
                      background: "linear-gradient(145deg, rgba(23, 31, 54, 0.8) 0%, rgba(10, 15, 30, 0.95) 100%)",
                      border: "1px solid rgba(168, 85, 247, 0.25)",
                      borderRadius: 16,
                      padding: "20px 22px",
                      textAlign: "left",
                      boxShadow: "0 10px 30px rgba(0, 0, 0, 0.4)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", display: "inline-block", boxShadow: "0 0 8px #22c55e" }} />
                        <span style={{ fontSize: 11.5, fontWeight: 700, color: "#cbd5e1", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                          Verified Institutional Credential
                        </span>
                      </div>
                      <span style={{ fontSize: 11, fontFamily: "monospace", color: "#f3d078", background: "rgba(197, 155, 39, 0.15)", border: "1px solid rgba(197, 155, 39, 0.3)", padding: "2px 8px", borderRadius: 4 }}>
                        ECS-2026-00001
                      </span>
                    </div>

                    <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 14 }}>
                      <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg, #1e1b4b, #312e81)", border: "2px solid rgba(168, 85, 247, 0.4)", display: "grid", placeItems: "center", color: "#f1f5f9", fontWeight: 700, fontSize: 16, flexShrink: 0 }}>
                        AS
                      </div>
                      <div>
                        <h4 style={{ margin: 0, fontSize: 16, color: "#ffffff", fontWeight: 700 }}>
                          Ashish Singh
                        </h4>
                        <p style={{ margin: "2px 0 0", fontSize: 12.5, color: "#38bdf8", fontWeight: 600 }}>
                          Full-Stack MERN &amp; Next.js Development
                        </p>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 12, borderTop: "1px solid rgba(255, 255, 255, 0.08)", flexWrap: "wrap", gap: 10 }}>
                      <span style={{ fontSize: 12, color: "#94a3b8" }}>
                        Offline Classroom · Batch 2026
                      </span>
                      <Link
                        href="/verify/ECS-2026-00001"
                        style={{
                          fontSize: 12.5,
                          fontWeight: 600,
                          color: "#c084fc",
                          textDecoration: "none",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                        }}
                      >
                        <span>Explore Verification Demo</span>
                        <ArrowRight size={13} />
                      </Link>
                    </div>
                  </div>

                  {/* Callout box for enrolled students */}
                  <div className="student-callout-box">
                    <h4>Are you an enrolled student at The Elite Coding School?</h4>
                    <p>
                      Log in to your Student Portal to manage your course enrollment, track fee receipts, and
                      activate your public portfolio showcase.
                    </p>
                    <Link href="/student" className="student-portal-link">
                      <span>Go to Student Portal</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
