"use client";

import { useEffect, useState } from "react";
import { Phone, MessageCircle, Mail, Calendar, Sparkles, CheckCircle2, Clock } from "lucide-react";

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

const statuses: InquiryStatus[] = ["new", "contacted", "closed"];

export function AdminInquiries() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [filter, setFilter] = useState<"all" | InquiryStatus>("all");
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState("");

  useEffect(() => {
    const url = filter === "all" ? "/api/admin/inquiries" : `/api/admin/inquiries?status=${filter}`;
    fetch(url)
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error?.message ?? "Could not load inquiries.");
        setInquiries(body.data.inquiries ?? []);
      })
      .catch((reason: Error) => setError(reason.message));
  }, [filter]);

  async function updateStatus(id: string, status: InquiryStatus) {
    setUpdatingId(id);
    setError("");
    try {
      const response = await fetch(`/api/admin/inquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error?.message ?? "Could not update the inquiry.");
      setInquiries((current) =>
        current.map((inquiry) =>
          inquiry._id === id ? { ...inquiry, status: body.data.inquiry.status } : inquiry,
        ),
      );
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

  return (
    <main className="portal-content admin-inquiries" style={{ maxWidth: 1200, margin: "0 auto", padding: "28px" }}>
      <div className="portal-intro" style={{ marginBottom: 24 }}>
        <div>
          <p className="kicker" style={{ color: "#38bdf8", fontWeight: 700, letterSpacing: "0.08em" }}>PUBLIC WEBSITE LEADS</p>
          <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "28px", color: "#ffffff", margin: "4px 0" }}>Admission & Demo Inquiries</h2>
          <p style={{ color: "#94a3b8", fontSize: "14px" }}>
            Real-time public contact requests submitted through the Elite Coding School website.
          </p>
        </div>
      </div>

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "24px" }}>
        {(["all", ...statuses] as const).map((status) => (
          <button
            key={status}
            onClick={() => {
              setError("");
              setFilter(status);
            }}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.15s ease",
              background: filter === status ? "linear-gradient(90deg, #7c3aed, #9333ea)" : "rgba(255, 255, 255, 0.05)",
              color: filter === status ? "#ffffff" : "#94a3b8",
              border: filter === status ? "1px solid #a855f7" : "1px solid rgba(255, 255, 255, 0.1)",
              boxShadow: filter === status ? "0 4px 14px rgba(124, 58, 237, 0.3)" : "none",
            }}
          >
            {status === "all" ? `All Leads (${counts.all})` : `${status.toUpperCase()} (${counts[status]})`}
          </button>
        ))}
      </div>

      {error && (
        <div style={{ background: "rgba(239, 68, 68, 0.12)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#fca5a5", padding: "12px 16px", borderRadius: "10px", marginBottom: "20px" }}>
          {error}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "18px" }}>
        {inquiries.length > 0 ? (
          inquiries.map((inquiry) => {
            const rawPhone = inquiry.phone.replace(/[^0-9]/g, "");
            const waPhone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;
            const waUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(
              `Hi ${inquiry.fullName}, greetings from Elite Coding School regarding your ${inquiry.type === "demo" ? "free demo class" : "admission inquiry"}.`,
            )}`;

            return (
              <div key={inquiry._id} className="inquiry-lead-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                  <div>
                    <h4 style={{ margin: "0 0 4px 0", fontSize: "16px", color: "#f8fafc", fontWeight: 700 }}>
                      {inquiry.fullName}
                    </h4>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        fontSize: "11px",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        padding: "3px 8px",
                        borderRadius: "5px",
                        background: inquiry.type === "demo" ? "rgba(56, 189, 248, 0.14)" : "rgba(168, 85, 247, 0.14)",
                        color: inquiry.type === "demo" ? "#38bdf8" : "#c084fc",
                        border: inquiry.type === "demo" ? "1px solid rgba(56, 189, 248, 0.3)" : "1px solid rgba(168, 85, 247, 0.3)",
                      }}
                    >
                      <Sparkles size={11} /> {inquiry.type === "demo" ? "Free Trial Demo" : "In-Person Counseling"}
                    </span>
                  </div>

                  <select
                    value={inquiry.status}
                    disabled={updatingId === inquiry._id}
                    onChange={(e) => updateStatus(inquiry._id, e.target.value as InquiryStatus)}
                    style={{
                      background: "#070b24",
                      color: inquiry.status === "new" ? "#38bdf8" : inquiry.status === "contacted" ? "#facc15" : "#4ade80",
                      border: "1px solid rgba(255, 255, 255, 0.15)",
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 600,
                      padding: "4px 8px",
                      cursor: "pointer",
                    }}
                  >
                    <option value="new">NEW</option>
                    <option value="contacted">CONTACTED</option>
                    <option value="closed">CLOSED</option>
                  </select>
                </div>

                <div style={{ margin: "12px 0", fontSize: "13px", color: "#cbd5e1" }}>
                  <div style={{ marginBottom: 4 }}>
                    <span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", fontWeight: 700 }}>Program of Interest:</span>
                    <div style={{ color: "#e2e8f0", fontWeight: 600 }}>{inquiry.interestedCourse || "General Classroom Counseling"}</div>
                  </div>
                  {inquiry.message && (
                    <div style={{ marginTop: 8, padding: "8px 10px", background: "rgba(0, 0, 0, 0.25)", borderRadius: 6, fontStyle: "italic", fontSize: 12, color: "#94a3b8" }}>
                      &ldquo;{inquiry.message}&rdquo;
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", paddingTop: 10, borderTop: "1px solid rgba(255, 255, 255, 0.06)" }}>
                  <a
                    href={`tel:${inquiry.phone}`}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      padding: "5px 10px",
                      borderRadius: 6,
                      background: "rgba(56, 189, 248, 0.1)",
                      color: "#38bdf8",
                      fontSize: 12,
                      fontWeight: 600,
                      textDecoration: "none",
                      border: "1px solid rgba(56, 189, 248, 0.2)",
                    }}
                  >
                    <Phone size={12} /> {inquiry.phone}
                  </a>

                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      padding: "5px 10px",
                      borderRadius: 6,
                      background: "rgba(34, 197, 94, 0.12)",
                      color: "#4ade80",
                      fontSize: 12,
                      fontWeight: 600,
                      textDecoration: "none",
                      border: "1px solid rgba(34, 197, 94, 0.25)",
                    }}
                  >
                    <MessageCircle size={12} /> WhatsApp
                  </a>

                  <a
                    href={`mailto:${inquiry.email}`}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      padding: "5px 10px",
                      borderRadius: 6,
                      background: "rgba(255, 255, 255, 0.06)",
                      color: "#cbd5e1",
                      fontSize: 12,
                      textDecoration: "none",
                    }}
                  >
                    <Mail size={12} /> Email
                  </a>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 10, fontSize: 11, color: "#64748b" }}>
                  <Calendar size={11} /> {new Date(inquiry.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                </div>
              </div>
            );
          })
        ) : (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "48px 20px", background: "rgba(255, 255, 255, 0.02)", borderRadius: 12, border: "1px dashed rgba(255, 255, 255, 0.1)", color: "#94a3b8" }}>
            No {filter === "all" ? "" : filter} public inquiries found.
          </div>
        )}
      </div>
    </main>
  );
}
