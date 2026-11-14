"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  GraduationCap,
  Layers,
  MapPin,
  Share2,
  ShieldCheck,
  UserX,
} from "lucide-react";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";

type Profile = {
  studentId: string;
  fullName: string;
  profileImageUrl?: string | null;
  joiningDate?: string;
  completionDate?: string;
  certificates: Array<{
    certificateId: string;
    courseNameSnapshot: string;
    batchSnapshot: string;
    issueDate: string;
    verificationPath: string;
  }>;
};

export default function StudentProfilePage() {
  const { studentId } = useParams<{ studentId: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCertId, setCopiedCertId] = useState<string | null>(null);

  useEffect(() => {
    if (!studentId) return;
    setLoading(true);
    fetch(`/api/students/${studentId}`)
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error?.message ?? "Profile unavailable");
        return body.data.student;
      })
      .then((data) => {
        setProfile(data);
        setError("");
      })
      .catch((reason: Error) => {
        setError(reason.message);
        setProfile(null);
      })
      .finally(() => setLoading(false));
  }, [studentId]);

  const handleCopyProfile = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2200);
    }
  };

  const handleCopyCertId = (certId: string) => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(certId);
      setCopiedCertId(certId);
      setTimeout(() => setCopiedCertId(null), 2000);
    }
  };

  return (
    <>
      <Navbar activePage="students" />

      <main className="student-profile-page">
        <div className="students-container" style={{ maxWidth: 980 }}>
          {/* Back Link */}
          <Link href="/students" className="student-profile-back-link">
            <ArrowLeft size={16} />
            <span>Back to Student Directory</span>
          </Link>

          {/* Loading State */}
          {loading && <div className="student-skeleton-card" style={{ minHeight: 320 }} />}

          {/* Error / Not Found State */}
          {!loading && error && (
            <div className="student-empty-state">
              <div
                className="student-empty-icon"
                style={{ borderColor: "rgba(239, 68, 68, 0.4)", color: "#f87171" }}
              >
                <UserX size={34} />
              </div>
              <h2 className="student-empty-title">Profile Unavailable</h2>
              <p className="student-empty-text">
                {error || "This public student profile could not be found or has not been made public yet."}
              </p>
              <Link
                href="/students"
                className="student-reset-btn"
                style={{ textDecoration: "none", display: "inline-block" }}
              >
                Return to Student Directory
              </Link>
            </div>
          )}

          {/* Student Profile Content */}
          {!loading && profile && (
            <>
              {/* Profile Hero Card */}
              <section className="student-profile-hero-card">
                <div className="student-profile-hero-inner">
                  {/* Big Avatar */}
                  <div className="student-profile-hero-avatar">
                    {profile.profileImageUrl ? (
                      <img src={profile.profileImageUrl} alt={profile.fullName} />
                    ) : (
                      <span>{profile.fullName.slice(0, 2).toUpperCase()}</span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="student-profile-hero-info">
                    <div className="student-profile-badge">
                      <ShieldCheck size={13} />
                      <span>OFFICIALLY VERIFIED GRADUATE</span>
                    </div>

                    <h1 className="student-profile-name">{profile.fullName}</h1>
                    <p className="student-profile-id">Student ID: #{profile.studentId}</p>

                    <div className="student-profile-meta-chips">
                      {profile.joiningDate && (
                        <div className="student-profile-chip">
                          <Calendar size={13} />
                          <span>
                            Enrolled:{" "}
                            {new Date(profile.joiningDate).toLocaleDateString("en-IN", {
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      )}
                      {profile.completionDate && (
                        <div className="student-profile-chip">
                          <CheckCircle2 size={13} style={{ color: "#34d399" }} />
                          <span>
                            Graduated:{" "}
                            {new Date(profile.completionDate).toLocaleDateString("en-IN", {
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      )}
                      <div className="student-profile-chip">
                        <MapPin size={13} style={{ color: "#f59e0b" }} />
                        <span>Mathura Center (Offline Lab)</span>
                      </div>
                    </div>

                    {/* Share profile button */}
                    <button type="button" onClick={handleCopyProfile} className="student-profile-share-btn">
                      {copiedLink ? (
                        <>
                          <Check size={15} style={{ color: "#34d399" }} />
                          <span style={{ color: "#34d399" }}>Profile Link Copied!</span>
                        </>
                      ) : (
                        <>
                          <Share2 size={15} />
                          <span>Share Public Profile</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </section>

              {/* Active Certificates Section */}
              <section style={{ marginTop: 32 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 12,
                    marginBottom: 16,
                  }}
                >
                  <div>
                    <h2 className="student-certs-section-title">
                      <span>Verified Institutional Certificates</span>
                      <span className="student-certs-badge">{profile.certificates.length} Active</span>
                    </h2>
                    <p className="student-certs-section-sub">
                      Issued by The Elite Coding School upon completion of live teacher-led offline coursework
                      and capstone evaluation.
                    </p>
                  </div>
                </div>

                {profile.certificates.length === 0 ? (
                  <div className="student-empty-state" style={{ padding: 40 }}>
                    <GraduationCap
                      size={32}
                      style={{ color: "#c084fc", margin: "0 auto 12px", display: "block" }}
                    />
                    <p style={{ color: "#cbd5e1", margin: 0 }}>
                      No active public certificates currently issued for this profile.
                    </p>
                  </div>
                ) : (
                  <div>
                    {profile.certificates.map((cert) => (
                      <article key={cert.certificateId} className="student-cert-card">
                        <div className="student-cert-info">
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                            <Award size={18} style={{ color: "#f59e0b" }} />
                            <h3 className="student-cert-course">{cert.courseNameSnapshot}</h3>
                          </div>

                          <div className="student-cert-meta">
                            <span>
                              {cert.batchSnapshot} · Issued on{" "}
                              {new Date(cert.issueDate).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </div>

                          <div>
                            <span
                              className="student-cert-id-tag"
                              title="Click to copy Certificate ID"
                              onClick={() => handleCopyCertId(cert.certificateId)}
                              style={{ cursor: "pointer" }}
                            >
                              Certificate ID: #{cert.certificateId}
                              {copiedCertId === cert.certificateId ? (
                                <Check
                                  size={11}
                                  style={{ marginLeft: 5, color: "#34d399", display: "inline" }}
                                />
                              ) : (
                                <Copy size={11} style={{ marginLeft: 5, opacity: 0.7, display: "inline" }} />
                              )}
                            </span>
                          </div>
                        </div>

                        <div>
                          <Link href={cert.verificationPath} className="student-cert-btn">
                            <span>Verify Official Credential</span>
                            <ExternalLink size={15} />
                          </Link>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
