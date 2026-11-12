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
  Plus,
  Pencil,
  Trash2,
  GraduationCap,
  User,
  MapPin,
  ImageIcon,
  FileText,
} from "lucide-react";
import { CustomSelect, type CustomSelectOption } from "./ui/custom-select";
import { AgTable, type AgColumn } from "./ui/ag-table";
import { ImagePickerInput } from "./image-picker-input";

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
  email?: string | null;
  phone: string;
  admissionStatus: string;
  registrationDate: string;
  dateOfBirth?: string;
  address?: { line1?: string; line2?: string; city?: string; state?: string; postalCode?: string };
  profileImageUrl?: string | null;
  publicProfile?: boolean;
  publicPhotoConsent?: boolean;
  completionDate?: string | null;
  additionalInfo?: string;
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
  const [loading, setLoading] = useState(true);
  const [inquiryLoading, setInquiryLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null | "new">(null);
  const [updatingId, setUpdatingId] = useState("");
  const [savingStudent, setSavingStudent] = useState(false);

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
    setInquiryLoading(true);
    const url =
      inquiryFilter === "all" ? "/api/admin/inquiries" : `/api/admin/inquiries?status=${inquiryFilter}`;
    fetch(url)
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok) throw new Error(body.error?.message ?? "Could not load inquiries.");
        setInquiries(body.data.inquiries ?? []);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setInquiryLoading(false));
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

  async function saveStudent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      fullName: String(form.get("fullName") ?? "").trim(),
      email: String(form.get("email") ?? "").trim(),
      phone: String(form.get("phone") ?? "").trim(),
      admissionStatus: String(form.get("admissionStatus") ?? "not_enrolled"),
      registrationDate: String(form.get("registrationDate") ?? ""),
      completionDate: String(form.get("completionDate") ?? "") || null,
      profileImageUrl: String(form.get("profileImageUrl") ?? "") || null,
      publicProfile: form.get("publicProfile") === "on",
      publicPhotoConsent: form.get("publicPhotoConsent") === "on",
      additionalInfo: String(form.get("additionalInfo") ?? "").trim(),
      address: {
        line1: String(form.get("addressLine1") ?? "").trim(),
        line2: String(form.get("addressLine2") ?? "").trim(),
        city: String(form.get("addressCity") ?? "").trim(),
        state: String(form.get("addressState") ?? "").trim(),
        postalCode: String(form.get("addressPostalCode") ?? "").trim(),
      },
    };
    setSavingStudent(true);
    setError("");
    try {
      const isNew = editingStudent === "new";
      const res = await fetch("/api/admin/students", {
        method: isNew ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isNew ? payload : { studentId: editingStudent?._id, ...payload }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error?.message ?? "Unable to save student.");
      setEditingStudent(null);
      setSuccessMsg(isNew ? "Student created successfully." : "Student profile updated successfully.");
      loadStudents();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to save student.");
    } finally {
      setSavingStudent(false);
    }
  }

  async function deleteStudent(student: Student) {
    if (!window.confirm(`Delete ${student.fullName}? Students with enrollment or certificate history are protected.`)) return;
    setUpdatingId(student._id);
    setError("");
    try {
      const res = await fetch(`/api/admin/students?studentId=${encodeURIComponent(student._id)}`, { method: "DELETE" });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error?.message ?? "Unable to delete student.");
      if (selectedStudent?._id === student._id) setSelectedStudent(null);
      setSuccessMsg("Student record deleted.");
      loadStudents();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to delete student.");
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
              <small className="profile-email">{student.userId?.email ?? student.email ?? "No login email"}</small>
            </div>
          </div>
        );
      },
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
      key: "studentId",
      header: "Student ID",
      sortable: true,
      render: (student) => <span className="student-id-badge">#{student.studentId}</span>,
    },
    {
      key: "phone",
      header: "Phone & Contact",
      sortable: false,
      render: (student) => (
        <div className="phone-cell">
          <a
            href={`tel:${student.phone}`}
            style={{ color: "#38bdf8", fontWeight: 600, fontSize: 13, textDecoration: "none" }}
          >
            {student.phone}
          </a>
          <div className="phone-quick-actions">
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
            <a
              href={`tel:${student.phone}`}
              className="quick-icon-btn"
              title="Call student"
              aria-label="Call student"
            >
              <Phone size={13} />
            </a>
          </div>
        </div>
      ),
    },
    {
      key: "accountStatus",
      header: "Account State",
      sortable: false,
      render: (student) => {
        const isVerified = Boolean(student.userId?.emailVerifiedAt);
        const accountStatus = student.userId?.accountStatus ?? "pending";
        return (
          <div className="status-meta-cell">
            <span className={`status-badge account-${accountStatus}`}>{accountStatus}</span>
            <span className={`verify-badge ${isVerified ? "verified" : "unverified"}`}>
              {isVerified ? "✓ Verified" : "⏳ Unverified"}
            </span>
          </div>
        );
      },
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
        <div style={{ display: "inline-flex", gap: 6 }}>
          <button type="button" className="view-dossier-btn" onClick={(event) => { event.stopPropagation(); setSelectedStudent(student); }}>
            <Eye size={14} /><span>Details</span>
          </button>
          <button type="button" className="view-dossier-btn" aria-label={`Edit ${student.fullName}`} onClick={(event) => { event.stopPropagation(); setEditingStudent(student); }}>
            <Pencil size={14} /><span>Edit</span>
          </button>
        </div>
      ),
    },
  ];

  const inquiryColumns: AgColumn<Inquiry>[] = [
    {
      key: "inquiryActions",
      header: "Action",
      sortable: false,
      render: (inq) => (
        <button
          type="button"
          className="view-dossier-btn"
          onClick={() => setSelectedInquiry(inq)}
          style={{
            padding: "5px 10px",
            borderRadius: 6,
            background: "rgba(168, 85, 247, 0.12)",
            border: "1px solid rgba(168, 85, 247, 0.25)",
            color: "#c084fc",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <Eye size={13} />
          <span>Details</span>
        </button>
      ),
    },
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
        <p
          style={{
            margin: 0,
            color: "#94a3b8",
            fontSize: 12,
            maxWidth: 260,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          title={inq.message}
        >
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
            Comprehensive directory of verified login students, classroom batch admissions, and incoming
            public demo inquiries.
          </p>
        </div>
        <div className="intro-actions" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            className="admin-primary-add-btn"
            type="button"
            onClick={() => setEditingStudent("new")}
          >
            <Plus size={16} />
            <span>Add Student</span>
          </button>
          <button
            className="refresh-btn"
            type="button"
            onClick={() => {
              loadStudents();
              loadInquiries();
            }}
          >
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
          <span className="tab-desktop-text">Registered Login Students ({pagination.total})</span>
          <span className="tab-mobile-text">Students ({pagination.total})</span>
        </button>
        <button
          role="tab"
          aria-selected={activeTab === "inquiries"}
          className={`view-tab-btn ${activeTab === "inquiries" ? "active" : ""}`}
          onClick={() => setActiveTab("inquiries")}
        >
          <Inbox size={16} />
          <span className="tab-desktop-text">
            Public Website Leads &amp; Demo Inquiries ({inquiries.length})
          </span>
          <span className="tab-mobile-text">Leads ({inquiries.length})</span>
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
            loading={loading}
            onRowClick={(s) => setSelectedStudent(s)}
            statusTabs={[
              { key: "", label: "All", count: students.length },
              {
                key: "pending",
                label: "Pending Review",
                count: students.filter((s) => s.admissionStatus === "pending").length,
              },
              {
                key: "approved",
                label: "Approved & Enrolled",
                count: students.filter((s) => s.admissionStatus === "approved").length,
              },
              {
                key: "not_enrolled",
                label: "Not Enrolled",
                count: students.filter((s) => s.admissionStatus === "not_enrolled").length,
              },
              {
                key: "rejected",
                label: "Rejected",
                count: students.filter((s) => s.admissionStatus === "rejected").length,
              },
            ]}
            activeStatusTab={admissionStatus}
            onStatusTabChange={(tabKey) => {
              setPage(1);
              setAdmissionStatus(tabKey);
            }}
            columns={studentColumns}
            data={students}
            searchPlaceholder="Search by student name, ID, email, or mobile..."
            searchAccessor={(s) => `${s.fullName} ${s.studentId} ${s.userId?.email ?? ""} ${s.phone}`}
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
            loading={inquiryLoading}
            onRowClick={(i) => setSelectedInquiry(i)}
            statusTabs={[
              { key: "all", label: "All Leads", count: inquiries.length },
              { key: "new", label: "New Leads", count: inquiries.filter((i) => i.status === "new").length },
              {
                key: "contacted",
                label: "Contacted",
                count: inquiries.filter((i) => i.status === "contacted").length,
              },
              {
                key: "closed",
                label: "Closed / Enrolled",
                count: inquiries.filter((i) => i.status === "closed").length,
              },
            ]}
            activeStatusTab={inquiryFilter}
            onStatusTabChange={(tabKey) => setInquiryFilter(tabKey)}
            columns={inquiryColumns}
            data={inquiries}
            searchPlaceholder="Search by name, email, phone, or interested course..."
            searchAccessor={(i) => `${i.fullName} ${i.email} ${i.phone} ${i.interestedCourse} ${i.message}`}
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

      {/* LEAD DETAIL MODAL */}
      {selectedInquiry && (
        <div className="modal-backdrop" onClick={() => setSelectedInquiry(null)}>
          <div
            className="student-dossier-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 640 }}
          >
            <div className="modal-header">
              <div className="modal-title-row" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Sparkles size={20} className="text-cyan-400" />
                <h3 style={{ margin: 0, fontSize: 17, color: "#ffffff" }}>Prospect Lead Dossier</h3>
              </div>
              <button
                type="button"
                className="close-modal-btn"
                onClick={() => setSelectedInquiry(null)}
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
                    background:
                      selectedInquiry.type === "demo"
                        ? "linear-gradient(135deg, #0284c7, #38bdf8)"
                        : "linear-gradient(135deg, #7c3aed, #a855f7)",
                    display: "grid",
                    placeItems: "center",
                    color: "#ffffff",
                    fontWeight: 800,
                    fontSize: 18,
                    flexShrink: 0,
                  }}
                >
                  {selectedInquiry.fullName
                    .split(" ")
                    .map((p) => p[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase() || "L"}
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: 18, color: "#ffffff" }}>{selectedInquiry.fullName}</h4>
                  <div
                    style={{ display: "flex", gap: 8, marginTop: 4, flexWrap: "wrap", alignItems: "center" }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        padding: "2px 8px",
                        borderRadius: 4,
                        background:
                          selectedInquiry.type === "demo"
                            ? "rgba(56, 189, 248, 0.15)"
                            : "rgba(168, 85, 247, 0.15)",
                        color: selectedInquiry.type === "demo" ? "#38bdf8" : "#c084fc",
                        border:
                          selectedInquiry.type === "demo"
                            ? "1px solid rgba(56, 189, 248, 0.3)"
                            : "1px solid rgba(168, 85, 247, 0.3)",
                      }}
                    >
                      {selectedInquiry.type === "demo" ? "Free Trial Demo Class" : "Admission Counseling"}
                    </span>
                    <span style={{ fontSize: 12, color: "#94a3b8" }}>
                      Submitted{" "}
                      {new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(
                        new Date(selectedInquiry.createdAt),
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div className="dossier-grid">
                <div className="dossier-card">
                  <h5>Contact Details</h5>
                  <div className="dossier-field">
                    <span>Mobile Phone:</span>
                    <strong>{selectedInquiry.phone}</strong>
                  </div>
                  <div className="dossier-field">
                    <span>Email:</span>
                    <strong>{selectedInquiry.email || "Not provided"}</strong>
                  </div>
                </div>

                <div className="dossier-card">
                  <h5>Program &amp; Status</h5>
                  <div className="dossier-field">
                    <span>Program:</span>
                    <strong>{selectedInquiry.interestedCourse || "General"}</strong>
                  </div>
                  <div className="dossier-field">
                    <span>Update Status:</span>
                    <CustomSelect
                      size="sm"
                      variant="status-pill"
                      options={INQUIRY_STATUS_OPTIONS}
                      disabled={updatingId === selectedInquiry._id}
                      value={selectedInquiry.status}
                      onChange={(val) => {
                        updateInquiryStatus(selectedInquiry._id, val as any);
                        setSelectedInquiry((prev) => (prev ? { ...prev, status: val as any } : null));
                      }}
                    />
                  </div>
                </div>
              </div>

              {selectedInquiry.message && (
                <div
                  style={{
                    background: "#070b24",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 20,
                  }}
                >
                  <h5
                    style={{
                      margin: "0 0 6px",
                      fontSize: 11.5,
                      color: "#94a3b8",
                      textTransform: "uppercase",
                    }}
                  >
                    Prospect Message:
                  </h5>
                  <p
                    style={{
                      margin: 0,
                      color: "#e2e8f0",
                      fontSize: 13,
                      lineHeight: 1.6,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {selectedInquiry.message}
                  </p>
                </div>
              )}

              {(() => {
                const rawPhone = selectedInquiry.phone.replace(/[^0-9]/g, "");
                const waPhone = rawPhone.length === 10 ? "91" + rawPhone : rawPhone;
                const waUrl =
                  "https://wa.me/" +
                  waPhone +
                  "?text=" +
                  encodeURIComponent(
                    "Hi " +
                      selectedInquiry.fullName +
                      ", greetings from Elite Coding School regarding your " +
                      (selectedInquiry.type === "demo" ? "free demo class" : "admission inquiry") +
                      ".",
                  );
                return (
                  <div className="dossier-actions-bar" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <a
                      href={"tel:" + selectedInquiry.phone}
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
                      <span>Call {selectedInquiry.phone}</span>
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
                      <span>WhatsApp</span>
                    </a>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* STUDENT DETAIL MODAL */}
      {selectedStudent && (
        <div className="modal-backdrop" onClick={() => setSelectedStudent(null)}>
          <div className="student-dossier-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-row">
                <Users size={19} className="text-purple-400" />
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
                    <span
                      className={`status-badge account-${selectedStudent.userId?.accountStatus ?? "pending"}`}
                    >
                      ● {selectedStudent.userId?.accountStatus ?? "pending"}
                    </span>
                    <span
                      className={`verify-badge ${selectedStudent.userId?.emailVerifiedAt ? "verified" : "unverified"}`}
                    >
                      {selectedStudent.userId?.emailVerifiedAt ? "✓ Email Verified" : "⏳ Unverified"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Grid of Sections (Responsive: 1 col on mobile, 2 col on desktop) */}
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
                    <strong className={`status-badge status-${selectedStudent.admissionStatus}`}>
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
                  <div className="dossier-field dossier-field-full">
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

              {/* Quick Communication Actions (Full width WhatsApp + Subrow Call & Email) */}
              <div className="dossier-actions-bar">
                <a
                  href={`https://wa.me/91${selectedStudent.phone.replace(/[^0-9]/g, "")}?text=Hi%20${encodeURIComponent(selectedStudent.fullName)},%20greetings%20from%20Elite%20Coding%20School.`}
                  target="_blank"
                  rel="noreferrer"
                  className="button whatsapp-btn full-width"
                >
                  <MessageCircle size={15} />
                  <span>Open WhatsApp Conversation</span>
                </a>
                <div className="dossier-actions-subrow">
                  <a href={`tel:${selectedStudent.phone}`} className="button secondary-btn">
                    <Phone size={14} />
                    <span>Call {selectedStudent.phone}</span>
                  </a>
                  {selectedStudent.userId?.email && (
                    <a href={`mailto:${selectedStudent.userId.email}`} className="button secondary-btn">
                      <Mail size={14} />
                      <span>Send Email</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {editingStudent && (
        <div
          className="modal-backdrop"
          onClick={() => !savingStudent && setEditingStudent(null)}
          style={{ zIndex: 1200 }}
        >
          <div
            className="student-dossier-modal landscape-modal"
            onClick={(event) => event.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="modal-header">
              <div className="modal-title-row">
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: "rgba(168, 85, 247, 0.15)",
                    border: "1px solid rgba(168, 85, 247, 0.3)",
                    color: "#c084fc",
                    display: "grid",
                    placeItems: "center",
                    flexShrink: 0,
                  }}
                >
                  <GraduationCap size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 17, color: "#ffffff", fontWeight: 700 }}>
                    {editingStudent === "new" ? "Add Student to Roster" : "Edit Student Dossier"}
                  </h3>
                  <p style={{ margin: "2px 0 0", fontSize: 12, color: "#94a3b8" }}>
                    {editingStudent === "new"
                      ? "Create institutional student profile, assign admission status, and record contact details."
                      : `Update profile, residential address, and verification settings for #${editingStudent.studentId} (${editingStudent.fullName}).`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="close-modal-btn"
                disabled={savingStudent}
                onClick={() => setEditingStudent(null)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form Body */}
            <form
              onSubmit={saveStudent}
              style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, overflow: "hidden" }}
            >
              <div
                className="modal-body-scrollable"
                style={{
                  padding: "20px 24px",
                  overflowY: "auto",
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: 18,
                }}
              >
                <div className="student-form-landscape-grid">
                  {/* LEFT COLUMN: Academic Details & Residential Address */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {/* Card 1: Core Academic & Contact Profile */}
                    <div className="form-card-section">
                      <div className="form-card-header">
                        <User size={15} color="#c084fc" />
                        <h5>Academic &amp; Contact Details</h5>
                      </div>

                      <div className="form-field-group">
                        <label>
                          Full Name <span className="required-dot">*</span>
                        </label>
                        <input
                          required
                          name="fullName"
                          placeholder="e.g. Bhupendra Singh"
                          defaultValue={editingStudent === "new" ? "" : editingStudent.fullName}
                        />
                      </div>

                      <div className="form-field-row-2">
                        <div className="form-field-group">
                          <label>
                            Mobile / WhatsApp <span className="required-dot">*</span>
                          </label>
                          <input
                            required
                            name="phone"
                            placeholder="e.g. +91 98765 43210"
                            defaultValue={editingStudent === "new" ? "" : editingStudent.phone}
                          />
                        </div>
                        <div className="form-field-group">
                          <label>
                            Private Email <span className="required-dot">*</span>
                          </label>
                          <input
                            required
                            type="email"
                            name="email"
                            placeholder="e.g. student@gmail.com"
                            defaultValue={
                              editingStudent === "new"
                                ? ""
                                : (editingStudent.email ?? editingStudent.userId?.email ?? "")
                            }
                          />
                        </div>
                      </div>

                      <div className="form-field-group">
                        <label>
                          Admission Status <span className="required-dot">*</span>
                        </label>
                        <select
                          name="admissionStatus"
                          defaultValue={editingStudent === "new" ? "not_enrolled" : editingStudent.admissionStatus}
                        >
                          {ADMISSION_STATUS_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="form-field-row-2">
                        <div className="form-field-group">
                          <label>
                            Joining / Registration Date <span className="required-dot">*</span>
                          </label>
                          <input
                            required
                            type="date"
                            name="registrationDate"
                            defaultValue={
                              editingStudent === "new"
                                ? new Date().toISOString().slice(0, 10)
                                : new Date(editingStudent.registrationDate).toISOString().slice(0, 10)
                            }
                          />
                        </div>
                        <div className="form-field-group">
                          <label>Expected Completion Date</label>
                          <input
                            type="date"
                            name="completionDate"
                            defaultValue={
                              editingStudent !== "new" && editingStudent.completionDate
                                ? new Date(editingStudent.completionDate).toISOString().slice(0, 10)
                                : ""
                            }
                          />
                        </div>
                      </div>
                    </div>

                    {/* Card 2: Residential Address */}
                    <div className="form-card-section">
                      <div className="form-card-header">
                        <MapPin size={15} color="#c084fc" />
                        <h5>Residential Address</h5>
                      </div>

                      <div className="form-field-group">
                        <label>Address Line 1 (Street Address)</label>
                        <input
                          name="addressLine1"
                          placeholder="e.g. Flat 402, Green Avenue, Main Road"
                          defaultValue={editingStudent === "new" ? "" : (editingStudent.address?.line1 ?? "")}
                        />
                      </div>

                      <div className="form-field-group">
                        <label>Address Line 2 (Area / Landmark)</label>
                        <input
                          name="addressLine2"
                          placeholder="e.g. Near City Center Metro"
                          defaultValue={editingStudent === "new" ? "" : (editingStudent.address?.line2 ?? "")}
                        />
                      </div>

                      <div className="form-field-row-3">
                        <div className="form-field-group">
                          <label>City</label>
                          <input
                            name="addressCity"
                            placeholder="e.g. Delhi"
                            defaultValue={editingStudent === "new" ? "" : (editingStudent.address?.city ?? "")}
                          />
                        </div>
                        <div className="form-field-group">
                          <label>State</label>
                          <input
                            name="addressState"
                            placeholder="e.g. Delhi NCR"
                            defaultValue={editingStudent === "new" ? "" : (editingStudent.address?.state ?? "")}
                          />
                        </div>
                        <div className="form-field-group">
                          <label>Postal / PIN Code</label>
                          <input
                            name="addressPostalCode"
                            placeholder="e.g. 110001"
                            defaultValue={editingStudent === "new" ? "" : (editingStudent.address?.postalCode ?? "")}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT COLUMN: Profile Photo, Remarks, Privacy */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {/* Card 3: Profile Photo */}
                    <div className="form-card-section">
                      <div className="form-card-header">
                        <ImageIcon size={15} color="#c084fc" />
                        <h5>Profile Photo</h5>
                      </div>
                      <div key={editingStudent === "new" ? "new" : editingStudent._id}>
                        <ImagePickerInput
                          label="Student Avatar (Square JPG / PNG)"
                          name="profileImageUrl"
                          folder="students"
                          defaultValue={editingStudent === "new" ? null : editingStudent.profileImageUrl}
                          helperText="Upload a crisp portrait photo. Recommended: 500 × 500 px."
                        />
                      </div>
                    </div>

                    {/* Card 4: Additional Notes / Background */}
                    <div className="form-card-section">
                      <div className="form-card-header">
                        <FileText size={15} color="#c084fc" />
                        <h5>Institutional Remarks &amp; Background</h5>
                      </div>
                      <div className="form-field-group">
                        <label>Notes &amp; Academic Background</label>
                        <textarea
                          name="additionalInfo"
                          rows={3}
                          placeholder="College, background, coding experience, preferred batch timings, or counseling notes..."
                          defaultValue={editingStudent === "new" ? "" : (editingStudent.additionalInfo ?? "")}
                        />
                      </div>
                    </div>

                    {/* Card 5: Public Showcase & Privacy Consents */}
                    <div className="form-card-section">
                      <div className="form-card-header">
                        <ShieldCheck size={15} color="#c084fc" />
                        <h5>Directory &amp; Privacy Consents</h5>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        <label className="form-toggle-card">
                          <input
                            type="checkbox"
                            name="publicPhotoConsent"
                            defaultChecked={editingStudent !== "new" && Boolean(editingStudent.publicPhotoConsent)}
                          />
                          <div className="form-toggle-info">
                            <span className="form-toggle-title">Photo Consent for Public Media</span>
                            <span className="form-toggle-desc">
                              Allow student photo to appear on class leaderboards, certificates, and course showcases.
                            </span>
                          </div>
                        </label>

                        <label className="form-toggle-card">
                          <input
                            type="checkbox"
                            name="publicProfile"
                            defaultChecked={editingStudent !== "new" && Boolean(editingStudent.publicProfile)}
                          />
                          <div className="form-toggle-info">
                            <span className="form-toggle-title">Publish Approved Student Profile</span>
                            <span className="form-toggle-desc">
                              Display student in the public alumni and verified student directory (/students).
                            </span>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer Action Bar */}
              <div className="modal-footer-landscape">
                <div>
                  {editingStudent !== "new" && (
                    <button
                      type="button"
                      className="button secondary-btn"
                      style={{
                        color: "#f87171",
                        borderColor: "rgba(239, 68, 68, 0.3)",
                        background: "rgba(239, 68, 68, 0.08)",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                      disabled={savingStudent || updatingId === editingStudent._id}
                      onClick={() => deleteStudent(editingStudent)}
                    >
                      <Trash2 size={14} />
                      <span>Delete Record</span>
                    </button>
                  )}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <button
                    type="button"
                    className="button secondary-btn"
                    disabled={savingStudent}
                    onClick={() => setEditingStudent(null)}
                  >
                    Cancel
                  </button>
                  <button
                    className="button primary-btn"
                    disabled={savingStudent}
                    type="submit"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      background: "linear-gradient(135deg, #7c3aed, #9333ea)",
                      boxShadow: "0 4px 16px rgba(124, 58, 237, 0.4)",
                      padding: "10px 22px",
                      fontWeight: 600,
                    }}
                  >
                    {savingStudent ? (
                      <>
                        <RefreshCw size={14} className="spin" />
                        <span>Saving Record...</span>
                      </>
                    ) : (
                      <>
                        <Check size={15} />
                        <span>{editingStudent === "new" ? "Create Student Record" : "Save Changes"}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
