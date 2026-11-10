"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CopyrightYear } from "@/components/copyright-year";
import {
  ArrowRight,
  BookOpen,
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Code2,
  Globe,
  GraduationCap,
  HelpCircle,
  Mail,
  MapPin,
  Monitor,
  Phone,
  Radio,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";

export type FooterProps = {
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
  hours?: string;
  onSelectTrack?: (track: string) => void;
};

type PublishedCourse = {
  _id: string;
  title: string;
  track: string;
  shortDescription: string;
  skills: string[];
};

export function Footer({
  name = "Elite Coding School",
  address = "Vijay Nagar Bypass, Bagu",
  phone = "+91 9311278407",
  email = "bbhupender100@gmail.com",
  hours = "Monday – Saturday: 9:00 AM – 7:00 PM",
  onSelectTrack,
}: FooterProps) {
  const [courses, setCourses] = useState<PublishedCourse[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  // State for which dropdown sections are open (open by default so footer is clearly visible)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    about: true,
    courses: true,
    admissions: true,
    contact: true,
  });

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const allOpen =
    Boolean(openSections.about) &&
    Boolean(openSections.courses) &&
    Boolean(openSections.admissions) &&
    Boolean(openSections.contact);

  const toggleAll = () => {
    if (allOpen) {
      setOpenSections({});
    } else {
      setOpenSections({
        about: true,
        courses: true,
        admissions: true,
        contact: true,
      });
    }
  };

  const anyOpen = Object.values(openSections).some(Boolean);

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/courses?limit=50", { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Could not load courses");
        return response.json();
      })
      .then((payload) => setCourses(payload.data?.courses ?? []))
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setCourses([]);
      })
      .finally(() => setCoursesLoading(false));

    return () => controller.abort();
  }, []);

  return (
    <footer className="site-footer" id="contact">
      <div className="footer-inner">
        {/* Top Strip */}
        <div className="footer-top-strip">
          <div className="footer-brand-lockup">
            <Link className="brand" href="/">
              <span className="brand-mark">&lt;/&gt;</span>
              <span>{name}</span>
            </Link>
            <div className="footer-live-status">
              <span className="pulse-dot" />
              <span>OFFLINE CENTER OPEN (09:00 - 19:00 IST)</span>
            </div>
          </div>

          <div className="social-icons-row">
            <a
              className="social-btn"
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
            >
              <Code2 size={16} />
            </a>
            <a
              className="social-btn"
              href="https://discord.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Discord"
            >
              <Radio size={16} />
            </a>
            <a
              className="social-btn"
              href="https://linkedin.com"
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
            >
              <Globe size={16} />
            </a>
            <a className="social-btn" href={`mailto:${email}`} aria-label="Email">
              <Mail size={16} />
            </a>
          </div>
        </div>

        {/* Dropdowns Control Bar */}
        <div className="footer-controls-strip">
          <div className="footer-controls-label">
            <Sparkles size={13} className="text-purple-400" />
            <span>CAMPUS DIRECTORY &amp; QUICK LINKS</span>
          </div>
          <button
            type="button"
            className="footer-toggle-all-btn"
            onClick={toggleAll}
            aria-label={allOpen ? "Collapse all footer sections" : "Expand all footer sections"}
          >
            <span>{allOpen ? "Collapse All ▴" : anyOpen ? "Expand All ▾" : "Show All Details ▾"}</span>
          </button>
        </div>

        {/* Smart Collapsible Dropdown Accordions */}
        <div className="footer-accordions-group">
          {/* Section 1: About Our Offline Coaching Center */}
          <div className={`footer-accordion-card ${openSections.about ? "is-open" : ""}`}>
            <button
              type="button"
              className="footer-accordion-trigger"
              onClick={() => toggleSection("about")}
              aria-expanded={Boolean(openSections.about)}
            >
              <div className="footer-trigger-left">
                <div className="footer-trigger-icon icon-dev">
                  <Building2 size={18} />
                </div>
                <div className="footer-trigger-titles">
                  <span className="footer-trigger-heading">About Our Offline Coaching Center</span>
                  <span className="footer-trigger-sub">
                    Teaching philosophy, concept-first learning &amp; campus location
                  </span>
                </div>
              </div>
              <div className="footer-trigger-right">
                <span className="footer-trigger-badge">Center Info</span>
                <ChevronDown
                  size={18}
                  className={`footer-trigger-chevron ${openSections.about ? "rotate-180" : ""}`}
                />
              </div>
            </button>

            {openSections.about && (
              <div className="footer-accordion-body">
                <div className="footer-about-content">
                  <p className="lead">
                    Elite Coding School is a newly opened coaching center started by passionate, dedicated
                    educators. We believe true programming competence is forged by hands-on typing, real
                    compiler errors, and 1:1 teacher doubt clearing—not passive online video bingeing.
                  </p>

                  <div className="footer-address-card">
                    <div className="footer-address-header">
                      <MapPin size={16} color="#c084fc" />
                      <strong>Physical Campus Address</strong>
                    </div>
                    <p>{address}</p>
                    <span className="footer-address-note">
                      🚇 200m walk from Metro Station &bull; Free visitor parking available
                    </span>
                    <span className="footer-address-live">
                      ● Walk-ins &amp; Demo Classes welcome Mon–Sat (09:00 AM - 07:00 PM)
                    </span>
                  </div>

                  <div className="footer-inline-actions">
                    <Link href="/about" className="footer-inline-btn">
                      <span>Read Institute Story &amp; Faculty</span>
                      <ArrowRight size={13} />
                    </Link>
                    <Link href="/contact#contact-form" className="footer-inline-btn ghost">
                      <span>Visit Center &amp; Take Demo</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Classroom Programs & Syllabi */}
          <div className={`footer-accordion-card ${openSections.courses ? "is-open" : ""}`}>
            <button
              type="button"
              className="footer-accordion-trigger"
              onClick={() => toggleSection("courses")}
              aria-expanded={Boolean(openSections.courses)}
            >
              <div className="footer-trigger-left">
                <div className="footer-trigger-icon icon-net">
                  <Code2 size={18} />
                </div>
                <div className="footer-trigger-titles">
                  <span className="footer-trigger-heading">Classroom Courses &amp; Syllabi</span>
                  <span className="footer-trigger-sub">
                    In-person cohorts with daily laptop coding &amp; mentor help
                  </span>
                </div>
              </div>
              <div className="footer-trigger-right">
                <span className="footer-trigger-badge">
                  {coursesLoading ? "Loading..." : `${courses.length} Programs`}
                </span>
                <ChevronDown
                  size={18}
                  className={`footer-trigger-chevron ${openSections.courses ? "rotate-180" : ""}`}
                />
              </div>
            </button>

            {openSections.courses && (
              <div className="footer-accordion-body">
                <div className="footer-courses-grid">
                  {courses.map((course) => (
                    <div className="footer-course-link-card" key={course._id}>
                      <Link href={`/courses/${course._id}`} onClick={() => onSelectTrack?.(course.track)}>
                        <div className="footer-course-info">
                          <strong>{course.title}</strong>
                          <span>{course.skills?.slice(0, 5).join(", ") || course.shortDescription}</span>
                        </div>
                        <ChevronRight size={14} className="footer-course-arrow" />
                      </Link>
                    </div>
                  ))}
                  {!coursesLoading && courses.length === 0 && (
                    <p className="footer-empty-state">No published courses are available right now.</p>
                  )}
                </div>

                <div className="footer-inline-actions" style={{ marginTop: "14px" }}>
                  <Link href="/courses" className="footer-inline-btn">
                    <span>Browse All Classroom Courses &amp; Syllabi</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Admissions, Demo Class & Portals */}
          <div className={`footer-accordion-card ${openSections.admissions ? "is-open" : ""}`}>
            <button
              type="button"
              className="footer-accordion-trigger"
              onClick={() => toggleSection("admissions")}
              aria-expanded={Boolean(openSections.admissions)}
            >
              <div className="footer-trigger-left">
                <div className="footer-trigger-icon icon-os">
                  <GraduationCap size={18} />
                </div>
                <div className="footer-trigger-titles">
                  <span className="footer-trigger-heading">Admissions, Demo Class &amp; Portals</span>
                  <span className="footer-trigger-sub">
                    Free trial class bookings, student dashboard &amp; fee counseling
                  </span>
                </div>
              </div>
              <div className="footer-trigger-right">
                <span className="footer-trigger-badge">Student Access</span>
                <ChevronDown
                  size={18}
                  className={`footer-trigger-chevron ${openSections.admissions ? "rotate-180" : ""}`}
                />
              </div>
            </button>

            {openSections.admissions && (
              <div className="footer-accordion-body">
                <div className="footer-links-two-col">
                  <ul className="footer-nav-list">
                    <li>
                      <Link href="/register">
                        <ChevronRight size={13} />
                        <span>Book a Free Trial Demo Class</span>
                      </Link>
                    </li>
                    <li>
                      <Link href="/courses">
                        <ChevronRight size={13} />
                        <span>View All Courses &amp; Syllabi PDFs</span>
                      </Link>
                    </li>
                    <li>
                      <Link href="/contact#contact-form">
                        <ChevronRight size={13} />
                        <span>Walk-in Counseling &amp; Book Demo</span>
                      </Link>
                    </li>
                  </ul>
                  <ul className="footer-nav-list">
                    <li>
                      <Link href="/login">
                        <ChevronRight size={13} />
                        <span>Student Portal Login &amp; Attendance</span>
                      </Link>
                    </li>
                    <li>
                      <Link href="/admin">
                        <ChevronRight size={13} />
                        <span>Faculty &amp; Admissions Admin Panel</span>
                      </Link>
                    </li>
                    <li>
                      <Link href="/about">
                        <ChevronRight size={13} />
                        <span>Why In-Person Teacher Coaching Works</span>
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Admissions Helpline & Visiting Hours */}
          <div className={`footer-accordion-card ${openSections.contact ? "is-open" : ""}`}>
            <button
              type="button"
              className="footer-accordion-trigger"
              onClick={() => toggleSection("contact")}
              aria-expanded={Boolean(openSections.contact)}
            >
              <div className="footer-trigger-left">
                <div className="footer-trigger-icon icon-data">
                  <Phone size={18} />
                </div>
                <div className="footer-trigger-titles">
                  <span className="footer-trigger-heading">Campus Contact &amp; Visiting Hours</span>
                  <span className="footer-trigger-sub">
                    Direct phone helpline, email inquiries &amp; center timings
                  </span>
                </div>
              </div>
              <div className="footer-trigger-right">
                <span className="footer-trigger-badge">Helpline</span>
                <ChevronDown
                  size={18}
                  className={`footer-trigger-chevron ${openSections.contact ? "rotate-180" : ""}`}
                />
              </div>
            </button>

            {openSections.contact && (
              <div className="footer-accordion-body">
                <div className="footer-contact-grid">
                  <div className="footer-contact-tile">
                    <Phone size={16} className="text-cyan-400" />
                    <div>
                      <strong>Admissions Helpline</strong>
                      <a href={`tel:${phone.replace(/\s+/g, "")}`} className="footer-tile-link">
                        {phone}
                      </a>
                      <span>Direct phone calls &amp; WhatsApp inquiries Mon–Sat</span>
                    </div>
                  </div>

                  <div className="footer-contact-tile">
                    <Mail size={16} className="text-purple-400" />
                    <div>
                      <strong>Official Email</strong>
                      <a href={`mailto:${email}`} className="footer-tile-link">
                        {email}
                      </a>
                      <span>Inquiries for course syllabus PDFs &amp; corporate batches</span>
                    </div>
                  </div>

                  <div className="footer-contact-tile">
                    <Clock size={16} className="text-amber-400" />
                    <div>
                      <strong>Center Visiting Hours</strong>
                      <strong className="footer-tile-highlight">{hours}</strong>
                      <span>Sunday special doubt clearing sessions</span>
                    </div>
                  </div>

                  <div className="footer-contact-tile">
                    <Building2 size={16} className="text-emerald-400" />
                    <div>
                      <strong>Physical Classroom</strong>
                      <strong className="footer-tile-highlight">{address}</strong>
                      <span>200m walk from Metro Station &bull; Visitor parking</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Offline Quality Assurance Strip (Compact) */}
        <div className="footer-assurance-strip">
          <div className="assurance-item">
            <CheckCircle2 size={15} />
            <span>In-Person Classroom</span>
          </div>
          <div className="assurance-item">
            <Users size={15} />
            <span>10–15 Batch Size</span>
          </div>
          <div className="assurance-item">
            <Zap size={15} />
            <span>1:1 Teacher Doubt Solving</span>
          </div>
          <div className="assurance-item">
            <ShieldCheck size={15} />
            <span>Free Trial Demo Class</span>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom-bar">
          <span>
            &copy; <CopyrightYear /> {name}. Dedicated to genuine, practical teaching.
          </span>
          <div className="footer-bottom-links">
            <Link href="/">Home</Link>
            <Link href="/about">About Center</Link>
            <Link href="/courses">All Courses</Link>
            <Link href="/contact#contact-form">Visit Us</Link>
            <Link href="/contact#contact-form">Book Demo</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Named alias for convenience
export const SiteFooter = Footer;
