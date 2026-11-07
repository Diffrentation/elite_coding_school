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
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { CustomSelect, type CustomSelectOption } from "./ui/custom-select";
import { AgTable, type AgColumn } from "./ui/ag-table";

const ADMISSION_FILTER_OPTIONS: CustomSelectOption[] = [
  { value: "", label: "All Admission Statuses" },
  { value: "approved", label: "Approved & Enrolled" },
  { value: "pending", label: "Pending Review" },
  { value: "not_enrolled", label: "Not Enrolled" },
  { value: "rejected", label: "Rejected" },
];

const ADMISSION_STATUS_OPTIONS: CustomSelectOption[] = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "not_enrolled", label: "Not Enrolled" },
  { value: "rejected", label: "Rejected" },
];

const INQUIRY_STATUS_OPTIONS: CustomSelectOption[] = [
  { value: "new", label: "New (Needs Follow-up)" },
  { value: "contacted", label: "Contacted / Call Done" },
  { value: "closed", label: "Closed / Enrolled" },
];

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

  function handleSort(field: string) {
    if (sortBy === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortDirection("asc");
    }
  }
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
  const studentColumns: AgColumn<Student>[] = [
    {
      key: "fullName",
      header: "Student Profile",
      sortable: true,
      render: (student) => {
        const initials = student.fullName
          .split(" ")
          .map((p) => p[0])
          .join("")
          .slice(0, 2)
          .toUpperCase();
        return (
          <div className="student-profile-cell">
            <span className="profile-avatar">{initials}</span>
            <div className="profile-text">
              <strong className="profile-name">{student.fullName}</strong>
              <small className="profile-email">{student.userId?.email ?? "No login email"}</small>
            </div>
          </div>
        );
      },
    },
    {
      key: "studentId",
      header: "Student ID",
      sortable: true,
      render: (student) => <span className="student-id-badge">#{student.studentId}</span>,
    },
    {
      key: "accountStatus",
      header: "Login Status",
      sortable: false,
      render: (student) => {
        const isVerified = Boolean(student.userId?.emailVerifiedAt);
        const accountStatus = student.userId?.accountStatus ?? "pending";
        return (
          <div className="status-meta-cell">
            <span className={`status-badge account-${accountStatus}`}>{accountStatus} account</span>
            <span className={`verify-badge ${isVerified ? "verified" : "unverified"}`}>
              {isVerified ? "✓ Email Verified" : "⏳ Unverified"}
            </span>
          </div>
        );
      },
    },
    {
      key: "phone",
      header: "Phone & Contact",
      sortable: false,
      render: (student) => (
        <div className="phone-cell">
          <span>{student.phone}</span>
          <div className="phone-quick-actions">
            <a href={`tel:${student.phone}`} className="quick-icon-btn" title="Call student" aria-label="Call student">
              <Phone size={13} />
            </a>
            <a
              href={`https://wa.me/91${student.phone.replace(/[^0-9]/g, "")}`}
              target="_blank"
              rel="noreferrer"
              className="quick-icon-btn whatsapp"
              title="WhatsApp student"
              aria-label="WhatsApp student"
            >
              <MessageCircle size={13} />
            </a>
          </div>
        </div>
      ),
    },
    {
      key: "admissionStatus",
      header: "Admission Status",
      sortable: true,
      render: (student) => (
        <CustomSelect
          size="sm"
          variant="status-pill"
          options={ADMISSION_STATUS_OPTIONS}
          disabled={updatingId === student._id}
          value={student.admissionStatus}
          onChange={(val) => updateStudentStatus(student._id, val)}
        />
      ),
    },
    {
      key: "registrationDate",
      header: "Registered On",
      sortable: true,
      render: (student) => (
        <time className="date-cell">
          {new Intl.DateTimeFormat("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }).format(new Date(student.registrationDate))}
        </time>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      sortable: false,
      render: (student) => (
        <button
          type="button"
          className="view-dossier-btn"
          onClick={() => setSelectedStudent(student)}
        >
          <Eye size={14} />
          <span>Details</span>
        </button>
      ),
    },
  ];

  const inquiryColumns: AgColumn<Inquiry>[] = [
    {
      key: "fullName",
      header: "Lead Profile",
      sortable: true,
      render: (inq) => {
        const isDemo = inq.type === "demo";
        return (
          <div>
            <strong style={{ color: "#ffffff", fontSize: 13.5, display: "block" }}>{inq.fullName}</strong>
            <span className={`lead-type-badge ${isDemo ? "type-demo" : "type-admission"}`}>
              {isDemo ? "Free Demo Class" : "Admission Counseling"}
            </span>
          </div>
        );
      },
    },
    {
      key: "phone",
      header: "Contact Channels",
      sortable: false,
      render: (inq) => (
        <div className="phone-cell">
          <a href={`tel:${inq.phone}`} style={{ color: "#38bdf8", fontWeight: 600, fontSize: 12.5 }}>
            {inq.phone}
          </a>
          <div className="phone-quick-actions">
            <a
              href={`https://wa.me/91${inq.phone.replace(/[^0-9]/g, "")}?text=Hi%20${encodeURIComponent(inq.fullName)},%20greetings%20from%20Elite%20Coding%20School.`}
              target="_blank"
              rel="noreferrer"
              className="quick-icon-btn whatsapp"
              title="WhatsApp lead"
            >
              <MessageCircle size={13} />
            </a>
            <a href={`mailto:${inq.email}`} className="quick-icon-btn" title="Email lead">
              <Mail size={13} />
            </a>
          </div>
        </div>
      ),
    },
    {
      key: "interestedCourse",
      header: "Program of Interest",
      sortable: true,
      render: (inq) => (
        <span style={{ color: "#e2e8f0", fontWeight: 600, fontSize: 12.5 }}>
          {inq.interestedCourse || "General Inquiry"}
        </span>
      ),
    },
    {
      key: "message",
      header: "Student Message",
      sortable: false,
      render: (inq) => (
        <p style={{ margin: 0, color: "#94a3b8", fontSize: 12, maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={inq.message}>
          {inq.message || "—"}
        </p>
      ),
    },
    {
      key: "createdAt",
      header: "Submitted On",
      sortable: true,
      render: (inq) => (
        <time className="date-cell">
          {new Intl.DateTimeFormat("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }).format(new Date(inq.createdAt))}
        </time>
      ),
    },
    {
      key: "status",
      header: "Follow-up Status",
      sortable: true,
      render: (inq) => (
        <CustomSelect
          size="sm"
          variant="status-pill"
          options={INQUIRY_STATUS_OPTIONS}
          disabled={updatingId === inq._id}
          value={inq.status}
          onChange={(val) => updateInquiryStatus(inq._id, val as "new" | "contacted" | "closed")}
        />
      ),
    },
  ];

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
          <AgTable<Student>
            breadcrumbs={["Admin", "Admissions", "Registered Students"]}
            statusTabs={[
              { key: "", label: "All", count: students.length },
              { key: "pending", label: "Pending Review", count: students.filter((s) => s.admissionStatus === "pending").length },
              { key: "approved", label: "Approved & Enrolled", count: students.filter((s) => s.admissionStatus === "approved").length },
              { key: "not_enrolled", label: "Not Enrolled", count: students.filter((s) => s.admissionStatus === "not_enrolled").length },
              { key: "rejected", label: "Rejected", count: students.filter((s) => s.admissionStatus === "rejected").length },
            ]}
            activeStatusTab={admissionStatus}
            onStatusTabChange={(tabKey) => {
              setPage(1);
              setAdmissionStatus(tabKey);
            }}
            columns={studentColumns}
            data={students}
            title="Registered Student Accounts"
            subtitle="Directory of verified student portal accounts and classroom batch admissions"
            searchPlaceholder="Search by student name, ID, email, or mobile..."
            searchAccessor={(s) => `${s.fullName} ${s.studentId} ${s.userId?.email ?? ""} ${s.phone}`}
            filterOptions={ADMISSION_FILTER_OPTIONS}
            filterValue={admissionStatus}
            onFilterChange={(val) => {
              setPage(1);
              setAdmissionStatus(val);
            }}
            filterPlaceholder="Any status"
            initialPageSize={10}
            emptyMessage="No student records found."
            getRowId={(s) => s._id}
            onRefresh={() => {
              loadStudents();
              loadInquiries();
            }}
            exportFilename="students-directory"
          />
        </section>
      )}

      {/* TAB 2: PUBLIC INQUIRIES & DEMO LEADS */}
      {activeTab === "inquiries" && (
        <section className="inquiries-tab-content">
          <AgTable<Inquiry>
            breadcrumbs={["Admin", "Admissions", "Public Website Leads"]}
            statusTabs={[
              { key: "all", label: "All Leads", count: inquiries.length },
              { key: "new", label: "New Leads", count: inquiries.filter((i) => i.status === "new").length },
              { key: "contacted", label: "Contacted", count: inquiries.filter((i) => i.status === "contacted").length },
              { key: "closed", label: "Closed / Enrolled", count: inquiries.filter((i) => i.status === "closed").length },
            ]}
            activeStatusTab={inquiryFilter}
            onStatusTabChange={(tabKey) => setInquiryFilter(tabKey)}
            columns={inquiryColumns}
            data={inquiries}
            title="Public Website Leads & Demo Inquiries"
            subtitle="Incoming prospective student admissions and free demo class bookings"
            searchPlaceholder="Search by name, email, phone, or interested course..."
            searchAccessor={(i) => `${i.fullName} ${i.email} ${i.phone} ${i.interestedCourse} ${i.message}`}
            filterOptions={[{ value: "all", label: "All Follow-up Statuses" }, ...INQUIRY_STATUS_OPTIONS]}
            filterValue={inquiryFilter}
            onFilterChange={(val) => setInquiryFilter(val)}
            filterPlaceholder="Any status"
            initialPageSize={10}
            emptyMessage="No public leads found."
            getRowId={(i) => i._id}
            onRefresh={() => {
              loadStudents();
              loadInquiries();
            }}
            exportFilename="public-leads-inquiries"
          />
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
                    <CustomSelect
                      size="md"
                      variant="status-pill"
                      options={ADMISSION_STATUS_OPTIONS}
                      disabled={updatingId === selectedStudent._id}
                      value={selectedStudent.admissionStatus}
                      onChange={(val) => updateStudentStatus(selectedStudent._id, val)}
                    />
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
