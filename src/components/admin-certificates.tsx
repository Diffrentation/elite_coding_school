"use client";

import { FormEvent, useEffect, useState } from "react";
import { Award, Ban, Download, ExternalLink, FileCheck2, ImageIcon, Printer } from "lucide-react";
import { ImagePickerInput } from "@/components/image-picker-input";

type Enrollment = { _id: string; courseTitleSnapshot: string; batch: string; joiningDate: string; status: string; studentId?: { fullName?: string; studentId?: string } };
type Certificate = { _id: string; certificateId: string; studentNameSnapshot: string; courseNameSnapshot: string; issueDate: string; status: "active" | "revoked"; verificationPath: string; studentId?: { profileImageUrl?: string | null } };
type Template = { _id: string; name: string; imageUrl: string };

const request = async (url: string, init?: RequestInit) => {
  const response = await fetch(url, init);
  const body = await response.json();
  if (!response.ok || !body.success) throw new Error(body.error?.message ?? "Request failed.");
  return body.data;
};

export function AdminCertificates() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [template, setTemplate] = useState<Template | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = () => Promise.all([request("/api/admin/certificates"), request("/api/admin/enrollments"), request("/api/admin/certificate-template")])
    .then(([certificateData, enrollmentData, templateData]) => {
      setCertificates(certificateData.certificates ?? []);
      setEnrollments((enrollmentData.enrollments ?? []).filter((item: Enrollment) => item.status === "completed"));
      setTemplate(templateData.template ?? null);
    })
    .catch((reason: Error) => setError(reason.message));

  useEffect(() => { void load(); }, []);

  async function saveTemplate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setMessage(""); setError("");
    const form = new FormData(event.currentTarget);
    try {
      await request("/api/admin/certificate-template", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: form.get("name"), imageUrl: form.get("imageUrl") }) });
      setMessage("Certificate template saved and activated."); await load();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not save template."); }
    finally { setBusy(false); }
  }

  async function issue(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage(""); setError("");
    const form = new FormData(event.currentTarget);
    try {
      const data = await request("/api/admin/certificates", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ enrollmentId: form.get("enrollmentId"), issueDate: form.get("issueDate") }) });
      setMessage(`Certificate ${data.certificate.certificateId} issued successfully.`); await load();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not issue certificate."); }
    finally { setBusy(false); }
  }

  async function revoke(certificate: Certificate) {
    const reason = window.prompt(`Revoke ${certificate.certificateId}. Enter a reason:`);
    if (!reason) return;
    setBusy(true); setError("");
    try { await request(`/api/admin/certificates/${certificate._id}/revoke`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reason }) }); setMessage("Certificate revoked."); await load(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Could not revoke certificate."); }
    finally { setBusy(false); }
  }

  return <main className="portal-content" style={{ maxWidth: 1200 }}>
    <div className="portal-intro"><div><p className="kicker">CREDENTIAL MANAGEMENT</p><h2>Certificates & Verification</h2><p>Issue verifiable certificates only after a course is completed. Contact details stay private.</p></div></div>
    {message && <p className="form-success">{message}</p>}{error && <p className="form-error">{error}</p>}
    <section className="admin-enrollment-requests-card" style={{ marginBottom: 20 }}>
      <h3><ImageIcon size={18} /> Certificate Template</h3><p>Upload the original certificate artwork unchanged. It is used as the A4 landscape PDF background.</p>
      <form onSubmit={saveTemplate} className="admin-direct-enrollment-form">
        <label>Template name<input name="name" required defaultValue={template?.name ?? "Elite Coding School Certificate"} /></label>
        <ImagePickerInput label="Original certificate background" name="imageUrl" folder="certificates" defaultValue={template?.imageUrl ?? null} helperText="Use the original high-resolution JPG or PNG. It will not be redesigned." />
        <button className="button primary" disabled={busy} type="submit">Save active template</button>
      </form>
    </section>
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1.4fr)", gap: 20, alignItems: "start" }}>
      <section className="admin-direct-enrollment-card"><div className="admin-enrollment-section-header"><div><Award size={20} /><h3>Issue Certificate</h3><p>Select only a completed enrollment. Certificate IDs are allocated on the server.</p></div></div>
        <form className="admin-direct-enrollment-form" onSubmit={issue}>
          <label>Completed enrollment<select name="enrollmentId" required defaultValue=""><option value="" disabled>Select completed student</option>{enrollments.map((item) => <option value={item._id} key={item._id}>{item.studentId?.fullName ?? "Student"} — {item.courseTitleSnapshot} · {item.batch}</option>)}</select></label>
          <label>Issue date<input name="issueDate" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} /></label>
          <button className="button primary" disabled={busy || !template || !enrollments.length} type="submit"><FileCheck2 size={16} /> Issue verified certificate</button>
          {!template && <small className="field-error">Upload the original template before issuing.</small>}
        </form>
      </section>
      <section className="admin-enrollment-requests-card"><div className="admin-enrollment-section-header"><div><h3>Issued Certificates</h3><p>{certificates.length} certificate records</p></div></div>
        <div style={{ display: "grid", gap: 10 }}>{certificates.map((certificate) => <article key={certificate._id} style={{ border: "1px solid rgba(148,163,184,.2)", borderRadius: 12, padding: 14, display: "flex", gap: 12, justifyContent: "space-between", alignItems: "center" }}><div><b>{certificate.studentNameSnapshot}</b><small style={{ display: "block", color: "#94a3b8" }}>{certificate.courseNameSnapshot} · {certificate.certificateId}</small><small style={{ color: certificate.status === "active" ? "#34d399" : "#fca5a5" }}>{certificate.status.toUpperCase()} · {new Date(certificate.issueDate).toLocaleDateString("en-IN")}</small></div><div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}><a className="button" href={`/api/admin/certificates/${certificate._id}/pdf`} target="_blank" rel="noreferrer"><Download size={14} /> PDF</a><a className="button" href={certificate.verificationPath} target="_blank" rel="noreferrer"><ExternalLink size={14} /> Verify</a>{certificate.status === "active" && <button className="button danger" disabled={busy} onClick={() => void revoke(certificate)}><Ban size={14} /> Revoke</button>}</div></article>)}{!certificates.length && <p className="empty-state">No certificates issued yet.</p>}</div>
      </section>
    </div>
  </main>;
}
