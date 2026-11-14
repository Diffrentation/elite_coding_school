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
        setCourses(body.data?.courses ?? []);
      })
      .catch(() => {
        setStudents([]);
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
              <span>OFFICIAL INSTITUTIONAL REGISTRY</span>
              <span style={{ opacity: 0.4 }}>·</span>
              <span>VERIFIED GRADUATES</span>
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
              <div className="student-empty-icon">
                <GraduationCap size={34} />
              </div>

              <h2 className="student-empty-title">
                {hasFilters ? "No matching certified learners found" : "Certified Learner Registry"}
              </h2>

              <p className="student-empty-text">
                {hasFilters
                  ? `We couldn't find any public profiles matching "${search || course}". Try resetting your filters to view all certified graduates.`
                  : "Learners who complete their offline programs and pass the final capstone evaluation appear in this institutional directory once their public portfolio is published."}
              </p>

              {hasFilters && (
                <button type="button" onClick={resetFilters} className="student-reset-btn">
                  Reset All Filters
                </button>
              )}

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
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
