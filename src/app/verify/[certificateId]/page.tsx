"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Download,
  XCircle,
  ShieldCheck,
  Copy,
  Check,
  ExternalLink,
  Calendar,
  BookOpen,
  User,
  Award,
  Printer,
  Sparkles,
  AlertTriangle,
  FileText,
  Lock,
  Layers,
  GraduationCap,
} from "lucide-react";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";

type Certificate = {
  certificateId: string;
  status: "active" | "revoked";
  studentName: string;
  courseName: string;
  batch: string;
  joiningDate: string;
  completionDate: string;
  issueDate: string;
  templateUrl: string;
  verificationPath: string;
  student?: {
    studentId?: string;
    profileImageUrl?: string | null;
  } | null;
};

export default function VerifyCertificatePage() {
  const { certificateId } = useParams<{ certificateId: string }>();
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // The public inspection view deliberately uses the exact PDF generator that
  // creates the downloadable credential. Keeping one rendering source avoids
  // mismatches in the QR, certificate ID, dates, fonts, and founder block.
  const [activeTab] = useState<"visual" | "pdf">("pdf");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!certificateId) return;
    setLoading(true);
    fetch(`/api/verify/${certificateId}`)
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) {
          throw new Error(body.error?.message ?? "Certificate unavailable or not found.");
        }
        return body.data.certificate;
      })
      .then((data: Certificate) => {
        setCertificate(data);
        setError("");
      })
      .catch((reason: Error) => {
        setError(reason.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [certificateId]);

  const active = certificate?.status === "active";

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <>
      <Navbar />
      <main
        style={{
          minHeight: "85vh",
          background: "radial-gradient(ellipse at 50% 0%, #151a4a 0%, #06091e 70%)",
          padding: "110px max(16px, 6vw) 70px",
          color: "#f1f5f9",
          fontFamily: "var(--font-body), sans-serif",
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          {/* 1. LOADING STATE */}
          {loading && (
            <div
              style={{
                textAlign: "center",
                padding: "80px 20px",
                background: "#0a0f32",
                borderRadius: 16,
                border: "1px solid rgba(255, 255, 255, 0.08)",
              }}
            >
              <div
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: "50%",
                  border: "3px solid rgba(168, 85, 247, 0.2)",
                  borderTopColor: "#a855f7",
                  margin: "0 auto 16px",
                  animation: "spin 1s linear infinite",
                }}
              />
              <p style={{ color: "#cbd5e1", fontSize: 15, margin: 0 }}>
                Authenticating credential against institutional registry...
              </p>
            </div>
          )}

          {/* 2. ERROR STATE (NOT FOUND / INVALID) */}
          {!loading && error && (
            <section
              style={{
                background: "linear-gradient(135deg, rgba(239, 68, 68, 0.12), rgba(15, 23, 42, 0.95))",
                border: "1px solid rgba(239, 68, 68, 0.35)",
                borderRadius: 18,
                padding: "40px 32px",
                textAlign: "center",
                boxShadow: "0 20px 50px rgba(0, 0, 0, 0.6)",
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  background: "rgba(239, 68, 68, 0.15)",
                  color: "#f87171",
                  display: "grid",
                  placeItems: "center",
                  margin: "0 auto 18px",
                }}
              >
                <XCircle size={36} />
              </div>
              <h1 style={{ fontSize: 24, margin: "0 0 10px", color: "#ffffff" }}>
                Credential Verification Failed
              </h1>
              <p style={{ color: "#94a3b8", fontSize: 14.5, maxWidth: 480, margin: "0 auto 24px" }}>
                {error}
              </p>
              <a
                href="/courses"
                className="button secondary"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 22px",
                  borderRadius: 10,
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(255, 255, 255, 0.16)",
                  color: "#ffffff",
                  textDecoration: "none",
                  fontWeight: 600,
                  fontSize: 13.5,
                }}
              >
                Explore Accredited Courses
              </a>
            </section>
          )}

          {/* 3. VERIFIED / REVOKED CERTIFICATE PRESENTATION */}
          {!loading && certificate && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {/* TOP STATUS HERO BANNER */}
              <section
                style={{
                  background: active
                    ? "linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(10, 15, 50, 0.9) 100%)"
                    : "linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(10, 15, 50, 0.9) 100%)",
                  border: `1px solid ${active ? "rgba(16, 185, 129, 0.4)" : "rgba(239, 68, 68, 0.4)"}`,
                  borderRadius: 18,
                  padding: "24px 28px",
                  boxShadow: active
                    ? "0 12px 40px rgba(16, 185, 129, 0.12)"
                    : "0 12px 40px rgba(239, 68, 68, 0.12)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 20,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 14,
                      background: active ? "rgba(16, 185, 129, 0.18)" : "rgba(239, 68, 68, 0.18)",
                      border: `1px solid ${active ? "rgba(16, 185, 129, 0.4)" : "rgba(239, 68, 68, 0.4)"}`,
                      color: active ? "#34d399" : "#f87171",
                      display: "grid",
                      placeItems: "center",
                      flexShrink: 0,
                    }}
                  >
                    {active ? <ShieldCheck size={32} /> : <AlertTriangle size={32} />}
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 800,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          padding: "3px 10px",
                          borderRadius: 6,
                          background: active ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)",
                          color: active ? "#34d399" : "#f87171",
                          border: `1px solid ${active ? "rgba(16, 185, 129, 0.35)" : "rgba(239, 68, 68, 0.35)"}`,
                        }}
                      >
                        ● {active ? "OFFICIALLY VERIFIED & ACTIVE" : "CREDENTIAL REVOKED"}
                      </span>
                      <span style={{ fontSize: 12, color: "#94a3b8" }}>The Elite Coding School Registry</span>
                    </div>
                    <h1
                      style={{
                        margin: "6px 0 2px",
                        fontSize: "clamp(20px, 3vw, 28px)",
                        color: "#ffffff",
                        fontWeight: 800,
                        letterSpacing: "0.01em",
                      }}
                    >
                      {certificate.certificateId}
                    </h1>
                    <p style={{ margin: 0, fontSize: 13, color: "#cbd5e1" }}>
                      {active
                        ? "This verifiable credential is authenticated, tamper-proof, and recorded in the institutional database."
                        : "This certificate has been officially revoked by the institute and is no longer valid."}
                    </p>
                  </div>
                </div>

                {/* Top Action Toolbar */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "9px 15px",
                      borderRadius: 9,
                      background: "rgba(255, 255, 255, 0.06)",
                      border: "1px solid rgba(255, 255, 255, 0.14)",
                      color: copied ? "#34d399" : "#cbd5e1",
                      fontSize: 12.5,
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copied ? "Link Copied!" : "Copy Verification URL"}</span>
                  </button>

                  {active && (
                    <a
                      href={`/api/verify/${certificate.certificateId}/pdf`}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 7,
                        padding: "9px 18px",
                        borderRadius: 9,
                        background: "linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        color: "#ffffff",
                        fontSize: 13,
                        fontWeight: 600,
                        textDecoration: "none",
                        boxShadow: "0 4px 16px rgba(124, 58, 237, 0.4)",
                        cursor: "pointer",
                      }}
                    >
                      <Download size={15} />
                      <span>Download Official PDF</span>
                    </a>
                  )}
                </div>
              </section>

              {/* 4. THE CERTIFICATE PHOTO / VISUAL CANVAS DISPLAY */}
              <section
                style={{
                  background: "#080d2d",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: 20,
                  padding: "24px",
                  boxShadow: "0 24px 60px rgba(0, 0, 0, 0.55)",
                }}
              >
                {/* Header Switcher Toolbar */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 12,
                    marginBottom: 20,
                    paddingBottom: 16,
                    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: "rgba(168, 85, 247, 0.15)",
                        color: "#c084fc",
                        display: "grid",
                        placeItems: "center",
                      }}
                    >
                      <Award size={18} />
                    </div>
                    <div>
                      <h2 style={{ margin: 0, fontSize: 16, color: "#ffffff", fontWeight: 700 }}>
                        Official Certificate Inspection
                      </h2>
                      <span style={{ fontSize: 12, color: "#94a3b8" }}>
                        A4 Landscape High-Resolution Security Preview
                      </span>
                    </div>
                  </div>

                  {/* The same print-ready document is used for on-screen preview and download. */}
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 7,
                      background: "rgba(0, 0, 0, 0.4)",
                      padding: "7px 12px",
                      borderRadius: 10,
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      color: "#c4b5fd",
                      fontWeight: 700,
                      fontSize: 12,
                    }}
                  >
                    <FileText size={14} />
                    <span>Official print-ready PDF preview</span>
                  </div>
                </div>

                {/* THE CERTIFICATE CANVAS / CONTAINER */}
                {activeTab === "visual" ? (
                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      maxWidth: 960,
                      margin: "0 auto",
                      aspectRatio: "297 / 210",
                      background: "#ffffff",
                      borderRadius: 14,
                      overflow: "hidden",
                      boxShadow: "0 24px 60px rgba(0, 0, 0, 0.7), 0 0 40px rgba(124, 58, 237, 0.15)",
                      border: "2px solid rgba(212, 175, 55, 0.55)",
                    }}
                  >
                    {/* Official Template Artwork */}
                    <img
                      src={certificate.templateUrl || "/certificates/elite-certificate-template-v3.png"}
                      alt={`Certificate for ${certificate.studentName}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />

                    {/* Single Crisp Verified Certificate Data Overlay */}
                    <div className="verified-certificate-overlay" aria-hidden="true">
                      <div className="verified-certificate-motto">
                        <span>Learn</span>
                        <span className="verified-certificate-motto-pipe">|</span>
                        <span>Build</span>
                        <span className="verified-certificate-motto-pipe">|</span>
                        <span>Practice</span>
                        <span className="verified-certificate-motto-pipe">|</span>
                        <span>Grow</span>
                      </div>
                      <div className="verified-certificate-name">{certificate.studentName}</div>
                      <div className="verified-certificate-achievement">
                        <p>has successfully completed the</p>
                        <h3>{certificate.courseName}</h3>
                        <p>
                          at The Elite Coding School, demonstrating practical skills in building real-world
                          projects.
                        </p>
                      </div>
                      <div className="verified-certificate-qr">
                        <img src={`/api/verify/${encodeURIComponent(certificate.certificateId)}/qr`} alt="" />
                      </div>
                      <div className="verified-certificate-id">
                        <span>Certificate ID</span>
                        <strong>{certificate.certificateId}</strong>
                      </div>
                      <div className="verified-certificate-date">
                        <span>Issued On</span>
                        <strong>
                          {new Date(certificate.issueDate).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </strong>
                      </div>
                      <div className="verified-certificate-seal">
                        <span style={{ color: "#f3d078", fontSize: "1.15em", lineHeight: 1 }}>★</span>
                        <span>OFFICIAL VERIFIED CREDENTIAL</span>
                        <span style={{ color: "#f3d078", fontSize: "1.15em", lineHeight: 1 }}>★</span>
                      </div>
                      <div className="verified-certificate-signature">
                        <img
                          src="/certificates/bhupendra-singh-signature.svg"
                          alt="Bhupendra Singh Signature"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  /* LIVE VECTOR PDF IFRAME PREVIEW */
                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      maxWidth: 960,
                      margin: "0 auto",
                      aspectRatio: "297 / 210",
                      background: "#070b24",
                      borderRadius: 14,
                      overflow: "hidden",
                      boxShadow: "0 24px 60px rgba(0, 0, 0, 0.7)",
                      border: "1px solid rgba(255, 255, 255, 0.14)",
                    }}
                  >
                    <iframe
                      src={`/api/verify/${certificate.certificateId}/pdf#toolbar=0&view=FitH`}
                      title={`Official PDF Certificate for ${certificate.studentName}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        border: "none",
                        display: "block",
                      }}
                    />
                  </div>
                )}

                {/* Subtext info under the certificate */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 12,
                    marginTop: 18,
                    padding: "12px 16px",
                    background: "rgba(0, 0, 0, 0.25)",
                    borderRadius: 10,
                    border: "1px solid rgba(255, 255, 255, 0.06)",
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8, color: "#94a3b8", fontSize: 12 }}
                  >
                    <Lock size={14} color="#34d399" />
                    <span>
                      Cryptographically generated vector document with embedded verification URL and
                      anti-tamper watermark.
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <a
                      href={`/api/verify/${certificate.certificateId}/pdf`}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        color: "#38bdf8",
                        fontSize: 12.5,
                        fontWeight: 600,
                        textDecoration: "none",
                      }}
                    >
                      <ExternalLink size={13} />
                      <span>Open Fullscreen PDF</span>
                    </a>
                  </div>
                </div>
              </section>

              {/* 5. VERIFIED METADATA & RECIPIENT DOSSIER (4 CARDS) */}
              <section
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                  gap: 16,
                }}
              >
                {/* Card 1: Recipient Student */}
                <div
                  style={{
                    background: "#080d2d",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: 14,
                    padding: "18px 20px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      color: "#c084fc",
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    <User size={15} />
                    <span>STUDENT RECIPIENT</span>
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 18, color: "#ffffff", fontWeight: 700 }}>
                      {certificate.studentName}
                    </h3>
                    {certificate.student?.studentId && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          flexWrap: "wrap",
                          marginTop: 4,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 12,
                            color: "#94a3b8",
                            fontFamily: "var(--font-mono)",
                          }}
                        >
                          Enrollment ID: #{certificate.student.studentId}
                        </span>
                        <Link
                          href={`/students/${certificate.student.studentId}`}
                          style={{
                            fontSize: 11.5,
                            color: "#38bdf8",
                            textDecoration: "none",
                            fontWeight: 600,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 3,
                          }}
                        >
                          <span>View Public Profile</span>
                          <ArrowRight size={11} />
                        </Link>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card 2: Course & Cohort */}
                <div
                  style={{
                    background: "#080d2d",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: 14,
                    padding: "18px 20px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      color: "#38bdf8",
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    <BookOpen size={15} />
                    <span>PROGRAM &amp; CURRICULUM</span>
                  </div>
                  <div>
                    <h3
                      style={{ margin: 0, fontSize: 15, color: "#ffffff", fontWeight: 700, lineHeight: 1.3 }}
                    >
                      {certificate.courseName}
                    </h3>
                    <span
                      style={{
                        fontSize: 11.5,
                        color: "#38bdf8",
                        background: "rgba(56, 189, 248, 0.12)",
                        padding: "2px 8px",
                        borderRadius: 5,
                        display: "inline-block",
                        marginTop: 6,
                      }}
                    >
                      {certificate.batch || "Offline Tech Lab"}
                    </span>
                  </div>
                </div>

                {/* Card 3: Timeline & Dates */}
                <div
                  style={{
                    background: "#080d2d",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: 14,
                    padding: "18px 20px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      color: "#34d399",
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    <Calendar size={15} />
                    <span>TIMELINE &amp; DATES</span>
                  </div>
                  <div
                    style={{
                      fontSize: 12.5,
                      color: "#cbd5e1",
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                    }}
                  >
                    <div>
                      <span style={{ color: "#94a3b8" }}>Joined: </span>
                      <strong>{new Date(certificate.joiningDate).toLocaleDateString("en-IN")}</strong>
                    </div>
                    <div>
                      <span style={{ color: "#94a3b8" }}>Completed: </span>
                      <strong>{new Date(certificate.completionDate).toLocaleDateString("en-IN")}</strong>
                    </div>
                    <div>
                      <span style={{ color: "#94a3b8" }}>Issued: </span>
                      <strong style={{ color: "#34d399" }}>
                        {new Date(certificate.issueDate).toLocaleDateString("en-IN")}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Card 4: Institution & Security */}
                <div
                  style={{
                    background: "#080d2d",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: 14,
                    padding: "18px 20px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      color: "#fbbf24",
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    <ShieldCheck size={15} />
                    <span>SECURITY &amp; AUTHORITY</span>
                  </div>
                  <div>
                    <strong style={{ fontSize: 13.5, color: "#ffffff", display: "block" }}>
                      The Elite Coding School
                    </strong>
                    <span style={{ fontSize: 12, color: "#94a3b8", display: "block", marginTop: 2 }}>
                      Verified Offline Center Registry
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 11,
                        color: "#a855f7",
                        display: "block",
                        marginTop: 4,
                      }}
                    >
                      ID: #{certificate.certificateId}
                    </span>
                  </div>
                </div>
              </section>

              {/* BOTTOM DOWNLOAD CTA BANNER */}
              {active && (
                <div
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(124, 58, 237, 0.15) 0%, rgba(56, 189, 248, 0.08) 100%)",
                    border: "1px solid rgba(168, 85, 247, 0.25)",
                    borderRadius: 16,
                    padding: "20px 24px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 16,
                  }}
                >
                  <div>
                    <h4 style={{ margin: 0, fontSize: 16, color: "#ffffff" }}>
                      Need an official copy for job applications or LinkedIn?
                    </h4>
                    <p style={{ margin: "3px 0 0", fontSize: 13, color: "#cbd5e1" }}>
                      Download the high-resolution vector PDF with verified signature and institutional seals.
                    </p>
                  </div>
                  <a
                    href={`/api/verify/${certificate.certificateId}/pdf`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "11px 22px",
                      borderRadius: 10,
                      background: "linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)",
                      color: "#ffffff",
                      fontSize: 13.5,
                      fontWeight: 700,
                      textDecoration: "none",
                      boxShadow: "0 4px 18px rgba(124, 58, 237, 0.4)",
                    }}
                  >
                    <Download size={16} />
                    <span>Download Official PDF</span>
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
