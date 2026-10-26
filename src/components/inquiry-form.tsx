"use client";

import { FormEvent, useState } from "react";

const initialFields = {
  fullName: "",
  email: "",
  phone: "",
  interestedCourse: "",
  message: "",
  type: "admission",
};

export function InquiryForm() {
  const [fields, setFields] = useState(initialFields);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error?.message ?? "Could not send your inquiry.");
      setSuccess("Thanks. Our team will contact you soon.");
      setFields(initialFields);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not send your inquiry.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="inquiry-form" onSubmit={submit}>
      <h2>Send an inquiry</h2>
      <p>Tell us what you want to learn and we will help with the next step.</p>
      {error && <p className="form-error">{error}</p>}
      {success && <p className="form-success">{success}</p>}
      <label>
        Full name
        <input
          required
          value={fields.fullName}
          onChange={(event) => setFields({ ...fields, fullName: event.target.value })}
        />
      </label>
      <label>
        Email address
        <input
          required
          type="email"
          value={fields.email}
          onChange={(event) => setFields({ ...fields, email: event.target.value })}
        />
      </label>
      <label>
        Indian mobile number
        <input
          required
          inputMode="tel"
          placeholder="9876543210"
          value={fields.phone}
          onChange={(event) => setFields({ ...fields, phone: event.target.value })}
        />
      </label>
      <label>
        I am interested in
        <input
          maxLength={100}
          placeholder="For example, Full Stack Development"
          value={fields.interestedCourse}
          onChange={(event) => setFields({ ...fields, interestedCourse: event.target.value })}
        />
      </label>
      <label>
        Inquiry type
        <select
          value={fields.type}
          onChange={(event) => setFields({ ...fields, type: event.target.value as "admission" | "demo" })}
        >
          <option value="admission">Admission information</option>
          <option value="demo">Book a demo class</option>
        </select>
      </label>
      <label className="inquiry-full-width">
        Message (optional)
        <textarea
          maxLength={2000}
          value={fields.message}
          onChange={(event) => setFields({ ...fields, message: event.target.value })}
        />
      </label>
      <button className="button primary inquiry-submit" disabled={submitting}>
        {submitting ? "Sending..." : "Send inquiry"}
      </button>
    </form>
  );
}
