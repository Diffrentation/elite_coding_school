"use client";

import { FormEvent, useEffect, useState } from "react";
import { Receipt, CreditCard, Plus, FileText, CheckCircle2, AlertCircle, DollarSign, Calendar } from "lucide-react";

type Enrollment = {
  _id: string;
  courseTitleSnapshot: string;
  agreedMonthlyFee: number;
  studentId?: { fullName?: string; studentId?: string } | null;
};

type Invoice = {
  _id: string;
  month: string;
  dueAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: string;
  enrollmentId?: Enrollment | null;
};

type Payment = {
  _id: string;
  amount: number;
  method: string;
  paidAt: string;
  receiptNumber: string | null;
  enrollmentId?: Enrollment | null;
};

const request = async (url: string, init?: RequestInit) => {
  const response = await fetch(url, init);
  const body = await response.json();
  if (!response.ok) throw new Error(body.error?.message ?? "Request failed.");
  return body.data;
};

export function AdminFees() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);

  const load = () =>
    Promise.all([
      request("/api/admin/enrollments"),
      request("/api/admin/invoices"),
      request("/api/admin/payments"),
    ])
      .then(([enrollmentData, invoiceData, paymentData]) => {
        setEnrollments(enrollmentData.enrollments ?? []);
        setInvoices(invoiceData.invoices ?? []);
        setPayments(paymentData.payments ?? []);
      })
      .catch((reason: Error) => setError(reason.message));

  useEffect(() => {
    void load();
  }, []);

  async function createInvoice(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setProcessing(true);
    setMessage("");
    setError("");
    try {
      await request("/api/admin/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enrollmentId: form.get("enrollmentId"), month: form.get("month") }),
      });
      setMessage("Invoice created successfully. Any existing invoice for this month was safely updated.");
      void load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not create an invoice.");
    } finally {
      setProcessing(false);
    }
  }

  async function recordPayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setProcessing(true);
    setMessage("");
    setError("");
    try {
      await request("/api/admin/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceId: form.get("invoiceId"),
          amount: Number(form.get("amount")),
          method: form.get("method"),
          idempotencyKey: crypto.randomUUID(),
        }),
      });
      event.currentTarget.reset();
      setMessage("Payment recorded successfully. The invoice balance has been updated.");
      void load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not record the payment.");
    } finally {
      setProcessing(false);
    }
  }

  const currentMonth = new Date().toISOString().slice(0, 7);
  const outstandingTotal = invoices.reduce((sum, invoice) => sum + invoice.remainingAmount, 0);
  const collectedTotal = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const openInvoiceCount = invoices.filter((invoice) => invoice.remainingAmount > 0).length;

  return (
    <main className="portal-content admin-fees-page">
      <div style={{ marginBottom: 28 }}>
        <p className="kicker" style={{ color: "#38bdf8", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", fontSize: 11, margin: "0 0 6px" }}>
          ACCOUNTS & BILLING
        </p>
        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "28px", color: "#ffffff", margin: "0 0 8px" }}>
          Fees, Invoices & Receipts
        </h1>
        <p style={{ color: "#94a3b8", fontSize: "14px", margin: 0 }}>
          Generate monthly student invoices, log cash/UPI/bank payments, and generate official downloadable receipts.
        </p>
      </div>

      <section className="admin-workflow-summary admin-finance-summary" aria-label="Fee overview">
        <article>
          <span className="workflow-summary-icon purple"><FileText size={18} /></span>
          <div><small>Total invoices</small><strong>{invoices.length}</strong></div>
        </article>
        <article>
          <span className="workflow-summary-icon amber"><AlertCircle size={18} /></span>
          <div><small>Outstanding balance</small><strong>₹{outstandingTotal.toLocaleString("en-IN")}</strong><em>{openInvoiceCount} open invoice{openInvoiceCount === 1 ? "" : "s"}</em></div>
        </article>
        <article>
          <span className="workflow-summary-icon green"><DollarSign size={18} /></span>
          <div><small>Payments recorded</small><strong>₹{collectedTotal.toLocaleString("en-IN")}</strong><em>{payments.length} receipt{payments.length === 1 ? "" : "s"}</em></div>
        </article>
      </section>

      {message && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(16, 185, 129, 0.12)", border: "1px solid rgba(16, 185, 129, 0.3)", color: "#34d399", padding: "12px 18px", borderRadius: 10, marginBottom: 22, fontSize: 13.5 }}>
          <CheckCircle2 size={16} /> {message}
        </div>
      )}

      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(239, 68, 68, 0.12)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#fca5a5", padding: "12px 18px", borderRadius: 10, marginBottom: 22, fontSize: 13.5 }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Two Action Forms Side-by-Side */}
      <div className="admin-fees-forms-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))", gap: 20, marginBottom: 30 }}>
        {/* Form 1: Issue Monthly Invoice */}
        <div
          className="admin-fee-action-card"
          style={{
            background: "#0a0f32",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: 16,
            padding: 24,
            boxShadow: "0 14px 35px rgba(0, 0, 0, 0.35)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: "rgba(124, 58, 237, 0.18)", color: "#c084fc", display: "grid", placeItems: "center" }}>
              <FileText size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, color: "#ffffff", fontFamily: "var(--font-heading)" }}>
                Issue Monthly Invoice
              </h3>
              <span style={{ fontSize: 12, color: "#94a3b8" }}>Create billing record for active enrollment</span>
            </div>
          </div>

          <form onSubmit={createInvoice} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12.5, fontWeight: 600, color: "#cbd5e1" }}>
              Enrollment
              <select
                name="enrollmentId"
                required
                style={{
                  height: 42,
                  borderRadius: 10,
                  background: "#070b24",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  color: "#ffffff",
                  padding: "0 12px",
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                <option value="">Select an enrolled student</option>
                {enrollments.map((enrollment) => (
                  <option key={enrollment._id} value={enrollment._id}>
                    {enrollment.studentId?.fullName ?? "Student"} — {enrollment.courseTitleSnapshot}
                  </option>
                ))}
              </select>
            </label>

            <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12.5, fontWeight: 600, color: "#cbd5e1" }}>
              Billing Month
              <input
                name="month"
                type="month"
                required
                defaultValue={currentMonth}
                style={{
                  height: 42,
                  borderRadius: 10,
                  background: "#070b24",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  color: "#ffffff",
                  padding: "0 14px",
                  fontSize: 13,
                }}
              />
            </label>

            <button
              type="submit"
              disabled={processing}
              style={{
                marginTop: 6,
                height: 42,
                borderRadius: 10,
                background: "linear-gradient(135deg, #7c3aed, #9333ea)",
                color: "#ffffff",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                fontSize: 13.5,
                fontWeight: 700,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <Plus size={16} /> {processing ? "Generating..." : "Generate Invoice"}
            </button>
          </form>
        </div>

        {/* Form 2: Record Payment */}
        <div
          className="admin-fee-action-card"
          style={{
            background: "#0a0f32",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: 16,
            padding: 24,
            boxShadow: "0 14px 35px rgba(0, 0, 0, 0.35)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: "rgba(16, 185, 129, 0.18)", color: "#34d399", display: "grid", placeItems: "center" }}>
              <CreditCard size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, color: "#ffffff", fontFamily: "var(--font-heading)" }}>
                Record Fee Payment
              </h3>
              <span style={{ fontSize: 12, color: "#94a3b8" }}>Log an offline or UPI payment received</span>
            </div>
          </div>

          <form onSubmit={recordPayment} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12.5, fontWeight: 600, color: "#cbd5e1" }}>
              Open Invoice
              <select
                name="invoiceId"
                required
                style={{
                  height: 42,
                  borderRadius: 10,
                  background: "#070b24",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  color: "#ffffff",
                  padding: "0 12px",
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                <option value="">Select an outstanding invoice</option>
                {invoices
                  .filter((invoice) => invoice.remainingAmount > 0)
                  .map((invoice) => (
                    <option key={invoice._id} value={invoice._id}>
                      {invoice.enrollmentId?.studentId?.fullName ?? "Student"} — {invoice.month} (₹
                      {invoice.remainingAmount.toLocaleString("en-IN")} pending)
                    </option>
                  ))}
              </select>
            </label>

            <div
              className="admin-payment-fields"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: 12,
                minWidth: 0,
              }}
            >
              <label style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0, fontSize: 12.5, fontWeight: 600, color: "#cbd5e1" }}>
                Amount (₹)
                <input
                  name="amount"
                  type="number"
                  min="1"
                  required
                  placeholder="e.g. 5000"
                  style={{
                    width: "100%",
                    minWidth: 0,
                    boxSizing: "border-box",
                    height: 42,
                    borderRadius: 10,
                    background: "#070b24",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    color: "#ffffff",
                    padding: "0 14px",
                    fontSize: 13,
                  }}
                />
              </label>

              <label style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0, fontSize: 12.5, fontWeight: 600, color: "#cbd5e1" }}>
                Payment Method
                <select
                  name="method"
                  defaultValue="upi"
                  style={{
                    width: "100%",
                    minWidth: 0,
                    boxSizing: "border-box",
                    height: 42,
                    borderRadius: 10,
                    background: "#070b24",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    color: "#ffffff",
                    padding: "0 12px",
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  <option value="upi">UPI (GPay/PhonePe)</option>
                  <option value="cash">Cash in Person</option>
                  <option value="bank">Bank Transfer (NEFT/IMPS)</option>
                </select>
              </label>
            </div>

            <button
              type="submit"
              disabled={processing}
              style={{
                marginTop: 6,
                height: 42,
                borderRadius: 10,
                background: "linear-gradient(135deg, #10b981, #059669)",
                color: "#ffffff",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                fontSize: 13.5,
                fontWeight: 700,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <CreditCard size={16} /> {processing ? "Recording..." : "Record Payment & Update Invoice"}
            </button>
          </form>
        </div>
      </div>

      {/* Two Data Lists: Invoices and Recent Payments */}
      <div className="admin-fees-data-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(480px, 1fr))", gap: 24 }}>
        {/* Card: Invoices */}
        <section
          className="admin-fees-data-card"
          style={{
            background: "#0a0f32",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: 16,
            overflow: "hidden",
            boxShadow: "0 14px 35px rgba(0, 0, 0, 0.35)",
          }}
        >
          <div
            style={{
              padding: "18px 24px",
              borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h3 style={{ margin: 0, fontSize: 16, color: "#ffffff", fontFamily: "var(--font-heading)" }}>
              Student Invoices
            </h3>
            <span style={{ fontSize: 12, color: "#94a3b8" }}>{invoices.length} Invoices</span>
          </div>

          {invoices.length > 0 ? (
            <div>
              {invoices.map((invoice) => (
                <div
                  className="admin-fee-list-row"
                  key={invoice._id}
                  style={{
                    padding: "16px 24px",
                    borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                    display: "grid",
                    gridTemplateColumns: "1.2fr 0.8fr 0.8fr auto",
                    alignItems: "center",
                    gap: 14,
                  }}
                >
                  <div>
                    <b style={{ color: "#ffffff", fontSize: 13.5, display: "block" }}>
                      {invoice.enrollmentId?.studentId?.fullName ?? "Student"}
                    </b>
                    <small style={{ color: "#94a3b8", fontSize: 11 }}>
                      {invoice.enrollmentId?.courseTitleSnapshot ?? "Course"} · {invoice.month}
                    </small>
                  </div>

                  <div>
                    <span style={{ color: "#94a3b8", fontSize: 10, textTransform: "uppercase", fontWeight: 700, display: "block" }}>Due</span>
                    <b style={{ color: "#e2e8f0", fontSize: 13, fontFamily: "var(--font-mono)" }}>
                      ₹{invoice.dueAmount.toLocaleString("en-IN")}
                    </b>
                  </div>

                  <div>
                    <span style={{ color: "#94a3b8", fontSize: 10, textTransform: "uppercase", fontWeight: 700, display: "block" }}>Pending</span>
                    <b style={{ color: invoice.remainingAmount > 0 ? "#fbbf24" : "#34d399", fontSize: 13, fontFamily: "var(--font-mono)" }}>
                      ₹{invoice.remainingAmount.toLocaleString("en-IN")}
                    </b>
                  </div>

                  <div>
                    <span
                      style={{
                        fontSize: 10.5,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        padding: "3px 8px",
                        borderRadius: 5,
                        background: invoice.status === "paid" ? "rgba(16, 185, 129, 0.15)" : "rgba(245, 158, 11, 0.15)",
                        color: invoice.status === "paid" ? "#34d399" : "#fbbf24",
                        border: `1px solid ${invoice.status === "paid" ? "rgba(16, 185, 129, 0.3)" : "rgba(245, 158, 11, 0.3)"}`,
                      }}
                    >
                      {invoice.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: "32px 24px", textAlign: "center", color: "#64748b", fontSize: 13 }}>
              No invoices issued yet.
            </div>
          )}
        </section>

        {/* Card: Recent Payments */}
        <section
          className="admin-fees-data-card"
          style={{
            background: "#0a0f32",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: 16,
            overflow: "hidden",
            boxShadow: "0 14px 35px rgba(0, 0, 0, 0.35)",
          }}
        >
          <div
            style={{
              padding: "18px 24px",
              borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h3 style={{ margin: 0, fontSize: 16, color: "#ffffff", fontFamily: "var(--font-heading)" }}>
              Recent Payments & Receipts
            </h3>
            <span style={{ fontSize: 12, color: "#94a3b8" }}>{payments.length} Payments</span>
          </div>

          {payments.length > 0 ? (
            <div>
              {payments.map((payment) => (
                <div
                  className="admin-fee-list-row"
                  key={payment._id}
                  style={{
                    padding: "16px 24px",
                    borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                    display: "grid",
                    gridTemplateColumns: "1.2fr 0.8fr 0.8fr auto",
                    alignItems: "center",
                    gap: 14,
                  }}
                >
                  <div>
                    <b style={{ color: "#ffffff", fontSize: 13.5, display: "block" }}>
                      {payment.enrollmentId?.studentId?.fullName ?? "Student"}
                    </b>
                    <small style={{ color: "#94a3b8", fontSize: 11 }}>
                      {payment.enrollmentId?.courseTitleSnapshot ?? "Course"}
                    </small>
                  </div>

                  <div>
                    <span style={{ color: "#94a3b8", fontSize: 10, textTransform: "uppercase", fontWeight: 700, display: "block" }}>Paid</span>
                    <b style={{ color: "#34d399", fontSize: 13, fontFamily: "var(--font-mono)" }}>
                      ₹{payment.amount.toLocaleString("en-IN")}
                    </b>
                  </div>

                  <div>
                    <span style={{ color: "#94a3b8", fontSize: 10, textTransform: "uppercase", fontWeight: 700, display: "block" }}>Method</span>
                    <span style={{ color: "#cbd5e1", fontSize: 12, fontWeight: 600, textTransform: "uppercase" }}>
                      {payment.method}
                    </span>
                  </div>

                  <div>
                    <a
                      href={`/api/admin/payments/${payment._id}/receipt`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        padding: "5px 12px",
                        borderRadius: 6,
                        background: "rgba(133, 41, 244, 0.15)",
                        border: "1px solid rgba(133, 41, 244, 0.35)",
                        color: "#c084fc",
                        fontSize: 11.5,
                        fontWeight: 600,
                        textDecoration: "none",
                      }}
                    >
                      <Receipt size={13} /> {payment.receiptNumber ? "Receipt PDF" : "Get Receipt"}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: "32px 24px", textAlign: "center", color: "#64748b", fontSize: 13 }}>
              No payments recorded yet.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
