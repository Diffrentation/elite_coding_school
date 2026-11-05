"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  Users,
  Search,
  CheckCircle2,
  Clock,
  Mail,
  Phone,
  Calendar,
  ShieldCheck,
  AlertCircle,
  Eye,
  X,
  MessageCircle,
  Sparkles,
  Inbox,
  Filter,
  Check,
  RefreshCw,
  ExternalLink,
  ChevronDown,
} from "lucide-react";

type Student = {
  _id: string;
  studentId: string;
  fullName: string;
  phone: string;
  admissionStatus: string;
  registrationDate: string;
  dateOfBirth?: string;
  address?: { line1?: string; line2?: string; city?: string; state?: string; postalCode?: string };
  userId?: { email?: string; accountStatus?: string; emailVerifiedAt?: string | null } | null;
};

type Inquiry = {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  interestedCourse: string;
  message: string;
  type: "admission" | "demo";
  status: "new" | "contacted" | "closed";
  createdAt: string;
};

type Pagination = { page: number; total: number; totalPages: number };

const statuses = ["", "not_enrolled", "pending", "approved", "rejected"];

export function AdminStudents() {
  const [activeTab, setActiveTab] = useState<"students" | "inquiries">("students");
  const [students, setStudents] = useState<Student[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [searchDraft, setSearchDraft] = useState("");
  const [search, setSearch] = useState("");
  const [admissionStatus, setAdmissionStatus] = useState("");
  const [inquiryFilter, setInquiryFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, total: 0, totalPages: 0 });
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [updatingId, setUpdatingId] = useState("");

  const loadStudents = () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      limit: "20",
      sortBy,
      sortDirection,
    });
    if (search) params.set("search", search);
    if (admissionStatus) params.set("admissionStatus", admissionStatus);

    fetch(`/api/admin/students?${params.toString()}`)
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error?.message ?? "Could not load students.");
        setStudents(body.data.students ?? []);
        setPagination(body.data.pagination);
      })
      .catch((reason: Error) => setError(reason.message))
      .finally(() => setLoading(false));
  };

  const loadInquiries = () => {
    const url = inquiryFilter === "all" ? "/api/admin/inquiries" : `/api/admin/inquiries?status=${inquiryFilter}`;
    fetch(url)
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok) throw new Error(body.error?.message ?? "Could not load inquiries.");
        setInquiries(body.data.inquiries ?? []);
      })
      .catch((err: Error) => setError(err.message));
  };

  useEffect(() => {
    loadStudents();
  }, [admissionStatus, page, search, sortBy, sortDirection]);

  useEffect(() => {
    loadInquiries();
  }, [inquiryFilter]);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPage(1);
    setSearch(searchDraft.trim());
  }

  async function updateStudentStatus(studentId: string, nextStatus: string) {
    setUpdatingId(studentId);
    setError("");
    setSuccessMsg("");
    try {
      const res = await fetch("/api/admin/students", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, admissionStatus: nextStatus }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error?.message ?? "Could not update student status.");
      setStudents((prev) =>
        prev.map((s) => (s._id === studentId ? { ...s, admissionStatus: nextStatus } : s)),
      );
      if (selectedStudent && selectedStudent._id === studentId) {
        setSelectedStudent({ ...selectedStudent, admissionStatus: nextStatus });
      }
      setSuccessMsg("✓ Student admission status updated.");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed.");
    } finally {
      setUpdatingId("");
    }
  }

  async function updateInquiryStatus(id: string, status: "new" | "contacted" | "closed") {
    setUpdatingId(id);
    setError("");
    try {
      const res = await fetch(`/api/admin/inquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error?.message ?? "Could not update inquiry.");
      setInquiries((prev) =>
        prev.map((inq) => (inq._id === id ? { ...inq, status: body.data.inquiry.status } : inq)),
      );
      setSuccessMsg("✓ Lead follow-up status updated.");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed.");
    } finally {
      setUpdatingId("");
    }
  }

  // Summary Metrics
  const enrolledCount = students.filter((s) => s.admissionStatus === "approved").length;
  const pendingCount = students.filter((s) => s.admissionStatus === "pending").length;
  const newInquiriesCount = inquiries.filter((i) => i.status === "new").length;

  return (
    <main className="portal-content admin-students-suite">
      {/* Page Header */}
      <div className="portal-intro">
        <div>
          <p className="kicker">STUDENT &amp; LEAD INTELLIGENCE</p>
          <h2>All Student Records &amp; Public Inquiries</h2>
          <p>
            Comprehensive directory of verified login students, classroom batch admissions, and incoming public demo inquiries.
          </p>
        </div>
        <div className="intro-actions">
          <button className="button refresh-btn" onClick={() => { loadStudents(); loadInquiries(); }}>
            <RefreshCw size={15} className={loading ? "spin" : ""} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon-wrap icon-purple">
            <Users size={20} />
          </div>
          <div className="kpi-meta">
            <span className="kpi-title">Registered Students</span>
            <strong className="kpi-val">{pagination.total.toLocaleString("en-IN")}</strong>
            <small className="kpi-sub">Total verified &amp; login accounts</small>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap icon-emerald">
            <CheckCircle2 size={20} />
          </div>
          <div className="kpi-meta">
            <span className="kpi-title">Enrolled in Batches</span>
            <strong className="kpi-val">{enrolledCount}</strong>
            <small className="kpi-sub">Approved active admissions</small>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap icon-amber">
            <Clock size={20} />
          </div>
          <div className="kpi-meta">
            <span className="kpi-title">Pending Approvals</span>
            <strong className="kpi-val">{pendingCount}</strong>
            <small className="kpi-sub">Awaiting admin review</small>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap icon-cyan">
            <Inbox size={20} />
          </div>
          <div className="kpi-meta">
            <span className="kpi-title">Public Inquiries &amp; Demos</span>
            <strong className="kpi-val">{inquiries.length}</strong>
            <small className="kpi-sub">{newInquiriesCount} new leads pending follow-up</small>
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="student-view-tabs" role="tablist">
        <button
          role="tab"
          aria-selected={activeTab === "students"}
          className={`view-tab-btn ${activeTab === "students" ? "active" : ""}`}
          onClick={() => setActiveTab("students")}
        >
          <Users size={16} />
          <span>Registered Login Students ({pagination.total})</span>
        </button>
        <button
          role="tab"
          aria-selected={activeTab === "inquiries"}
          className={`view-tab-btn ${activeTab === "inquiries" ? "active" : ""}`}
          onClick={() => setActiveTab("inquiries")}
        >
          <Inbox size={16} />
          <span>Public Website Leads &amp; Demo Inquiries ({inquiries.length})</span>
          {newInquiriesCount > 0 && <span className="tab-lead-count">{newInquiriesCount} new</span>}
        </button>
      </div>

      {/* Feedback Messages */}
      {error && <p className="form-error">{error}</p>}
      {successMsg && <p className="form-success">{successMsg}</p>}

      {/* TAB 1: REGISTERED STUDENTS */}
      {activeTab === "students" && (
        <section className="students-tab-content">
          {/* Search & Filter Bar */}
          <form className="student-tools-bar" onSubmit={submitSearch}>
            <div className="search-input-wrap">
              <Search size={16} className="search-icon" />
              <input
                aria-label="Search students"
                placeholder="Search by student name, ID, email, or mobile..."
                value={searchDraft}
                onChange={(e) => setSearchDraft(e.target.value)}
              />
              {searchDraft && (
                <button type="button" className="clear-btn" onClick={() => { setSearchDraft(""); setSearch(""); }}>
                  <X size={15} />
                </button>
              )}
            </div>

            <div className="filter-select-wrap">
              <Filter size={15} className="filter-icon" />
              <select
                aria-label="Filter by Admission Status"
                value={admissionStatus}
                onChange={(e) => {
                  setPage(1);
                  setAdmissionStatus(e.target.value);
                }}
              >
                <option value="">All Admission Statuses</option>
                <option value="approved">Approved &amp; Enrolled</option>
                <option value="pending">Pending Review</option>
                <option value="not_enrolled">Not Enrolled</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <button className="button primary search-btn" type="submit">
              Search
            </button>
          </form>

          {/* Table Container */}
          <div className="table-responsive-container">
            <table className="modern-data-table" aria-label="Student records">
              <thead>
                <tr>
                  <th>Student Profile</th>
                  <th>Student ID</th>
                  <th>Login &amp; Email Status</th>
                  <th>Phone Number</th>
                  <th>Admission Status</th>
                  <th>Registered On</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => {
                  const initials = student.fullName
                    .split(" ")
                    .map((p) => p[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();
                  const isVerified = Boolean(student.userId?.emailVerifiedAt);
                  const accountStatus = student.userId?.accountStatus ?? "pending";

                  return (
                    <tr key={student._id}>
                      <td>
                        <div className="student-profile-cell">
                          <span className="profile-avatar">{initials}</span>
                          <div className="profile-text">
                            <strong className="profile-name">{student.fullName}</strong>
                            <small className="profile-email">{student.userId?.email ?? "No login email"}</small>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="student-id-badge">#{student.studentId}</span>
                      </td>

                      <td>
                        <div className="status-meta-cell">
                          <span className={`status-badge account-${accountStatus}`}>
                            {accountStatus} account
                          </span>
                          <span className={`verify-badge ${isVerified ? "verified" : "unverified"}`}>
                            {isVerified ? "✓ Email Verified" : "⏳ Unverified"}
                          </span>
                        </div>
                      </td>

                      <td>
                        <div className="phone-cell">
                          <span>{student.phone}</span>
                          <div className="phone-quick-actions">
                            <a
                              href={`tel:${student.phone}`}
                              className="quick-icon-btn"
                              title="Call student"
                              aria-label="Call student"
                            >
                              <Phone size={13} />
                            </a>
                            <a
                              href={`https://wa.me/91${student.phone.replace(/[^0-9]/g, "")}`}
                              target="_blank"
                              rel="noreferrer"
                              className="quick-icon-btn whatsapp"
                              title="WhatsApp message"
                              aria-label="WhatsApp student"
                            >
                              <MessageCircle size={13} />
                            </a>
                          </div>
                        </div>
                      </td>

                      <td>
                        <select
                          className={`admission-select status-${student.admissionStatus}`}
                          disabled={updatingId === student._id}
                          value={student.admissionStatus}
                          onChange={(e) => updateStudentStatus(student._id, e.target.value)}
                        >
                          <option value="not_enrolled">Not Enrolled</option>
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </td>

                      <td>
                        <time className="date-cell">
                          {new Intl.DateTimeFormat("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }).format(new Date(student.registrationDate))}
                        </time>
                      </td>

                      <td>
                        <button
                          type="button"
                          className="view-dossier-btn"
                          onClick={() => setSelectedStudent(student)}
                        >
                          <Eye size={14} />
                          <span>Details</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {!students.length && (
              <div className="dashboard-empty-card">
                <Users size={36} />
                <p>No student records match the specified filters.</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <nav className="pagination-bar" aria-label="Student table pagination">
              <button
                className="page-btn"
                disabled={page <= 1}
                onClick={() => setPage((current) => current - 1)}
              >
                Previous
              </button>
              <span className="page-indicator">
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} records)
              </span>
              <button
                className="page-btn"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((current) => current + 1)}
              >
                Next
              </button>
            </nav>
          )}
        </section>
      )}

      {/* TAB 2: PUBLIC INQUIRIES & DEMO LEADS */}
      {activeTab === "inquiries" && (
        <section className="inquiries-tab-content">
          <div className="inquiry-filter-bar">
            <span className="filter-label">Filter by Follow-up:</span>
            {(["all", "new", "contacted", "closed"] as const).map((st) => (
              <button
                key={st}
                type="button"
                className={`filter-pill-btn ${inquiryFilter === st ? "active" : ""}`}
                onClick={() => setInquiryFilter(st)}
              >
                {st === "all" ? "All Inquiries" : st.charAt(0).toUpperCase() + st.slice(1)}
              </button>
            ))}
          </div>

          <div className="inquiry-cards-grid">
            {inquiries.map((inq) => {
              const isDemo = inq.type === "demo";
              return (
                <article className={`inquiry-lead-card status-${inq.status}`} key={inq._id}>
                  <div className="lead-header">
                    <div className="lead-identity">
                      <strong className="lead-name">{inq.fullName}</strong>
                      <span className={`lead-type-badge ${isDemo ? "type-demo" : "type-admission"}`}>
                        {isDemo ? "Free Demo Class Request" : "Admission Counseling"}
                      </span>
                    </div>
                    <div className="lead-date">
                      {new Intl.DateTimeFormat("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }).format(new Date(inq.createdAt))}
                    </div>
                  </div>

                  <div className="lead-details">
                    <div className="detail-item">
                      <span className="detail-label">Program of Interest:</span>
                      <strong className="detail-val">{inq.interestedCourse || "General Inquiry"}</strong>
                    </div>

                    <div className="detail-contact-row">
                      <a href={`tel:${inq.phone}`} className="contact-link">
                        <Phone size={14} />
                        <span>{inq.phone}</span>
                      </a>
                      <a href={`mailto:${inq.email}`} className="contact-link">
                        <Mail size={14} />
                        <span>{inq.email}</span>
                      </a>
                      <a
                        href={`https://wa.me/91${inq.phone.replace(/[^0-9]/g, "")}?text=Hi%20${encodeURIComponent(inq.fullName)},%20greetings%20from%20Elite%20Coding%20School.`}
                        target="_blank"
                        rel="noreferrer"
                        className="contact-link whatsapp"
                      >
                        <MessageCircle size={14} />
                        <span>WhatsApp Lead</span>
                      </a>
                    </div>

                    {inq.message && (
                      <div className="lead-message-box">
                        <span className="message-label">Student Message:</span>
                        <p>{inq.message}</p>
                      </div>
                    )}
                  </div>

                  <div className="lead-footer">
                    <label className="status-changer">
                      <span>Status:</span>
                      <select
                        disabled={updatingId === inq._id}
                        value={inq.status}
                        onChange={(e) =>
                          updateInquiryStatus(inq._id, e.target.value as "new" | "contacted" | "closed")
                        }
                      >
                        <option value="new">New (Needs Follow-up)</option>
                        <option value="contacted">Contacted / Call Done</option>
                        <option value="closed">Closed / Enrolled</option>
                      </select>
                    </label>
                  </div>
                </article>
              );
            })}

            {!inquiries.length && (
              <div className="dashboard-empty-card">
                <Inbox size={36} />
                <p>No public inquiries found for the selected filter.</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* STUDENT DETAIL MODAL */}
      {selectedStudent && (
        <div className="modal-backdrop" onClick={() => setSelectedStudent(null)}>
          <div className="student-dossier-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-row">
                <Users size={20} className="text-purple-400" />
                <h3>Student Profile Dossier</h3>
              </div>
              <button
                type="button"
                className="close-modal-btn"
                onClick={() => setSelectedStudent(null)}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              {/* Profile Card Header */}
              <div className="dossier-hero">
                <div className="dossier-avatar">
                  {selectedStudent.fullName
                    .split(" ")
                    .map((p) => p[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div className="dossier-hero-info">
                  <h4>{selectedStudent.fullName}</h4>
                  <div className="hero-tags">
                    <span className="dossier-id">ID: #{selectedStudent.studentId}</span>
                    <span className={`status-badge account-${selectedStudent.userId?.accountStatus ?? "pending"}`}>
                      {selectedStudent.userId?.accountStatus ?? "pending"}
                    </span>
                    <span
                      className={`verify-badge ${selectedStudent.userId?.emailVerifiedAt ? "verified" : "unverified"}`}
                    >
                      {selectedStudent.userId?.emailVerifiedAt ? "Email Verified" : "Unverified"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Grid of Sections */}
              <div className="dossier-grid">
                <div className="dossier-card">
                  <h5>Login &amp; Credentials</h5>
                  <div className="dossier-field">
                    <span>Portal Email:</span>
                    <strong>{selectedStudent.userId?.email ?? "Not provided"}</strong>
                  </div>
                  <div className="dossier-field">
                    <span>Mobile Number:</span>
                    <strong>{selectedStudent.phone}</strong>
                  </div>
                  <div className="dossier-field">
                    <span>Email Verification:</span>
                    <strong>
                      {selectedStudent.userId?.emailVerifiedAt
                        ? `Verified on ${new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(selectedStudent.userId.emailVerifiedAt))}`
                        : "Pending Verification"}
                    </strong>
                  </div>
                </div>

                <div className="dossier-card">
                  <h5>Admission &amp; Enrollment</h5>
                  <div className="dossier-field">
                    <span>Current Status:</span>
                    <strong className={`status-${selectedStudent.admissionStatus}`}>
                      {selectedStudent.admissionStatus.replaceAll("_", " ").toUpperCase()}
                    </strong>
                  </div>
                  <div className="dossier-field">
                    <span>Registration Date:</span>
                    <strong>
                      {new Intl.DateTimeFormat("en-IN", { dateStyle: "long" }).format(
                        new Date(selectedStudent.registrationDate),
                      )}
                    </strong>
                  </div>
                  <div className="dossier-field">
                    <span>Change Status:</span>
                    <select
                      className="modal-select"
                      value={selectedStudent.admissionStatus}
                      onChange={(e) => updateStudentStatus(selectedStudent._id, e.target.value)}
                    >
                      <option value="not_enrolled">Not Enrolled</option>
                      <option value="pending">Pending Approval</option>
                      <option value="approved">Approved for Batch</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Quick Communication Actions */}
              <div className="dossier-actions-bar">
                <a
                  href={`tel:${selectedStudent.phone}`}
                  className="button secondary-btn"
                >
                  <Phone size={15} />
                  <span>Call {selectedStudent.phone}</span>
                </a>
                <a
                  href={`https://wa.me/91${selectedStudent.phone.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="button whatsapp-btn"
                >
                  <MessageCircle size={15} />
                  <span>Open WhatsApp</span>
                </a>
                {selectedStudent.userId?.email && (
                  <a
                    href={`mailto:${selectedStudent.userId.email}`}
                    className="button secondary-btn"
                  >
                    <Mail size={15} />
                    <span>Send Email</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
