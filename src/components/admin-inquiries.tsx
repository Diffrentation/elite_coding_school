"use client";

import { useEffect, useState } from "react";
import {
  Phone,
  MessageCircle,
  Mail,
  Calendar,
  Sparkles,
  CheckCircle2,
  Clock,
  RefreshCw,
  Eye,
  X,
  User,
  BookOpen,
  Check,
  Inbox,
  AlertCircle,
  MessageSquare,
} from "lucide-react";
import { CustomSelect, type CustomSelectOption } from "./ui/custom-select";
import { AgTable, type AgColumn } from "./ui/ag-table";

type InquiryStatus = "new" | "contacted" | "closed";

type Inquiry = {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  interestedCourse: string;
  message: string;
  type: string;
  status: InquiryStatus;
  createdAt: string;
};

const INQUIRY_STATUS_OPTIONS: CustomSelectOption[] = [
  { value: "new", label: "New (Needs Follow-up)" },
  { value: "contacted", label: "Contacted / Call Done" },
  { value: "closed", label: "Closed / Enrolled" },
];

const INQUIRY_FILTER_OPTIONS: CustomSelectOption[] = [
  { value: "all", label: "All Follow-up Statuses" },
  { value: "new", label: "New Leads Only" },
  { value: "contacted", label: "Contacted" },
  { value: "closed", label: "Closed" },
];

export function AdminInquiries() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [updatingId, setUpdatingId] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);

  const loadInquiries = () => {
    setLoading(true);
    const url = filter === "all" ? "/api/admin/inquiries" : `/api/admin/inquiries?status=${filter}`;
    fetch(url)
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error?.message ?? "Could not load inquiries.");
        setInquiries(body.data.inquiries ?? []);
      })
      .catch((reason: Error) => setError(reason.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadInquiries();
  }, [filter]);

  async function updateStatus(id: string, nextStatus: InquiryStatus) {
    setUpdatingId(id);
    setError("");
    setSuccessMsg("");
    try {
      const response = await fetch(`/api/admin/inquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error?.message ?? "Could not update the inquiry.");
      setInquiries((current) =>
        current.map((inquiry) =>
          inquiry._id === id ? { ...inquiry, status: body.data.inquiry.status } : inquiry,
        ),
      );
      if (selectedInquiry && selectedInquiry._id === id) {
        setSelectedInquiry((prev) => (prev ? { ...prev, status: nextStatus } : null));
      }
      setSuccessMsg("✓ Lead follow-up status updated successfully.");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not update the inquiry.");
    } finally {
      setUpdatingId("");
    }
  }

  const counts = {
    all: inquiries.length,
    new: inquiries.filter((i) => i.status === "new").length,
    contacted: inquiries.filter((i) => i.status === "contacted").length,
    closed: inquiries.filter((i) => i.status === "closed").length,
  };

  const inquiryColumns: AgColumn<Inquiry>[] = [
    {
      key: "fullName",
      header: "Lead Profile",
      sortable: true,
      render: (inq) => {
        const isDemo = inq.type === "demo";
        const initials =
          inq.fullName
            .split(" ")
            .map((p) => p[0])
            .join("")
            .slice(0, 2)
            .toUpperCase() || "L";

        return (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: isDemo
                  ? "linear-gradient(135deg, #0284c7, #38bdf8)"
                  : "linear-gradient(135deg, #7c3aed, #a855f7)",
                display: "grid",
                placeItems: "center",
                color: "#ffffff",
                fontWeight: 700,
                fontSize: 12,
                flexShrink: 0,
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
              }}
            >
              {initials}
            </div>
            <div>
              <strong style={{ color: "#ffffff", fontSize: 13.5, display: "block" }}>{inq.fullName}</strong>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: "10.5px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  padding: "2px 7px",
                  borderRadius: "4px",
                  background: isDemo ? "rgba(56, 189, 248, 0.14)" : "rgba(168, 85, 247, 0.14)",
                  color: isDemo ? "#38bdf8" : "#c084fc",
                  border: isDemo ? "1px solid rgba(56, 189, 248, 0.3)" : "1px solid rgba(168, 85, 247, 0.3)",
                  marginTop: 3,
                }}
              >
                <Sparkles size={10} /> {isDemo ? "Free Demo Trial" : "Admission Counseling"}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      key: "phone",
      header: "Contact Channels",
      sortable: false,
      render: (inq) => {
        const rawPhone = inq.phone.replace(/[^0-9]/g, "");
        const waPhone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;
        const waUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(
          `Hi ${inq.fullName}, greetings from Elite Coding School regarding your ${inq.type === "demo" ? "free demo class" : "admission inquiry"}.`,
        )}`;
        return (
          <div className="phone-cell">
            <a href={`tel:${inq.phone}`} style={{ color: "#38bdf8", fontWeight: 600, fontSize: 13 }}>
              {inq.phone}
            </a>
            <div className="phone-quick-actions" style={{ display: "flex", gap: 6, marginTop: 4 }}>
              <a
                href={waUrl}
                target="_blank"
                rel="noreferrer"
                className="quick-icon-btn whatsapp"
                title="WhatsApp prospect"
                aria-label="WhatsApp prospect"
              >
                <MessageCircle size={13} />
              </a>
              <a
                href={`tel:${inq.phone}`}
                className="quick-icon-btn"
                title="Call phone"
                aria-label="Call phone"
              >
                <Phone size={13} />
              </a>
              <a
                href={`mailto:${inq.email}`}
                className="quick-icon-btn"
                title="Email lead"
                aria-label="Email lead"
              >
                <Mail size={13} />
              </a>
            </div>
          </div>
        );
      },
    },
    {
      key: "interestedCourse",
      header: "Program of Interest",
      sortable: true,
      render: (inq) => (
        <span
          style={{
            color: "#f1f5f9",
            fontWeight: 600,
            fontSize: 12.5,
            background: "rgba(255, 255, 255, 0.05)",
            padding: "4px 10px",
            borderRadius: 6,
            border: "1px solid rgba(255, 255, 255, 0.08)",
            display: "inline-block",
          }}
        >
          {inq.interestedCourse || "General Inquiry"}
        </span>
      ),
    },
    {
      key: "message",
      header: "Prospect Message",
      sortable: false,
      render: (inq) => (
        <p
          style={{
            margin: 0,
            color: "#94a3b8",
            fontSize: 12,
            maxWidth: 240,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            cursor: inq.message ? "pointer" : "default",
          }}
          title={inq.message || "No message provided"}
          onClick={() => inq.message && setSelectedInquiry(inq)}
        >
          {inq.message || "—"}
        </p>
      ),
    },
    {
      key: "createdAt",
      header: "Submitted",
      sortable: true,
      render: (inq) => (
        <time className="date-cell" style={{ fontSize: 12, color: "#94a3b8" }}>
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
          onChange={(val) => updateStatus(inq._id, val as InquiryStatus)}
        />
      ),
    },
    {
      key: "actions",
      header: "Action",
      sortable: false,
      render: (inq) => (
        <button
          type="button"
          className="view-dossier-btn"
          onClick={() => setSelectedInquiry(inq)}
          style={{
            padding: "6px 12px",
            borderRadius: 6,
            background: "rgba(168, 85, 247, 0.12)",
            border: "1px solid rgba(168, 85, 247, 0.25)",
            color: "#c084fc",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
          }}
        >
          <Eye size={13} />
          <span>Details</span>
        </button>
      ),
    },
  ];

  return (
    <main className="portal-content admin-inquiries">
      {/* 1. Header Intro */}
      <div
        className="portal-intro"
        style={{
          marginBottom: 24,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <p className="kicker" style={{ color: "#38bdf8", fontWeight: 700, letterSpacing: "0.08em" }}>
            PUBLIC WEBSITE LEADS &amp; ADMISSIONS
          </p>
          <h2
            style={{ fontFamily: "var(--font-heading)", fontSize: "28px", color: "#ffffff", margin: "4px 0" }}
          >
            Admission &amp; Demo Inquiries
          </h2>
          <p style={{ color: "#94a3b8", fontSize: "14px", margin: 0 }}>
            Real-time prospective students who contacted Elite Coding School for trial classes or fee
            structures.
          </p>
        </div>
        <button
          className="button refresh-btn"
          onClick={loadInquiries}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "9px 16px",
            borderRadius: 8,
            background: "rgba(255, 255, 255, 0.06)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            color: "#e2e8f0",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          <RefreshCw size={14} className={loading ? "spin" : ""} />
          <span>Refresh</span>
        </button>
      </div>

      {/* 2. KPI Metrics Grid */}
      <div
        className="kpi-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
          gap: 16,
          marginBottom: 28,
        }}
      >
        <div className="kpi-card">
          <div className="kpi-icon-wrap icon-cyan">
            <Inbox size={20} />
          </div>
          <div className="kpi-meta">
            <span className="kpi-title">Total Inquiries</span>
            <strong className="kpi-val">{counts.all}</strong>
            <small className="kpi-sub">All-time contact requests</small>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap icon-amber">
            <Clock size={20} />
          </div>
          <div className="kpi-meta">
            <span className="kpi-title">New Leads</span>
            <strong className="kpi-val">{counts.new}</strong>
            <small className="kpi-sub" style={{ color: counts.new > 0 ? "#fbbf24" : undefined }}>
              {counts.new > 0 ? "⚠️ Needs immediate follow-up" : "All leads caught up"}
            </small>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap icon-purple">
            <Phone size={20} />
          </div>
          <div className="kpi-meta">
            <span className="kpi-title">Contacted Leads</span>
            <strong className="kpi-val">{counts.contacted}</strong>
            <small className="kpi-sub">Call done / demo scheduled</small>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap icon-emerald">
            <CheckCircle2 size={20} />
          </div>
          <div className="kpi-meta">
            <span className="kpi-title">Closed / Enrolled</span>
            <strong className="kpi-val">{counts.closed}</strong>
            <small className="kpi-sub">Joined classroom cohort</small>
          </div>
        </div>
      </div>

      {/* Feedback Messages */}
      {error && <p className="form-error">{error}</p>}
      {successMsg && <p className="form-success">{successMsg}</p>}

      {/* 3. AgTable */}
      <AgTable<Inquiry>
        loading={loading}
        statusTabs={[
          { key: "all", label: "All Leads", count: counts.all },
          { key: "new", label: "New Leads", count: counts.new },
          { key: "contacted", label: "Contacted", count: counts.contacted },
          { key: "closed", label: "Closed / Enrolled", count: counts.closed },
        ]}
        activeStatusTab={filter}
        onStatusTabChange={(tabKey) => setFilter(tabKey)}
        columns={inquiryColumns}
        data={inquiries}
        searchPlaceholder="Search by name, email, phone, or interested program..."
        searchAccessor={(i) => `${i.fullName} ${i.email} ${i.phone} ${i.interestedCourse} ${i.message}`}
        initialPageSize={10}
        emptyMessage="No prospective student leads found."
        getRowId={(i) => i._id}
        onRefresh={loadInquiries}
        onRowClick={(inq) => setSelectedInquiry(inq)}
        exportFilename="public-inquiries"
      />

      {/* 4. Lead Dossier Modal */}
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
              {/* Profile Hero */}
              <div
                className="dossier-hero"
                style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
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
                    style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap", alignItems: "center" }}
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
                      {selectedInquiry.type === "demo"
                        ? "Free Trial Demo Class"
                        : "Admission & Fee Structure"}
                    </span>
                    <span style={{ fontSize: 12, color: "#94a3b8" }}>
                      Submitted on{" "}
                      {new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(
                        new Date(selectedInquiry.createdAt),
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Grid of Details */}
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
                      margin: "0 0 12px",
                      fontSize: 13,
                      color: "#38bdf8",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Contact Information
                  </h5>
                  <div className="dossier-field" style={{ marginBottom: 10 }}>
                    <span style={{ fontSize: 11, color: "#94a3b8", display: "block" }}>Phone Number:</span>
                    <strong style={{ color: "#ffffff", fontSize: 13 }}>{selectedInquiry.phone}</strong>
                  </div>
                  <div className="dossier-field">
                    <span style={{ fontSize: 11, color: "#94a3b8", display: "block" }}>Email Address:</span>
                    <strong style={{ color: "#ffffff", fontSize: 13 }}>
                      {selectedInquiry.email || "Not provided"}
                    </strong>
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
                      margin: "0 0 12px",
                      fontSize: 13,
                      color: "#a855f7",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Lead Status &amp; Course
                  </h5>
                  <div className="dossier-field" style={{ marginBottom: 10 }}>
                    <span style={{ fontSize: 11, color: "#94a3b8", display: "block" }}>
                      Program of Interest:
                    </span>
                    <strong style={{ color: "#ffffff", fontSize: 13 }}>
                      {selectedInquiry.interestedCourse || "General"}
                    </strong>
                  </div>
                  <div className="dossier-field">
                    <span style={{ fontSize: 11, color: "#94a3b8", display: "block", marginBottom: 4 }}>
                      Change Status:
                    </span>
                    <CustomSelect
                      size="sm"
                      variant="status-pill"
                      options={INQUIRY_STATUS_OPTIONS}
                      disabled={updatingId === selectedInquiry._id}
                      value={selectedInquiry.status}
                      onChange={(val) => updateStatus(selectedInquiry._id, val as InquiryStatus)}
                    />
                  </div>
                </div>
              </div>

              {/* Message Block */}
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
                      margin: "0 0 8px",
                      fontSize: 12,
                      color: "#94a3b8",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Prospect Message / Questions:
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

              {/* Quick Communication Actions Bar */}
              {(() => {
                const rawPhone = selectedInquiry.phone.replace(/[^0-9]/g, "");
                const waPhone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;
                const waUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(
                  `Hi ${selectedInquiry.fullName}, greetings from Elite Coding School regarding your ${selectedInquiry.type === "demo" ? "free demo class" : "admission inquiry"}.`,
                )}`;
                return (
                  <div className="dossier-actions-bar" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <a
                      href={`tel:${selectedInquiry.phone}`}
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
                      <span>WhatsApp Chat</span>
                    </a>
                    {selectedInquiry.email && (
                      <a
                        href={`mailto:${selectedInquiry.email}`}
                        className="button secondary-btn"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                          padding: "10px 16px",
                          borderRadius: 8,
                          background: "rgba(255, 255, 255, 0.06)",
                          border: "1px solid rgba(255, 255, 255, 0.12)",
                          color: "#cbd5e1",
                          fontWeight: 600,
                          fontSize: 13,
                          textDecoration: "none",
                        }}
                      >
                        <Mail size={14} />
                        <span>Email</span>
                      </a>
                    )}
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
