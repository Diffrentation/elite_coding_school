"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, CheckCircle2, Send, Sparkles } from "lucide-react";

const initialFields = {
  fullName: "",
  email: "",
  phone: "",
  interestedCourse: "Full-Stack & Distributed Systems",
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
      setSuccess("✓ Inquiry submitted! An admissions mentor will call you within 2 business hours.");
      setFields(initialFields);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not send your inquiry.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="inquiry-form" onSubmit={submit}>
      <h2>Book a Free Lab Demo or In-Person Counseling</h2>
      <p>Schedule your walk-in visit to test-drive our workstations and hardware racks.</p>

      {error && <p className="form-error">{error}</p>}
      {success && <p className="form-success">{success}</p>}

      <label>
        Full Name
        <input
          required
          placeholder="e.g. Alex Sharma"
          value={fields.fullName}
          onChange={(event) => setFields({ ...fields, fullName: event.target.value })}
        />
      </label>

      <label>
        Email Address
        <input
          required
          type="email"
          placeholder="alex@example.com"
          value={fields.email}
          onChange={(event) => setFields({ ...fields, email: event.target.value })}
        />
      </label>

      <label>
        Indian Mobile Number
        <input
          required
          inputMode="tel"
          placeholder="9876543210"
          value={fields.phone}
          onChange={(event) => setFields({ ...fields, phone: event.target.value })}
        />
      </label>

      <label>
        Program of Interest
        <select
          value={fields.interestedCourse}
          onChange={(event) => setFields({ ...fields, interestedCourse: event.target.value })}
        >
          <option value="Full-Stack & Distributed Systems">Full-Stack &amp; Distributed Systems</option>
          <option value="Computer Networks & Cloud Infrastructure">Computer Networks &amp; Cloud Infra (Cisco/CCNA)</option>
          <option value="Operating Systems & Kernel Programming">Operating Systems &amp; Kernel Programming (C/Rust)</option>
          <option value="Data Structures & High-Scale Systems">Data Structures &amp; Whiteboard System Design</option>
          <option value="Network Security & Packet Defense">Network Security &amp; Packet Defense</option>
          <option value="General Campus Walk-in Tour">General Campus Walk-in &amp; Lab Tour</option>
        </select>
      </label>

      <label>
        Visit Preference
        <select
          value={fields.type}
          onChange={(event) => setFields({ ...fields, type: event.target.value as "admission" | "demo" })}
        >
          <option value="demo">Book a 1-Day Free Lab Trial &amp; Demo</option>
          <option value="admission">Admissions &amp; Fee Structure Counseling</option>
        </select>
      </label>

      <label className="inquiry-full-width">
        Message or Questions (Optional)
        <textarea
          maxLength={2000}
          placeholder="Tell us about your background, programming experience, or preferred walk-in date..."
          value={fields.message}
          onChange={(event) => setFields({ ...fields, message: event.target.value })}
        />
      </label>

      <button className="btn-primary-hero inquiry-submit" disabled={submitting}>
        <span>{submitting ? "Submitting Request..." : "Schedule Lab Visit & Trial"}</span>
        <ArrowRight size={17} />
      </button>
    </form>
  );
}
