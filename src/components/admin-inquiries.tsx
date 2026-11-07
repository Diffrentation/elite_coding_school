"use client";

import { useEffect, useState } from "react";
import { Phone, MessageCircle, Mail, Calendar, Sparkles, CheckCircle2, Clock } from "lucide-react";
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

  const loadInquiries = () => {
    const url = filter === "all" ? "/api/admin/inquiries" : `/api/admin/inquiries?status=${filter}`;
    fetch(url)
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error?.message ?? "Could not load inquiries.");
        setInquiries(body.data.inquiries ?? []);
      })
      .catch((reason: Error) => setError(reason.message));
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
      setSuccessMsg("✓ Lead follow-up status updated.");
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
        return (
          <div>
            <strong style={{ color: "#ffffff", fontSize: 13.5, display: "block" }}>{inq.fullName}</strong>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                fontSize: "11px",
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
              <Sparkles size={11} /> {isDemo ? "Free Demo Class" : "Admission Counseling"}
            </span>
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
            <a href={`tel:${inq.phone}`} style={{ color: "#38bdf8", fontWeight: 600, fontSize: 12.5 }}>
              {inq.phone}
            </a>
            <div className="phone-quick-actions">
              <a
                href={waUrl}
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
        );
      },
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
          onChange={(val) => updateStatus(inq._id, val as InquiryStatus)}
        />
      ),
    },
  ];

  return (
    <main className="portal-content admin-inquiries" style={{ maxWidth: 1300, margin: "0 auto", padding: "28px" }}>
      <div className="portal-intro" style={{ marginBottom: 20 }}>
        <div>
          <p className="kicker" style={{ color: "#38bdf8", fontWeight: 700, letterSpacing: "0.08em" }}>
            PUBLIC WEBSITE LEADS
          </p>
          <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "28px", color: "#ffffff", margin: "4px 0" }}>
            Admission &amp; Demo Inquiries
          </h2>
          <p style={{ color: "#94a3b8", fontSize: "14px" }}>
            Real-time public contact requests submitted through the Elite Coding School website.
          </p>
        </div>
      </div>

      {error && <p className="form-error">{error}</p>}
      {successMsg && <p className="form-success">{successMsg}</p>}

      {/* Status Filter Tabs */}
      <div className="filter-row" aria-label="Lead status filter" style={{ marginBottom: 18 }}>
        {(["all", "new", "contacted", "closed"] as const).map((st) => (
          <button
            className={filter === st ? "selected" : ""}
            key={st}
            onClick={() => {
              setError("");
              setFilter(st);
            }}
          >
            <span>{st === "all" ? "ALL LEADS" : st.toUpperCase()}</span>
            <span
              style={{
                marginLeft: 6,
                fontSize: 11,
                padding: "2px 7px",
                borderRadius: 99,
                background: filter === st ? "rgba(255, 255, 255, 0.28)" : "rgba(255, 255, 255, 0.08)",
                color: "#ffffff",
                fontWeight: 700,
              }}
            >
              {counts[st]}
            </span>
          </button>
        ))}
      </div>

      <AgTable<Inquiry>
        breadcrumbs={["Admin", "Admissions", "Public Website Inquiries"]}
        statusTabs={[
          { key: "all", label: "All Leads", count: inquiries.length },
          { key: "new", label: "New Leads", count: inquiries.filter((i) => i.status === "new").length },
          { key: "contacted", label: "Contacted", count: inquiries.filter((i) => i.status === "contacted").length },
          { key: "closed", label: "Closed / Enrolled", count: inquiries.filter((i) => i.status === "closed").length },
        ]}
        activeStatusTab={filter}
        onStatusTabChange={(tabKey) => setFilter(tabKey)}
        columns={inquiryColumns}
        data={inquiries}
        title="Incoming Prospective Student Inquiries"
        subtitle="Manage leads, schedule free demo trials, and record counseling contact progress"
        searchPlaceholder="Search by name, email, phone, or interested program..."
        searchAccessor={(i) => `${i.fullName} ${i.email} ${i.phone} ${i.interestedCourse} ${i.message}`}
        filterOptions={INQUIRY_FILTER_OPTIONS}
        filterValue={filter}
        onFilterChange={(val) => setFilter(val)}
        filterPlaceholder="Any status"
        initialPageSize={10}
        emptyMessage="No prospective student leads found."
        getRowId={(i) => i._id}
        onRefresh={loadInquiries}
        exportFilename="public-inquiries"
      />
    </main>
  );
}
