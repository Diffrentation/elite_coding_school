"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { ArrowRight, Check, ChevronDown } from "lucide-react";

const COURSE_OPTIONS = [
  "MERN Stack & Next.js Web Development",
  "DSA & System Design (C++ / Java / Python)",
  "C & C++ Programming Foundations",
  "Core Java & OOP Programming",
  "Python Programming & Logic Building",
  "Computer Networks & Linux OS from Scratch",
  "General Classroom Walk-in & Free Trial Demo",
];

const VISIT_OPTIONS: { value: "demo" | "admission"; label: string }[] = [
  { value: "demo", label: "Book a Free Trial Demo Class" },
  { value: "admission", label: "Admissions & Fee Structure Counseling" },
];

const initialFields = {
  fullName: "",
  email: "",
  phone: "",
  interestedCourse: "MERN Stack & Next.js Web Development",
  message: "",
  type: "admission" as "admission" | "demo",
};

export function InquiryForm() {
  const [fields, setFields] = useState(initialFields);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [courseOpen, setCourseOpen] = useState(false);
  const [visitOpen, setVisitOpen] = useState(false);
  const courseDropdownRef = useRef<HTMLDivElement>(null);
  const visitDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (courseDropdownRef.current && !courseDropdownRef.current.contains(event.target as Node)) {
        setCourseOpen(false);
      }
      if (visitDropdownRef.current && !visitDropdownRef.current.contains(event.target as Node)) {
        setVisitOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setCourseOpen(false);
        setVisitOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

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
      <h2>Book a Free Demo Class or In-Person Counseling</h2>
      <p>Schedule your walk-in visit to meet our teachers, inspect the classroom, and take a trial class.</p>

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
        <div className="custom-dropdown" ref={courseDropdownRef}>
          <button
            type="button"
            className={`dropdown-trigger ${courseOpen ? "is-open" : ""}`}
            onClick={() => {
              setCourseOpen((prev) => !prev);
              setVisitOpen(false);
            }}
            aria-haspopup="listbox"
            aria-expanded={courseOpen}
          >
            <span className="dropdown-label">{fields.interestedCourse}</span>
            <ChevronDown size={16} className={`dropdown-chevron ${courseOpen ? "rotate-180" : ""}`} />
          </button>

          {courseOpen && (
            <div className="dropdown-menu" role="listbox">
              {COURSE_OPTIONS.map((course) => {
                const isSelected = fields.interestedCourse === course;
                return (
                  <button
                    key={course}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    className={`dropdown-option ${isSelected ? "is-selected" : ""}`}
                    onClick={() => {
                      setFields({ ...fields, interestedCourse: course });
                      setCourseOpen(false);
                    }}
                  >
                    <span>{course}</span>
                    {isSelected && <Check size={14} className="dropdown-check" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </label>

      <label>
        Visit Preference
        <div className="custom-dropdown" ref={visitDropdownRef}>
          <button
            type="button"
            className={`dropdown-trigger ${visitOpen ? "is-open" : ""}`}
            onClick={() => {
              setVisitOpen((prev) => !prev);
              setCourseOpen(false);
            }}
            aria-haspopup="listbox"
            aria-expanded={visitOpen}
          >
            <span className="dropdown-label">
              {fields.type === "demo"
                ? "Book a Free Trial Demo Class"
                : "Admissions & Fee Structure Counseling"}
            </span>
            <ChevronDown size={16} className={`dropdown-chevron ${visitOpen ? "rotate-180" : ""}`} />
          </button>

          {visitOpen && (
            <div className="dropdown-menu" role="listbox">
              {VISIT_OPTIONS.map((opt) => {
                const isSelected = fields.type === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    className={`dropdown-option ${isSelected ? "is-selected" : ""}`}
                    onClick={() => {
                      setFields({ ...fields, type: opt.value });
                      setVisitOpen(false);
                    }}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <Check size={14} className="dropdown-check" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
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
        <span>{submitting ? "Submitting Request..." : "Schedule Classroom Visit & Trial"}</span>
        <ArrowRight size={17} />
      </button>
    </form>
  );
}
