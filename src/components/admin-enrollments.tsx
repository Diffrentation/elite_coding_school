"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  GraduationCap,
  Eye,
  RefreshCw,
  Phone,
  MessageCircle,
  Mail,
  Users,
  Check,
  X,
  Plus,
  Calendar,
  Clock,
  BookOpen,
  DollarSign,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
} from "lucide-react";
import { CustomSelect, type CustomSelectOption } from "./ui/custom-select";
import { AgTable, type AgColumn } from "./ui/ag-table";

const ENROLLMENT_STATUS_OPTIONS: CustomSelectOption[] = [
  { value: "all", label: "All Enrollment Statuses" },
  { value: "active", label: "Active Enrollments" },
  { value: "completed", label: "Completed" },
  { value: "paused", label: "Paused" },
];

type Student = { _id: string; fullName: string; studentId: string; phone?: string };
type Course = { _id: string; title: string; monthlyFee: number; status: string };
type Enrollment = {
  _id: string;
  courseTitleSnapshot: string;
  agreedMonthlyFee: number;
  batch: string;
  joiningDate: string;
  status: string;
  studentId?: { fullName?: string; studentId?: string; phone?: string; email?: string } | null;
};
type EnrollmentRequest = {
  _id: string;
  status: "pending" | "approved" | "rejected";
  studentId?: { fullName?: string; studentId?: string };
  courseId?: { title?: string; monthlyFee?: number };
};

const request = async (url: string, init?: RequestInit) => {
  const response = await fetch(url, init);
  const body = await response.json();
  if (!response.ok) throw new Error(body.error?.message ?? "Request failed.");
  return body.data;
};

export function AdminEnrollments() {
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [enrollmentRequests, setEnrollmentRequests] = useState<EnrollmentRequest[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [processingId, setProcessingId] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedCourseFee, setSelectedCourseFee] = useState<number | "">("");
  const [searchFilter, setSearchFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null);
  const [showEnrollForm, setShowEnrollForm] = useState(false);

  const load = () => {
    setLoading(true);
    return Promise.all([
      request("/api/admin/students?limit=100"),
      request("/api/admin/courses"),
      request("/api/admin/enrollments"),
      request("/api/admin/enrollment-requests"),
    ])
      .then(([studentData, courseData, enrollmentData, requestData]) => {
        setStudents(studentData.students ?? []);
        setCourses((courseData.courses ?? []).filter((course: Course) => course.status === "published"));
        setEnrollments(enrollmentData.enrollments ?? []);
        setEnrollmentRequests(requestData.requests ?? []);
      })
      .catch((reason: Error) => setError(reason.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    void load();
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setMessage("");
    setError("");
    setSubmitting(true);
    try {
      await request("/api/admin/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: form.get("studentId"),
          courseId: form.get("courseId"),
          batch: form.get("batch"),
          joiningDate: form.get("joiningDate"),
          agreedMonthlyFee: Number(form.get("agreedMonthlyFee")),
        }),
      });
      event.currentTarget.reset();
      setSelectedCourseFee("");
      setMessage("Student enrolled successfully.");
      void load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not create enrollment.");
    } finally {
      setSubmitting(false);
    }
  }

  async function reviewRequest(id: string, action: "approve" | "reject") {
    setMessage("");
    setError("");
    setProcessingId(id);
    try {
      await request(`/api/admin/enrollment-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      setMessage(`Enrollment request ${action === "approve" ? "approved successfully" : "rejected"}.`);
      void load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not review request.");
    } finally {
      setProcessingId("");
    }
  }

  const pendingRequests = enrollmentRequests.filter((item) => item.status === "pending");
  const activeEnrollmentCount = enrollments.filter((item) => item.status === "active").length;

  const enrollmentColumns: AgColumn<Enrollment>[] = [
    {
      key: "student",
      header: "Student Profile",
      sortable: true,
      accessor: (e) => e.studentId?.fullName ?? "",
      render: (enrollment) => (
        <div>
          <b style={{ color: "#ffffff", fontSize: 13.5, display: "block" }}>
            {enrollment.studentId?.fullName ?? "Student"}
          </b>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#94a3b8" }}>
            #{enrollment.studentId?.studentId ?? "N/A"}
          </span>
        </div>
      ),
    },
    {
      key: "course",
      header: "Course & Batch",
      sortable: true,
      accessor: (e) => e.courseTitleSnapshot,
      render: (enrollment) => (
        <div>
          <b style={{ color: "#e2e8f0", fontSize: 13, display: "block" }}>{enrollment.courseTitleSnapshot}</b>
          <span style={{ color: "#a855f7", fontSize: 11.5 }}>{enrollment.batch}</span>
        </div>
      ),
    },
    {
      key: "agreedMonthlyFee",
      header: "Agreed Fee",
      sortable: true,
      render: (enrollment) => (
        <div>
          <span
            className="admin-request-count-pill"
            style={{
              fontFamily: "var(--font-mono)",
              fontWeight: 700,
              color: "#34d399",
              fontSize: 13,
            }}
          >
            ₹{enrollment.agreedMonthlyFee.toLocaleString("en-IN")}
          </span>
          <small style={{ display: "block", color: "#64748b", fontSize: 10.5 }}>monthly fee</small>
        </div>
      ),
    },
    {
      key: "joiningDate",
      header: "Joining Date",
      sortable: true,
      render: (enrollment) => (
        <span style={{ color: "#94a3b8", fontSize: 12 }}>{enrollment.joiningDate}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (enrollment) => (
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            textTransform: "uppercase",
            padding: "3px 8px",
            borderRadius: 5,
            background:
              enrollment.status === "active" ? "rgba(16, 185, 129, 0.15)" : "rgba(148, 163, 184, 0.15)",
            color: enrollment.status === "active" ? "#34d399" : "#cbd5e1",
            border: `1px solid ${
              enrollment.status === "active" ? "rgba(16, 185, 129, 0.3)" : "rgba(148, 163, 184, 0.3)"
            }`,
          }}
        >
          {enrollment.status}
        </span>
      ),
    },
  ];

  return (
    <main className="portal-content admin-enrollments-page">
      {/* Intro Header */}
      <div style={{ marginBottom: 28 }}>
        <p
          className="kicker"
          style={{
            color: "#38bdf8",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            fontSize: 11,
            margin: "0 0 6px",
          }}
        >
          ADMISSION & COURSE ASSIGNMENT
        </p>
        <h1
          style={{ fontFamily: "var(--font-heading)", fontSize: "28px", color: "#ffffff", margin: "0 0 8px" }}
        >
          Student Enrollments
        </h1>
        <p style={{ color: "#94a3b8", fontSize: "14px", margin: 0 }}>
          Assign verified students to active batches, lock agreed fee structures, and approve
          student-requested course enrollments.
        </p>
      </div>

      <section className="admin-workflow-summary" aria-label="Enrollment summary">
        <article>
          <span className="workflow-summary-icon purple">
            <GraduationCap size={18} />
          </span>
          <div>
            <small>Total enrollments</small>
            <strong>{enrollments.length}</strong>
          </div>
        </article>
        <article>
          <span className="workflow-summary-icon green">
            <UserCheck size={18} />
          </span>
          <div>
            <small>Active batches</small>
            <strong>{activeEnrollmentCount}</strong>
          </div>
        </article>
        <article>
          <span className="workflow-summary-icon amber">
            <Clock size={18} />
          </span>
          <div>
            <small>Awaiting review</small>
            <strong>{pendingRequests.length}</strong>
          </div>
        </article>
      </section>

      {message && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "rgba(16, 185, 129, 0.12)",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            color: "#34d399",
            padding: "12px 18px",
            borderRadius: 10,
            marginBottom: 22,
            fontSize: 13.5,
          }}
        >
          <CheckCircle2 size={16} /> {message}
        </div>
      )}

      {error && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "rgba(239, 68, 68, 0.12)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            color: "#fca5a5",
            padding: "12px 18px",
            borderRadius: 10,
            marginBottom: 22,
            fontSize: 13.5,
          }}
        >
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* 1. Student Enrollment Requests Card */}
      <section
        className="admin-enrollment-requests-card"
        style={{
          background: "#0a0f32",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: "0 14px 35px rgba(0, 0, 0, 0.35)",
          marginBottom: 28,
        }}
      >
        <div
          className="admin-enrollment-section-header"
          style={{
            padding: "18px 24px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                background: "rgba(245, 158, 11, 0.15)",
                color: "#fbbf24",
                display: "grid",
                placeItems: "center",
              }}
            >
              <Clock size={18} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 16, color: "#ffffff", fontFamily: "var(--font-heading)" }}>
                Student Enrollment Requests
              </h2>
              <span style={{ fontSize: 12, color: "#94a3b8" }}>
                Students who requested to join a published course from their student portal
              </span>
            </div>
          </div>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              minHeight: 32,
              fontSize: 11.5,
              fontWeight: 700,
              letterSpacing: "0.02em",
              lineHeight: 1,
              whiteSpace: "nowrap",
              flexShrink: 0,
              padding: "0 12px",
              borderRadius: 999,
              background:
                pendingRequests.length > 0 ? "rgba(245, 158, 11, 0.18)" : "rgba(16, 185, 129, 0.14)",
              color: pendingRequests.length > 0 ? "#fbbf24" : "#5eead4",
              border: `1px solid ${pendingRequests.length > 0 ? "rgba(245, 158, 11, 0.34)" : "rgba(45, 212, 191, 0.35)"}`,
              boxShadow:
                pendingRequests.length > 0
                  ? "0 4px 14px rgba(245, 158, 11, 0.12)"
                  : "0 4px 14px rgba(16, 185, 129, 0.12)",
            }}
          >
            {pendingRequests.length} Pending
          </span>
        </div>

        {pendingRequests.length > 0 ? (
          <div>
            {pendingRequests.map((item) => (
              <div
                className="admin-enrollment-request-row"
                key={item._id}
                style={{
                  padding: "16px 24px",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                  display: "grid",
                  gridTemplateColumns: "1.2fr 1.2fr auto auto",
                  alignItems: "center",
                  gap: 16,
                }}
              >
                <div>
                  <b style={{ color: "#ffffff", fontSize: 14, display: "block" }}>
                    {item.studentId?.fullName ?? "Student"}
                  </b>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      color: "#94a3b8",
                      background: "rgba(255, 255, 255, 0.05)",
                      padding: "1px 6px",
                      borderRadius: 4,
                      display: "inline-block",
                      marginTop: 3,
                    }}
                  >
                    {item.studentId?.studentId || "No ID"}
                  </span>
                </div>

                <div>
                  <b style={{ color: "#e2e8f0", fontSize: 13.5, display: "block" }}>
                    {item.courseId?.title ?? "Course"}
                  </b>
                  <span style={{ color: "#38bdf8", fontSize: 12, fontWeight: 600 }}>
                    ₹{item.courseId?.monthlyFee?.toLocaleString("en-IN") ?? "0"}/month
                  </span>
                </div>

                <div>
                  <span
                    className="admin-request-status-pill"
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      padding: "3px 10px",
                      borderRadius: 6,
                      background: "rgba(245, 158, 11, 0.15)",
                      color: "#fbbf24",
                      border: "1px solid rgba(245, 158, 11, 0.3)",
                    }}
                  >
                    Pending Review
                  </span>
                </div>

                <div className="admin-enrollment-request-actions" style={{ display: "flex", gap: 8 }}>
                  <button
                    type="button"
                    disabled={processingId === item._id}
                    onClick={() => reviewRequest(item._id, "approve")}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      padding: "7px 14px",
                      borderRadius: 8,
                      background: "rgba(16, 185, 129, 0.2)",
                      border: "1px solid rgba(16, 185, 129, 0.4)",
                      color: "#34d399",
                      fontSize: 12.5,
                      fontWeight: 700,
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <Check size={14} /> Approve
                  </button>

                  <button
                    type="button"
                    disabled={processingId === item._id}
                    onClick={() => reviewRequest(item._id, "reject")}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      padding: "7px 14px",
                      borderRadius: 8,
                      background: "rgba(239, 68, 68, 0.12)",
                      border: "1px solid rgba(239, 68, 68, 0.3)",
                      color: "#f87171",
                      fontSize: 12.5,
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <X size={14} /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: "32px 24px", textAlign: "center", color: "#64748b", fontSize: 13 }}>
            No pending enrollment requests from students at this time.
          </div>
        )}
      </section>

      {/* 2. Create Enrollment Form Card */}
      <section
        className="admin-direct-enrollment-card"
        style={{
          background: "#0a0f32",
          border: "1px solid rgba(133, 41, 244, 0.25)",
          borderRadius: 16,
          padding: 26,
          boxShadow: "0 14px 35px rgba(0, 0, 0, 0.35)",
          marginBottom: 28,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              background: "rgba(124, 58, 237, 0.18)",
              color: "#c084fc",
              display: "grid",
              placeItems: "center",
            }}
          >
            <Plus size={18} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: 17, color: "#ffffff", fontFamily: "var(--font-heading)" }}>
              Direct Student Enrollment
            </h2>
            <p style={{ margin: "2px 0 0", fontSize: 12.5, color: "#94a3b8" }}>
              Manually enroll a student into a batch with an agreed monthly fee snapshot
            </p>
          </div>
        </div>

        <form
          className="admin-direct-enrollment-form"
          onSubmit={submit}
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}
        >
          <label
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
              fontSize: 12.5,
              fontWeight: 600,
              color: "#cbd5e1",
            }}
          >
            Student Account
            <select
              name="studentId"
              required
              style={{
                height: 44,
                borderRadius: 10,
                background: "#070b24",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                color: "#ffffff",
                padding: "0 12px",
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              <option value="">Select a registered student</option>
              {students.map((student) => (
                <option key={student._id} value={student._id}>
                  {student.fullName} ({student.studentId})
                </option>
              ))}
            </select>
          </label>

          <label
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
              fontSize: 12.5,
              fontWeight: 600,
              color: "#cbd5e1",
            }}
          >
            Published Course
            <select
              name="courseId"
              required
              onChange={(e) => {
                const course = courses.find((c) => c._id === e.target.value);
                if (course) {
                  setSelectedCourseFee(course.monthlyFee);
                }
              }}
              style={{
                height: 44,
                borderRadius: 10,
                background: "#070b24",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                color: "#ffffff",
                padding: "0 12px",
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              <option value="">Select a published course</option>
              {courses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.title} (₹{course.monthlyFee.toLocaleString("en-IN")}/mo)
                </option>
              ))}
            </select>
          </label>

          <label
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
              fontSize: 12.5,
              fontWeight: 600,
              color: "#cbd5e1",
            }}
          >
            Batch Timing / Group
            <input
              name="batch"
              minLength={2}
              required
              placeholder="e.g. Weekday Evening (6:00 PM - 8:00 PM)"
              style={{
                height: 44,
                borderRadius: 10,
                background: "#070b24",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                color: "#ffffff",
                padding: "0 14px",
                fontSize: 13,
              }}
            />
          </label>

          <label
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
              fontSize: 12.5,
              fontWeight: 600,
              color: "#cbd5e1",
            }}
          >
            Joining Date
            <input
              name="joiningDate"
              type="date"
              required
              defaultValue={new Date().toISOString().split("T")[0]}
              style={{
                height: 44,
                borderRadius: 10,
                background: "#070b24",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                color: "#ffffff",
                padding: "0 14px",
                fontSize: 13,
              }}
            />
          </label>

          <label
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
              fontSize: 12.5,
              fontWeight: 600,
              color: "#cbd5e1",
            }}
          >
            Agreed Monthly Fee (₹)
            <input
              name="agreedMonthlyFee"
              type="number"
              min="0"
              required
              value={selectedCourseFee !== "" ? selectedCourseFee : undefined}
              onChange={(e) => setSelectedCourseFee(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="e.g. 5000"
              style={{
                height: 44,
                borderRadius: 10,
                background: "#070b24",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                color: "#ffffff",
                padding: "0 14px",
                fontSize: 13,
              }}
            />
          </label>

          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <button
              type="submit"
              disabled={submitting}
              style={{
                height: 44,
                width: "100%",
                borderRadius: 10,
                background: "linear-gradient(135deg, #7c3aed, #9333ea)",
                color: "#ffffff",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                boxShadow: "0 6px 18px rgba(124, 58, 237, 0.4)",
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <UserCheck size={16} /> {submitting ? "Enrolling..." : "Create Enrollment"}
            </button>
          </div>
        </form>
      </section>

      {/* 3. Existing Enrollments Section */}
      <AgTable<Enrollment>
        loading={loading}
        onRowClick={(e) => setSelectedEnrollment(e)}
        statusTabs={[
          { key: "all", label: "All Enrollments", count: enrollments.length },
          { key: "active", label: "Active", count: enrollments.filter((e) => e.status === "active").length },
          {
            key: "completed",
            label: "Completed",
            count: enrollments.filter((e) => e.status === "completed").length,
          },
          { key: "paused", label: "Paused", count: enrollments.filter((e) => e.status === "paused").length },
        ]}
        activeStatusTab={statusFilter}
        onStatusTabChange={(tabKey) => setStatusFilter(tabKey)}
        columns={enrollmentColumns}
        data={enrollments.filter((e) => statusFilter === "all" || e.status === statusFilter)}
        title="Existing Student Enrollments"
        subtitle="Manage actively enrolled classroom batch students, schedules, and locked fee snapshot"
        searchPlaceholder="Search enrollments by student name, ID, course, or batch..."
        searchAccessor={(e) =>
          `${e.studentId?.fullName ?? ""} ${e.studentId?.studentId ?? ""} ${e.courseTitleSnapshot} ${e.batch}`
        }
        initialPageSize={10}
        emptyMessage="No student enrollments found."
        getRowId={(e) => e._id}
        onRefresh={load}
        exportFilename="student-enrollments"
      />

      {/* ENROLLMENT DOSSIER MODAL */}
      {selectedEnrollment && (
        <div className="modal-backdrop" onClick={() => setSelectedEnrollment(null)}>
          <div
            className="student-dossier-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 640 }}
          >
            <div className="modal-header">
              <div className="modal-title-row" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <UserCheck size={20} className="text-purple-400" />
                <h3 style={{ margin: 0, fontSize: 17, color: "#ffffff" }}>Student Enrollment Dossier</h3>
              </div>
              <button
                type="button"
                className="close-modal-btn"
                onClick={() => setSelectedEnrollment(null)}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ padding: 24 }}>
              <div
                className="dossier-hero"
                style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}
              >
                <div
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #7c3aed, #a855f7)",
                    display: "grid",
                    placeItems: "center",
                    color: "#ffffff",
                    fontWeight: 800,
                    fontSize: 18,
                    flexShrink: 0,
                  }}
                >
                  {(selectedEnrollment.studentId?.fullName || "S")
                    .split(" ")
                    .map((p) => p[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: 18, color: "#ffffff" }}>
                    {selectedEnrollment.studentId?.fullName ?? "Enrolled Student"}
                  </h4>
                  <div
                    style={{ display: "flex", gap: 8, marginTop: 4, flexWrap: "wrap", alignItems: "center" }}
                  >
                    <code style={{ color: "#a855f7", fontSize: 12 }}>
                      #{selectedEnrollment.studentId?.studentId ?? "No ID"}
                    </code>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        padding: "2px 8px",
                        borderRadius: 4,
                        background:
                          selectedEnrollment.status === "active"
                            ? "rgba(16, 185, 129, 0.15)"
                            : "rgba(148, 163, 184, 0.15)",
                        color: selectedEnrollment.status === "active" ? "#34d399" : "#cbd5e1",
                      }}
                    >
                      {selectedEnrollment.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="dossier-grid" style={{ marginBottom: 20 }}>
                <div
                  className="dossier-card"
                  style={{
                    background: "#070b24",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: 12,
                    padding: 16,
                  }}
                >
                  <h5
                    style={{
                      margin: "0 0 10px",
                      fontSize: 12.5,
                      color: "#38bdf8",
                      textTransform: "uppercase",
                    }}
                  >
                    Enrolled Program &amp; Batch
                  </h5>
                  <div className="dossier-field" style={{ marginBottom: 8 }}>
                    <span style={{ fontSize: 11, color: "#94a3b8" }}>Course Title:</span>
                    <strong style={{ color: "#ffffff", fontSize: 13 }}>
                      {selectedEnrollment.courseTitleSnapshot}
                    </strong>
                  </div>
                  <div className="dossier-field">
                    <span style={{ fontSize: 11, color: "#94a3b8" }}>Batch Timing:</span>
                    <strong style={{ color: "#ffffff", fontSize: 13 }}>{selectedEnrollment.batch}</strong>
                  </div>
                </div>

                <div
                  className="dossier-card"
                  style={{
                    background: "#070b24",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: 12,
                    padding: 16,
                  }}
                >
                  <h5
                    style={{
                      margin: "0 0 10px",
                      fontSize: 12.5,
                      color: "#a855f7",
                      textTransform: "uppercase",
                    }}
                  >
                    Fee Structure &amp; Dates
                  </h5>
                  <div className="dossier-field" style={{ marginBottom: 8 }}>
                    <span style={{ fontSize: 11, color: "#94a3b8" }}>Locked Monthly Fee:</span>
                    <strong style={{ color: "#38bdf8", fontSize: 15 }}>
                      ₹{selectedEnrollment.agreedMonthlyFee.toLocaleString("en-IN")}/mo
                    </strong>
                  </div>
                  <div className="dossier-field">
                    <span style={{ fontSize: 11, color: "#94a3b8" }}>Joining Date:</span>
                    <strong style={{ color: "#ffffff", fontSize: 13 }}>
                      {new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(
                        new Date(selectedEnrollment.joiningDate),
                      )}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Communication Actions */}
              {selectedEnrollment.studentId?.phone &&
                (() => {
                  const rawPhone = selectedEnrollment.studentId.phone.replace(/[^0-9]/g, "");
                  const waPhone = rawPhone.length === 10 ? "91" + rawPhone : rawPhone;
                  const waUrl =
                    "https://wa.me/" +
                    waPhone +
                    "?text=" +
                    encodeURIComponent(
                      "Hi " +
                        selectedEnrollment.studentId.fullName +
                        ", regarding your " +
                        selectedEnrollment.courseTitleSnapshot +
                        " batch at Elite Coding School.",
                    );
                  return (
                    <div
                      className="dossier-actions-bar"
                      style={{
                        display: "flex",
                        gap: 10,
                        flexWrap: "wrap",
                        borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                        paddingTop: 16,
                      }}
                    >
                      <a
                        href={"tel:" + selectedEnrollment.studentId.phone}
                        className="button secondary-btn"
                        style={{
                          flex: 1,
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                          padding: "10px 16px",
                          borderRadius: 8,
                          background: "rgba(56, 189, 248, 0.12)",
                          border: "1px solid rgba(56, 189, 248, 0.3)",
                          color: "#38bdf8",
                          fontWeight: 600,
                          fontSize: 13,
                          textDecoration: "none",
                        }}
                      >
                        <Phone size={14} />
                        <span>Call {selectedEnrollment.studentId.phone}</span>
                      </a>
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="button whatsapp-btn"
                        style={{
                          flex: 1,
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                          padding: "10px 16px",
                          borderRadius: 8,
                          background: "rgba(34, 197, 94, 0.15)",
                          border: "1px solid rgba(34, 197, 94, 0.3)",
                          color: "#4ade80",
                          fontWeight: 600,
                          fontSize: 13,
                          textDecoration: "none",
                        }}
                      >
                        <MessageCircle size={14} />
                        <span>WhatsApp Batch Notice</span>
                      </a>
                    </div>
                  );
                })()}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
