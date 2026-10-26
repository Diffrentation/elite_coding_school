"use client";

import { FormEvent, useEffect, useState } from "react";

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
      .catch((reason: Error) => setMessage(reason.message));

  useEffect(() => {
    void load();
  }, []);

  async function createInvoice(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setProcessing(true);
    setMessage("");
    try {
      await request("/api/admin/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enrollmentId: form.get("enrollmentId"), month: form.get("month") }),
      });
      setMessage("Invoice is ready. Existing invoices for that month were reused safely.");
      void load();
    } catch (reason) {
      setMessage(reason instanceof Error ? reason.message : "Could not create an invoice.");
    } finally {
      setProcessing(false);
    }
  }

  async function recordPayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setProcessing(true);
    setMessage("");
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
      setMessage("Payment recorded. The invoice balance has been updated.");
      void load();
    } catch (reason) {
      setMessage(reason instanceof Error ? reason.message : "Could not record the payment.");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <main className="portal-content admin-fees">
      <div className="portal-intro">
        <div>
          <p className="kicker">FEE MANAGEMENT</p>
          <h2>Invoices and offline payments.</h2>
          <p>Issue a monthly invoice, record cash/UPI/bank payments, and retain a receipt-ready ledger.</p>
        </div>
      </div>
      {message && <p className="form-success">{message}</p>}

      <div className="fee-forms">
        <form className="course-form" onSubmit={createInvoice}>
          <h3 className="form-wide">Issue monthly invoice</h3>
          <label className="form-wide">
            Enrollment
            <select name="enrollmentId" required>
              <option value="">Select an enrollment</option>
              {enrollments.map((enrollment) => (
                <option key={enrollment._id} value={enrollment._id}>
                  {enrollment.studentId?.fullName ?? "Student"} — {enrollment.courseTitleSnapshot}
                </option>
              ))}
            </select>
          </label>
          <label className="form-wide">
            Billing month
            <input name="month" type="month" required />
          </label>
          <button className="button primary admin-action" disabled={processing}>
            Issue invoice
          </button>
        </form>

        <form className="course-form" onSubmit={recordPayment}>
          <h3 className="form-wide">Record a payment</h3>
          <label className="form-wide">
            Open invoice
            <select name="invoiceId" required>
              <option value="">Select an invoice</option>
              {invoices
                .filter((invoice) => invoice.remainingAmount > 0)
                .map((invoice) => (
                  <option key={invoice._id} value={invoice._id}>
                    {invoice.enrollmentId?.studentId?.fullName ?? "Student"} — {invoice.month} (Rs.{" "}
                    {invoice.remainingAmount.toLocaleString("en-IN")} remaining)
                  </option>
                ))}
            </select>
          </label>
          <label>
            Amount received
            <input name="amount" type="number" min="1" required />
          </label>
          <label>
            Method
            <select name="method" defaultValue="upi">
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
              <option value="bank">Bank transfer</option>
            </select>
          </label>
          <button className="button primary admin-action" disabled={processing}>
            Record payment
          </button>
        </form>
      </div>

      <section className="fee-card-list" aria-label="Invoices">
        <h3>Invoices</h3>
        {invoices.map((invoice) => (
          <article key={invoice._id}>
            <div>
              <b>{invoice.enrollmentId?.studentId?.fullName ?? "Student"}</b>
              <small>
                {invoice.enrollmentId?.courseTitleSnapshot ?? "Course"} · {invoice.month}
              </small>
            </div>
            <div>
              <small>Due</small>
              <b>Rs. {invoice.dueAmount.toLocaleString("en-IN")}</b>
            </div>
            <div>
              <small>Remaining</small>
              <b>Rs. {invoice.remainingAmount.toLocaleString("en-IN")}</b>
            </div>
            <em className={`status-${invoice.status}`}>{invoice.status}</em>
          </article>
        ))}
        {!invoices.length && <p className="dashboard-empty">No invoices have been issued yet.</p>}
      </section>

      <section className="fee-card-list" aria-label="Payments">
        <h3>Recent payments</h3>
        {payments.map((payment) => (
          <article key={payment._id}>
            <div>
              <b>{payment.enrollmentId?.studentId?.fullName ?? "Student"}</b>
              <small>{payment.enrollmentId?.courseTitleSnapshot ?? "Course"}</small>
            </div>
            <div>
              <small>Paid</small>
              <b>Rs. {payment.amount.toLocaleString("en-IN")}</b>
            </div>
            <div>
              <small>Method</small>
              <b>{payment.method.toUpperCase()}</b>
            </div>
            <a className="receipt-link" href={`/api/admin/payments/${payment._id}/receipt`} target="_blank">
              {payment.receiptNumber ? "View receipt" : "Generate receipt"}
            </a>
          </article>
        ))}
        {!payments.length && <p className="dashboard-empty">No payments have been recorded yet.</p>}
      </section>
    </main>
  );
}
