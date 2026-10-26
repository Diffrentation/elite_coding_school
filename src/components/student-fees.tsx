"use client";

import { useEffect, useState } from "react";

type Invoice = {
  _id: string;
  month: string;
  dueAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: "pending" | "partial" | "paid";
  courseTitle: string;
};

type Payment = {
  _id: string;
  amount: number;
  method: string;
  paidAt: string;
  receiptNumber: string | null;
  courseTitle: string;
};

export function StudentFees() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/me/fees")
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error?.message ?? "Could not load fee details.");
        setInvoices(body.data.invoices ?? []);
        setPayments(body.data.payments ?? []);
      })
      .catch((reason: Error) => setError(reason.message));
  }, []);

  const dueTotal = invoices.reduce((total, invoice) => total + invoice.remainingAmount, 0);

  return (
    <main className="portal-content student-fees">
      <div className="portal-intro">
        <div>
          <p className="kicker">FEES AND RECEIPTS</p>
          <h2>Keep track of your payments.</h2>
          <p>View amounts recorded by the institute and download receipts for your own verified payments.</p>
        </div>
        <span className={dueTotal ? "status-pill neutral" : "status-pill"}>
          {dueTotal ? `Rs. ${dueTotal.toLocaleString("en-IN")} due` : "No outstanding balance"}
        </span>
      </div>
      {error && <p className="form-error">{error}</p>}

      <section className="fee-card-list" aria-label="Fee invoices">
        <h3>Fee status</h3>
        {invoices.map((invoice) => (
          <article key={invoice._id}>
            <div>
              <b>{invoice.courseTitle}</b>
              <small>{formatMonth(invoice.month)}</small>
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
        {!invoices.length && <p className="dashboard-empty">No fee invoices have been issued yet.</p>}
      </section>

      <section className="fee-card-list" aria-label="Payment receipts">
        <h3>Payment receipts</h3>
        {payments.map((payment) => (
          <article key={payment._id}>
            <div>
              <b>{payment.courseTitle}</b>
              <small>{new Date(payment.paidAt).toLocaleDateString("en-IN")}</small>
            </div>
            <div>
              <small>Method</small>
              <b>{payment.method.toUpperCase()}</b>
            </div>
            <div>
              <small>Paid</small>
              <b>Rs. {payment.amount.toLocaleString("en-IN")}</b>
            </div>
            <a className="receipt-link" href={`/api/me/payments/${payment._id}/receipt`} target="_blank">
              {payment.receiptNumber ? "View receipt" : "Generate receipt"}
            </a>
          </article>
        ))}
        {!payments.length && <p className="dashboard-empty">No payments have been recorded yet.</p>}
      </section>
    </main>
  );
}

function formatMonth(value: string) {
  return new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric" }).format(
    new Date(`${value}-01T00:00:00`),
  );
}
