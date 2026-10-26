"use client";

import { useEffect, useState } from "react";

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

  return (
    <main className="portal-content admin-inquiries">
      <div className="portal-intro">
        <div>
          <p className="kicker">LEAD MANAGEMENT</p>
          <h2>Admission inquiries</h2>
          <p>Review public contact requests and keep their follow-up status accurate.</p>
        </div>
      </div>
      <div className="filter-row" aria-label="Inquiry status filter">
        {(["all", ...statuses] as const).map((status) => (
          <button
            className={filter === status ? "selected" : ""}
            key={status}
            onClick={() => {
              setError("");
              setFilter(status);
            }}
          >
            {status}
          </button>
        ))}
      </div>
      {error && <p className="form-error">{error}</p>}
      <section className="inquiry-table">
        {inquiries.length ? (
          inquiries.map((inquiry) => (
            <article key={inquiry._id}>
              <div>
                <b>{inquiry.fullName}</b>
                <small>{inquiry.email}</small>
                <small>{inquiry.phone}</small>
              </div>
              <div>
                <b>{inquiry.type === "demo" ? "Demo class" : "Admission"}</b>
                <small>{inquiry.interestedCourse || "No course selected"}</small>
                {inquiry.message && <small>{inquiry.message}</small>}
              </div>
              <label>
                Status
                <select
                  disabled={updatingId === inquiry._id}
                  value={inquiry.status}
                  onChange={(event) => updateStatus(inquiry._id, event.target.value as InquiryStatus)}
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>
            </article>
          ))
        ) : (
          <p className="dashboard-empty">No {filter === "all" ? "" : filter} inquiries found.</p>
        )}
      </section>
    </main>
  );
}
