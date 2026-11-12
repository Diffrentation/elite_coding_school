"use client";

import { FormEvent, useEffect, useState, useMemo, useRef } from "react";
import {
  Award,
  Ban,
  Download,
  ExternalLink,
  FileCheck2,
  ImageIcon,
  Printer,
  ShieldCheck,
  GraduationCap,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Eye,
  RefreshCw,
  FileText,
  Clock,
  Sparkles,
  Users,
  Search,
} from "lucide-react";
import { ImagePickerInput } from "@/components/image-picker-input";
import { AgTable, type AgColumn } from "./ui/ag-table";

type Enrollment = {
  _id: string;
  courseTitleSnapshot: string;
  batch: string;
  joiningDate: string;
  status: string;
  studentId?: { fullName?: string; studentId?: string; email?: string };
};

type Certificate = {
  _id: string;
  certificateId: string;
  studentNameSnapshot: string;
  courseNameSnapshot: string;
  batchSnapshot?: string;
  issueDate: string;
  status: "active" | "revoked";
  verificationPath: string;
  templateUrl?: string;
  revocationReason?: string;
  studentId?: { profileImageUrl?: string | null; studentId?: string };
};

type Template = {
  _id: string;
  name: string;
  imageUrl: string;
};

const request = async (url: string, init?: RequestInit) => {
  const response = await fetch(url, init);
  const body = await response.json();
  if (!response.ok || !body.success) {
    throw new Error(body.error?.message ?? "Request failed.");
  }
  return body.data;
};

export function AdminCertificates() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [template, setTemplate] = useState<Template | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const issueFormRef = useRef<HTMLFormElement>(null);

  const load = () =>
    Promise.all([
      request("/api/admin/certificates"),
      request("/api/admin/enrollments"),
      request("/api/admin/certificate-template"),
    ])
      .then(([certificateData, enrollmentData, templateData]) => {
        setCertificates(certificateData.certificates ?? []);
        setEnrollments(
          (enrollmentData.enrollments ?? []).filter((item: Enrollment) => item.status === "completed"),
        );
        setTemplate(templateData.template ?? null);
      })
      .catch((reason: Error) => setError(reason.message));

  useEffect(() => {
    void load();
  }, []);

  async function saveTemplate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    setError("");
    const form = new FormData(event.currentTarget);
    const name = form.get("name")?.toString().trim();
    const imageUrl = form.get("imageUrl")?.toString().trim();

    if (!name || !imageUrl) {
      setError("Please specify a template name and upload the certificate artwork.");
      setBusy(false);
      return;
    }

    try {
      await request("/api/admin/certificate-template", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, imageUrl }),
      });
      setMessage("✓ Replacement certificate artwork saved and activated successfully.");
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not save template.");
    } finally {
      setBusy(false);
    }
  }

  async function issue(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    setError("");
    const form = new FormData(event.currentTarget);
    const enrollmentId = form.get("enrollmentId")?.toString();
    const issueDate = form.get("issueDate")?.toString();

    if (!enrollmentId || !issueDate) {
      setError("Please select a completed enrollment and specify an issue date.");
      setBusy(false);
      return;
    }

    try {
      const data = await request("/api/admin/certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enrollmentId, issueDate }),
      });
      setMessage(`✓ Certificate ${data.certificate.certificateId} generated and signed.`);
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not issue certificate.");
    } finally {
      setBusy(false);
    }
  }

  async function previewCertificate() {
    const form = issueFormRef.current;
    if (!form) return;
    const formData = new FormData(form);
    const enrollmentId = formData.get("enrollmentId")?.toString();
    const issueDate = formData.get("issueDate")?.toString();

    if (!enrollmentId || !issueDate) {
      setError("Select a completed student and issue date to preview the certificate.");
      return;
    }

    const previewWindow = window.open("", "_blank");
    if (!previewWindow) {
      setError("Your browser blocked the preview tab. Allow pop-ups for this site and try again.");
      return;
    }

    setPreviewing(true);
    setError("");
    try {
      const response = await fetch("/api/admin/certificates/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enrollmentId, issueDate }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error?.message ?? "Could not generate the certificate preview.");
      }
      const previewUrl = URL.createObjectURL(await response.blob());
      previewWindow.location.replace(previewUrl);
      window.setTimeout(() => URL.revokeObjectURL(previewUrl), 60_000);
    } catch (reason) {
      previewWindow.close();
      setError(reason instanceof Error ? reason.message : "Could not generate the certificate preview.");
    } finally {
      setPreviewing(false);
    }
  }

  async function revoke(certificate: Certificate) {
    const reason = window.prompt(
      `Revoke ${certificate.certificateId} for ${certificate.studentNameSnapshot}. Enter official revocation reason:`,
    );
    if (!reason) return;
    setBusy(true);
    setError("");
    try {
      await request(`/api/admin/certificates/${certificate._id}/revoke`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      setMessage(`✓ Certificate ${certificate.certificateId} has been revoked.`);
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not revoke certificate.");
    } finally {
      setBusy(false);
    }
  }

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Filtered certificates for AgTable
  const filteredCertificates = useMemo(() => {
    if (statusFilter === "active") return certificates.filter((c) => c.status === "active");
    if (statusFilter === "revoked") return certificates.filter((c) => c.status === "revoked");
    return certificates;
  }, [certificates, statusFilter]);

  const activeCount = certificates.filter((c) => c.status === "active").length;
  const revokedCount = certificates.filter((c) => c.status === "revoked").length;

  const certificateColumns: AgColumn<Certificate>[] = [
    {
      key: "certificateId",
      header: "Certificate ID",
      sortable: true,
      render: (cert) => {
        const isCopied = copiedId === cert._id;
        return (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontWeight: 700,
                fontSize: 12.5,
                color: "#c084fc",
                background: "rgba(168, 85, 247, 0.12)",
                padding: "3px 8px",
                borderRadius: 6,
                border: "1px solid rgba(168, 85, 247, 0.28)",
                letterSpacing: "0.03em",
              }}
            >
              {cert.certificateId}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleCopy(cert.certificateId, cert._id);
              }}
              title="Copy Certificate ID"
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: 4,
                color: isCopied ? "#34d399" : "#94a3b8",
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              {isCopied ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>
        );
      },
    },
    {
      key: "studentNameSnapshot",
      header: "Student Recipient",
      sortable: true,
      render: (cert) => {
        const initials = cert.studentNameSnapshot
          .split(" ")
          .map((n) => n[0])
          .slice(0, 2)
          .join("")
          .toUpperCase();
        return (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #7c3aed, #a855f7)",
                color: "#ffffff",
                display: "grid",
                placeItems: "center",
                fontSize: 12,
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {initials}
            </div>
            <div>
              <strong style={{ color: "#ffffff", fontSize: 13.5, display: "block" }}>
                {cert.studentNameSnapshot}
              </strong>
              {cert.studentId?.studentId && (
                <small style={{ color: "#94a3b8", fontSize: 11, fontFamily: "var(--font-mono)" }}>
                  #{cert.studentId.studentId}
                </small>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: "courseNameSnapshot",
      header: "Course Program",
      sortable: true,
      render: (cert) => (
        <div>
          <span style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 500, display: "block" }}>
            {cert.courseNameSnapshot}
          </span>
          {cert.batchSnapshot && (
            <small
              style={{
                fontSize: 11,
                color: "#38bdf8",
                background: "rgba(56, 189, 248, 0.1)",
                padding: "1px 6px",
                borderRadius: 4,
                display: "inline-block",
                marginTop: 2,
              }}
            >
              {cert.batchSnapshot}
            </small>
          )}
        </div>
      ),
    },
    {
      key: "issueDate",
      header: "Issue Date",
      sortable: true,
      render: (cert) => (
        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#cbd5e1", fontSize: 12.5 }}>
          <Calendar size={13} style={{ color: "#94a3b8" }} />
          <span>
            {new Date(cert.issueDate).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Verification Status",
      sortable: true,
      render: (cert) => (
        <span
          className={`status-badge ${
            cert.status === "active" ? "course-status-published" : "course-status-archived"
          }`}
          style={{
            fontSize: 11,
            fontWeight: 700,
            textTransform: "uppercase",
            padding: "3px 8px",
            borderRadius: 6,
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            background: cert.status === "active" ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
            color: cert.status === "active" ? "#34d399" : "#f87171",
            border: `1px solid ${
              cert.status === "active" ? "rgba(16, 185, 129, 0.35)" : "rgba(239, 68, 68, 0.35)"
            }`,
          }}
        >
          ● {cert.status === "active" ? "Active Verified" : "Revoked"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      sortable: false,
      render: (cert) => (
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <a
            href={`/api/admin/certificates/${cert._id}/pdf`}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              padding: "5px 10px",
              borderRadius: 6,
              background: "rgba(168, 85, 247, 0.14)",
              border: "1px solid rgba(168, 85, 247, 0.32)",
              color: "#c084fc",
              fontSize: 12,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            <Download size={13} /> PDF
          </a>
          <a
            href={cert.verificationPath}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              padding: "5px 10px",
              borderRadius: 6,
              background: "rgba(56, 189, 248, 0.12)",
              border: "1px solid rgba(56, 189, 248, 0.28)",
              color: "#38bdf8",
              fontSize: 12,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            <ExternalLink size={13} /> Verify
          </a>
          {cert.status === "active" && (
            <button
              type="button"
              disabled={busy}
              onClick={() => void revoke(cert)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                padding: "5px 10px",
                borderRadius: 6,
                background: "rgba(239, 68, 68, 0.12)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                color: "#f87171",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <Ban size={13} /> Revoke
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <main className="portal-content admin-certificates-page" style={{ maxWidth: 1280, margin: "0 auto" }}>
      {/* 1. PORTAL INTRO HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div>
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
            CREDENTIAL MANAGEMENT &amp; VERIFICATION
          </p>
          <h1
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "28px",
              color: "#ffffff",
              margin: "0 0 8px",
              fontWeight: 800,
            }}
          >
            Certificates &amp; Verification
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "14px", margin: 0, maxWidth: 680 }}>
            Issue tamper-proof graduation certificates for completed classroom cohorts. Student contact
            details remain strictly private, while credential IDs can be scanned and verified online.
          </p>
        </div>

        {/* Live Template Status Pill */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 14px",
            borderRadius: 999,
            fontSize: 12.5,
            fontWeight: 700,
            background: template ? "rgba(16, 185, 129, 0.12)" : "rgba(245, 158, 11, 0.12)",
            color: template ? "#34d399" : "#fbbf24",
            border: `1px solid ${template ? "rgba(16, 185, 129, 0.35)" : "rgba(245, 158, 11, 0.35)"}`,
          }}
        >
          {template ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>
            {template
              ? `Official A4 Template Active: "${template.name}"`
              : "Preparing official A4 template..."}
          </span>
        </div>
      </div>

      {/* 2. KPI METRICS SUMMARY STRIP */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
          marginBottom: 28,
        }}
      >
        <div
          style={{
            background: "#0a0f32",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: 14,
            padding: "18px 20px",
            display: "flex",
            alignItems: "center",
            gap: 14,
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.25)",
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: "rgba(168, 85, 247, 0.15)",
              color: "#c084fc",
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
            }}
          >
            <Award size={22} />
          </div>
          <div>
            <span style={{ fontSize: 11.5, color: "#94a3b8", display: "block", fontWeight: 600 }}>
              TOTAL ISSUED
            </span>
            <strong style={{ fontSize: 24, color: "#ffffff", fontWeight: 800 }}>{certificates.length}</strong>
          </div>
        </div>

        <div
          style={{
            background: "#0a0f32",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: 14,
            padding: "18px 20px",
            display: "flex",
            alignItems: "center",
            gap: 14,
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.25)",
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: "rgba(16, 185, 129, 0.15)",
              color: "#34d399",
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
            }}
          >
            <ShieldCheck size={22} />
          </div>
          <div>
            <span style={{ fontSize: 11.5, color: "#94a3b8", display: "block", fontWeight: 600 }}>
              ACTIVE VERIFIED
            </span>
            <strong style={{ fontSize: 24, color: "#34d399", fontWeight: 800 }}>{activeCount}</strong>
          </div>
        </div>

        <div
          style={{
            background: "#0a0f32",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: 14,
            padding: "18px 20px",
            display: "flex",
            alignItems: "center",
            gap: 14,
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.25)",
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: "rgba(56, 189, 248, 0.15)",
              color: "#38bdf8",
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
            }}
          >
            <GraduationCap size={22} />
          </div>
          <div>
            <span style={{ fontSize: 11.5, color: "#94a3b8", display: "block", fontWeight: 600 }}>
              ELIGIBLE COMPLETED
            </span>
            <strong style={{ fontSize: 24, color: "#ffffff", fontWeight: 800 }}>{enrollments.length}</strong>
          </div>
        </div>

        <div
          style={{
            background: "#0a0f32",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: 14,
            padding: "18px 20px",
            display: "flex",
            alignItems: "center",
            gap: 14,
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.25)",
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: template ? "rgba(16, 185, 129, 0.15)" : "rgba(245, 158, 11, 0.15)",
              color: template ? "#34d399" : "#fbbf24",
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
            }}
          >
            <ImageIcon size={22} />
          </div>
          <div>
            <span style={{ fontSize: 11.5, color: "#94a3b8", display: "block", fontWeight: 600 }}>
              A4 ARTWORK STATUS
            </span>
            <strong style={{ fontSize: 18, color: template ? "#34d399" : "#fbbf24", fontWeight: 700 }}>
              {template ? "Ready (A4)" : "Artwork Missing"}
            </strong>
          </div>
        </div>
      </section>

      {/* Global Alerts */}
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
            marginBottom: 24,
            fontSize: 13.5,
          }}
        >
          <CheckCircle2 size={16} />
          <span>{message}</span>
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
            marginBottom: 24,
            fontSize: 13.5,
          }}
        >
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* 3. TWO-COLUMN WORKSTATION CARDS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
          gap: 24,
          marginBottom: 32,
          alignItems: "start",
        }}
      >
        {/* Panel 1: Certificate A4 Artwork Template */}
        <section
          style={{
            background: "#0a0f32",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: 16,
            overflow: "hidden",
            boxShadow: "0 12px 35px rgba(0, 0, 0, 0.3)",
          }}
        >
          <div
            style={{
              padding: "18px 22px",
              borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
              background: "#0d133a",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: "rgba(168, 85, 247, 0.15)",
                color: "#c084fc",
                display: "grid",
                placeItems: "center",
                flexShrink: 0,
              }}
            >
              <ImageIcon size={18} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 16, color: "#ffffff", fontFamily: "var(--font-heading)" }}>
                Certificate Artwork Template
              </h2>
              <small style={{ color: "#94a3b8", fontSize: 12 }}>
                High-resolution A4 landscape background artwork for PDF generation.
              </small>
            </div>
          </div>

          <div style={{ padding: 22 }}>
            {/* Live A4 Landscape Canvas Preview */}
            <div style={{ marginBottom: 20 }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#94a3b8",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  display: "block",
                  marginBottom: 8,
                }}
              >
                A4 Template Preview
              </span>

              {template?.imageUrl ? (
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    aspectRatio: "1.414 / 1",
                    borderRadius: 10,
                    overflow: "hidden",
                    border: "1px solid rgba(168, 85, 247, 0.35)",
                    background: "#06091e",
                    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.4)",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={template.imageUrl}
                    alt="Active Certificate Template"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                  {/* The admin preview intentionally shows only the original artwork. */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "rgba(6, 9, 30, 0.45)",
                      display: "none",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: 6,
                      padding: 12,
                      textAlign: "center",
                    }}
                  >
                    <span
                      style={{
                        background: "rgba(6, 9, 30, 0.8)",
                        color: "#38bdf8",
                        border: "1px solid rgba(56, 189, 248, 0.35)",
                        padding: "3px 10px",
                        borderRadius: 6,
                        fontSize: 11,
                        fontWeight: 700,
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      [ DYNAMIC OVERLAY AREA ]
                    </span>
                    <span style={{ color: "#ffffff", fontSize: 13, fontWeight: 700 }}>
                      Student Name • Course Title
                    </span>
                    <span style={{ color: "#cbd5e1", fontSize: 11, fontFamily: "var(--font-mono)" }}>
                      #ECS-CERT-XXXX • Issue Date • Scannable QR Code
                    </span>
                  </div>
                  <a
                    href={template.imageUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      position: "absolute",
                      bottom: 8,
                      right: 8,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      background: "rgba(6, 9, 30, 0.85)",
                      color: "#cbd5e1",
                      border: "1px solid rgba(255, 255, 255, 0.15)",
                      padding: "4px 8px",
                      borderRadius: 6,
                      fontSize: 11,
                      textDecoration: "none",
                      fontWeight: 600,
                    }}
                  >
                    <ExternalLink size={11} /> View Full
                  </a>
                </div>
              ) : (
                <div
                  style={{
                    width: "100%",
                    aspectRatio: "1.414 / 1",
                    borderRadius: 10,
                    border: "2px dashed rgba(168, 85, 247, 0.35)",
                    background: "rgba(168, 85, 247, 0.04)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    padding: 20,
                    textAlign: "center",
                  }}
                >
                  <ImageIcon size={32} style={{ color: "#a855f7", opacity: 0.7 }} />
                  <div>
                    <strong style={{ color: "#ffffff", fontSize: 13, display: "block" }}>
                      Preparing the official A4 certificate artwork
                    </strong>
                    <span style={{ color: "#94a3b8", fontSize: 11.5 }}>
                      The official artwork is activated automatically for every eligible course.
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                padding: "13px 14px",
                borderRadius: 10,
                background: "rgba(16, 185, 129, 0.08)",
                border: "1px solid rgba(16, 185, 129, 0.24)",
              }}
            >
              <ShieldCheck size={19} style={{ color: "#34d399", flex: "0 0 auto", marginTop: 1 }} />
              <div>
                <strong style={{ display: "block", color: "#d1fae5", fontSize: 13 }}>
                  Official certificate template active
                </strong>
                <span
                  style={{
                    display: "block",
                    color: "#a7c8ba",
                    fontSize: 11.5,
                    lineHeight: 1.55,
                    marginTop: 3,
                  }}
                >
                  The default artwork is used automatically. Student name, course title, certificate ID, issue
                  date, and QR verification are generated for each certificate.
                </span>
              </div>
            </div>

            <form onSubmit={saveTemplate} style={{ display: "none" }} aria-hidden="true">
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#cbd5e1",
                    marginBottom: 6,
                  }}
                >
                  Template Display Name
                </label>
                <input
                  name="name"
                  required
                  defaultValue={template?.name ?? "Elite Coding School Certificate"}
                  placeholder="e.g. Elite Coding School Master Certificate"
                  style={{
                    width: "100%",
                    height: 42,
                    boxSizing: "border-box",
                    padding: "0 14px",
                    borderRadius: 8,
                    background: "#070b24",
                    border: "1px solid rgba(255, 255, 255, 0.14)",
                    color: "#ffffff",
                    fontSize: 13.5,
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <ImagePickerInput
                  label="Replace Official Artwork (optional PNG / JPG)"
                  name="imageUrl"
                  folder="certificates"
                  defaultValue={template?.imageUrl ?? null}
                  helperText="Recommended: 3508 × 2480 px (300 DPI) or 1754 × 1240 px for crisp A4 landscape printing."
                />
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 12,
                  paddingTop: 10,
                  borderTop: "1px solid rgba(255, 255, 255, 0.06)",
                }}
              >
                <small style={{ color: "#94a3b8", fontSize: 11.5, maxWidth: 260 }}>
                  A4 Landscape: 297mm × 210mm artwork ratio.
                </small>
                <button
                  className="button primary"
                  disabled={busy}
                  type="submit"
                  style={{
                    padding: "9px 20px",
                    borderRadius: 8,
                    background: "linear-gradient(135deg, #7c3aed, #9333ea)",
                    color: "#ffffff",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    boxShadow: "0 4px 16px rgba(124, 58, 237, 0.4)",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <ImageIcon size={15} />
                  <span>{busy ? "Saving Replacement..." : "Replace Active Template"}</span>
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* Panel 2: Issue Verifiable Certificate */}
        <section
          style={{
            background: "#0a0f32",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: 16,
            overflow: "hidden",
            boxShadow: "0 12px 35px rgba(0, 0, 0, 0.3)",
          }}
        >
          <div
            style={{
              padding: "18px 22px",
              borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
              background: "#0d133a",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: "rgba(56, 189, 248, 0.15)",
                color: "#38bdf8",
                display: "grid",
                placeItems: "center",
                flexShrink: 0,
              }}
            >
              <Award size={18} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 16, color: "#ffffff", fontFamily: "var(--font-heading)" }}>
                Issue New Certificate
              </h2>
              <small style={{ color: "#94a3b8", fontSize: 12 }}>
                Allocate a verifiable credential for an eligible completed student.
              </small>
            </div>
          </div>

          <div style={{ padding: 22 }}>
            {!template && (
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  background: "rgba(245, 158, 11, 0.12)",
                  border: "1px solid rgba(245, 158, 11, 0.3)",
                  color: "#fbbf24",
                  padding: "12px 16px",
                  borderRadius: 10,
                  fontSize: 12.5,
                  marginBottom: 18,
                }}
              >
                <AlertCircle size={17} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>
                  <strong>Preparing official artwork:</strong> Refresh once if this is the first visit. The
                  default A4 certificate template is activated automatically; no upload is required.
                </span>
              </div>
            )}

            <form
              ref={issueFormRef}
              onSubmit={issue}
              style={{ display: "flex", flexDirection: "column", gap: 16 }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#cbd5e1",
                    marginBottom: 6,
                  }}
                >
                  Completed Student &amp; Cohort
                </label>

                {enrollments.length === 0 ? (
                  <div
                    style={{
                      padding: "16px",
                      borderRadius: 10,
                      background: "rgba(255, 255, 255, 0.03)",
                      border: "1px dashed rgba(255, 255, 255, 0.12)",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <GraduationCap size={24} style={{ color: "#38bdf8", flexShrink: 0 }} />
                    <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.5 }}>
                      <strong style={{ color: "#ffffff", display: "block" }}>
                        No completed student enrollments ready
                      </strong>
                      Students appear in this dropdown once their cohort status is marked as
                      &apos;Completed&apos; in the Enrollments panel.
                    </div>
                  </div>
                ) : (
                  <select
                    name="enrollmentId"
                    required
                    defaultValue=""
                    style={{
                      width: "100%",
                      height: 44,
                      boxSizing: "border-box",
                      padding: "0 14px",
                      borderRadius: 8,
                      background: "#070b24",
                      border: "1px solid rgba(255, 255, 255, 0.14)",
                      color: "#ffffff",
                      fontSize: 13,
                      outline: "none",
                      cursor: "pointer",
                    }}
                  >
                    <option value="" disabled>
                      Select an eligible completed student...
                    </option>
                    {enrollments.map((item) => (
                      <option value={item._id} key={item._id}>
                        {item.studentId?.fullName ?? "Student"} — {item.courseTitleSnapshot} ({item.batch})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#cbd5e1",
                    marginBottom: 6,
                  }}
                >
                  Credential Issue Date
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    name="issueDate"
                    type="date"
                    required
                    defaultValue={new Date().toISOString().slice(0, 10)}
                    style={{
                      width: "100%",
                      height: 42,
                      boxSizing: "border-box",
                      padding: "0 14px",
                      borderRadius: 8,
                      background: "#070b24",
                      border: "1px solid rgba(255, 255, 255, 0.14)",
                      color: "#ffffff",
                      fontSize: 13.5,
                      outline: "none",
                    }}
                  />
                </div>
              </div>

              {/* Security & Verification Guarantee Strip */}
              <div
                style={{
                  padding: "12px 14px",
                  borderRadius: 10,
                  background: "rgba(56, 189, 248, 0.08)",
                  border: "1px solid rgba(56, 189, 248, 0.22)",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  fontSize: 12,
                  color: "#cbd5e1",
                  marginTop: 4,
                }}
              >
                <ShieldCheck size={18} style={{ color: "#38bdf8", flexShrink: 0 }} />
                <span>
                  The server cryptographically signs the record, allocates a sequential ID (#ECS-CERT-...),
                  and embeds an anti-tamper QR verification link.
                </span>
              </div>

              <div
                style={{
                  paddingTop: 12,
                  borderTop: "1px solid rgba(255, 255, 255, 0.06)",
                  display: "grid",
                  gridTemplateColumns: "minmax(0, .85fr) minmax(0, 1.15fr)",
                  gap: 10,
                }}
              >
                <button
                  type="button"
                  disabled={busy || previewing || !enrollments.length}
                  onClick={() => void previewCertificate()}
                  style={{
                    height: 44,
                    borderRadius: 9,
                    background: "rgba(255, 255, 255, 0.06)",
                    color: "#e2e8f0",
                    border: "1px solid rgba(255, 255, 255, 0.18)",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: busy || previewing || !enrollments.length ? "not-allowed" : "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 7,
                  }}
                >
                  <Eye size={16} />
                  <span>{previewing ? "Preparing preview..." : "Preview PDF"}</span>
                </button>
                <button
                  className="button primary"
                  disabled={busy || previewing || !template || !enrollments.length}
                  type="submit"
                  style={{
                    width: "100%",
                    height: 44,
                    borderRadius: 9,
                    background:
                      busy || previewing || !template || !enrollments.length
                        ? "rgba(255, 255, 255, 0.08)"
                        : "linear-gradient(135deg, #0284c7, #0284c7, #38bdf8)",
                    color: "#ffffff",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    fontSize: 13.5,
                    fontWeight: 700,
                    cursor:
                      busy || previewing || !template || !enrollments.length ? "not-allowed" : "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    boxShadow:
                      busy || previewing || !template || !enrollments.length
                        ? "none"
                        : "0 4px 18px rgba(2, 132, 199, 0.4)",
                  }}
                >
                  <FileCheck2 size={16} />
                  <span>{busy ? "Issuing & Signing..." : "Issue Verified Certificate"}</span>
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>

      {/* 4. SECTION 3: ISSUED CERTIFICATES LEDGER (AG-TABLE) */}
      <section style={{ marginTop: 8 }}>
        <AgTable<Certificate>
          columns={certificateColumns}
          data={filteredCertificates}
          statusTabs={[
            { key: "all", label: "All Credentials", count: certificates.length },
            { key: "active", label: "Active Verified", count: activeCount },
            { key: "revoked", label: "Revoked", count: revokedCount },
          ]}
          activeStatusTab={statusFilter}
          onStatusTabChange={(tab) => setStatusFilter(tab)}
          searchPlaceholder="Search by student name, certificate ID, course program..."
          searchAccessor={(c) =>
            `${c.studentNameSnapshot} ${c.certificateId} ${c.courseNameSnapshot} ${c.batchSnapshot ?? ""}`
          }
          initialPageSize={10}
          emptyMessage="No certificate credentials found."
          getRowId={(c) => c._id}
        />
      </section>
    </main>
  );
}
