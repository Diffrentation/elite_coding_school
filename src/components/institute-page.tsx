"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
import { CopyrightYear } from "@/components/copyright-year";
import {
  ArrowRight,
  BookOpen,
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock,
  Code2,
  Cpu,
  Globe,
  Layers,
  Mail,
  MapPin,
  Monitor,
  Network,
  Phone,
  Radio,
  Server,
  ShieldCheck,
  Sparkles,
  Terminal,
  Users,
  Wifi,
  Zap,
} from "lucide-react";
import { InquiryForm } from "@/components/inquiry-form";

type Settings = {
  instituteName: string;
  about: string;
  email: string;
  phone: string;
  address: string;
  openingHours: string;
};

export function InstitutePage({ type }: { type: "about" | "contact" }) {
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((response) => response.json())
      .then((body) => setSettings(body.data?.settings ?? null))
      .catch(() => setSettings(null));
  }, []);

  const name = settings?.instituteName ?? "Elite Coding School";
  const address =
    settings?.address ||
    "Elite Coding School, Main Market Road, Near Metro Station.";
  const phone = settings?.phone || "+91 98765 43210";
  const email = settings?.email || "admissions@elitecodingschool.com";
  const hours = settings?.openingHours || "Monday – Saturday: 9:00 AM – 7:00 PM";

  return (
    <main className="courses-redesign">
      {/* 1. STICKY HEADER */}
      <Navbar activePage={type} />

      {/* 2. BODY CONTENT: ABOUT vs CONTACT */}
      {type === "about" ? (
        <>
          {/* About Hero */}
          <section className="courses-catalog-hero" style={{ paddingBottom: "60px" }}>
            <div className="courses-hero-inner">
              <div className="courses-hero-copy">
                <div className="kicker">
                  <span className="pulse-dot" />
                  <span>ABOUT OUR OFFLINE COACHING CENTER</span>
                </div>
                <h1>
                  Genuine, Concept-First Teaching.{" "}
                  <span className="gradient-text-purple">Started by Passionate Teachers.</span>
                </h1>
                <p className="lead">
                  {settings?.about ||
                    "Elite Coding School is a newly opened offline coaching center created by passionate educators. We believe that real coding skills cannot be developed simply by binge-watching online videos in isolation. We provide a clean, supportive classroom where students learn from scratch, code daily on their laptops, and get immediate 1:1 teacher guidance whenever they get stuck."}
                </p>

                <div className="offline-chips-row">
                  <div className="offline-chip">
                    <CheckCircle2 size={14} />
                    <span>Genuine Classroom Teaching</span>
                  </div>
                  <div className="offline-chip">
                    <Users size={14} />
                    <span>Small Batches (10–15 Students)</span>
                  </div>
                  <div className="offline-chip">
                    <Code2 size={14} />
                    <span>Daily Laptop Coding</span>
                  </div>
                  <div className="offline-chip">
                    <Zap size={14} />
                    <span>1:1 Teacher Doubt Solving</span>
                  </div>
                </div>

                <div className="hero-actions">
                  <Link className="btn-primary-hero" href="/courses">
                    <span>View Classroom Courses</span>
                    <ArrowRight size={17} />
                  </Link>
                  <Link className="btn-secondary-hero" href="/contact">
                    <Building2 size={16} />
                    <span>Visit Our Center &amp; Take Demo</span>
                  </Link>
                </div>
              </div>

              {/* Lab Specs Summary */}
              <div className="lab-specs-card">
                <div className="lab-specs-header">
                  <div className="lab-specs-title">
                    <Terminal size={15} color="#c084fc" />
                    <span>PRACTICAL LEARNING SETUP</span>
                  </div>
                  <div className="lab-status-badge">
                    <span className="pulse-dot" />
                    <span>NEW BATCHES ENROLLING</span>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div className="spec-item">
                    <Monitor size={18} />
                    <div>
                      <strong>Comfortable Desks &amp; Power Sockets</strong>
                      <span>Dedicated charging points for every student laptop</span>
                    </div>
                  </div>
                  <div className="spec-item">
                    <Wifi size={18} />
                    <div>
                      <strong>High-Speed Classroom Wi-Fi</strong>
                      <span>Fast internet for coding practice, documentation &amp; Git</span>
                    </div>
                  </div>
                  <div className="spec-item">
                    <Layers size={18} />
                    <div>
                      <strong>Projector &amp; Whiteboard Demos</strong>
                      <span>Step-by-step logic breakdown drawn live by teachers</span>
                    </div>
                  </div>
                  <div className="spec-item">
                    <Users size={18} />
                    <div>
                      <strong>Direct Desk Assistance</strong>
                      <span>Teachers review your code line-by-line right at your desk</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* The Philosophy: Why In-Person Beats Online Video Mills */}
          <section className="section-shell">
            <div className="section-header">
              <div className="section-kicker">
                <Zap size={13} />
                <span>OUR TEACHING COMMITMENT</span>
              </div>
              <h2>Why Learning In-Person with a Teacher Works</h2>
              <p>
                Thousands of students get stuck on simple syntax errors or confusing logic in online courses and quit. Here is why genuine in-person coaching makes all the difference.
              </p>
            </div>

            <div className="tech-pillars-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
              <div className="pillar-card">
                <div className="pillar-icon-box icon-box-dev">
                  <Zap size={24} />
                </div>
                <h3>1:1 Desk-Side Doubt Solving</h3>
                <p>
                  No waiting on forums or chatbots. When your code throws an error, a teacher walks over to your desk and teaches you how to trace and fix it immediately.
                </p>
              </div>

              <div className="pillar-card">
                <div className="pillar-icon-box icon-box-net">
                  <CheckCircle2 size={24} />
                </div>
                <h3>We Start From Absolute Zero</h3>
                <p>
                  No prior programming background required. We explain every concept in simple, accessible language with relatable real-world examples.
                </p>
              </div>

              <div className="pillar-card">
                <div className="pillar-icon-box icon-box-os">
                  <Users size={24} />
                </div>
                <h3>Small Batches (10–15 Students)</h3>
                <p>
                  We keep batches small so that every single student receives personal attention, active practice time, and honest feedback from the teacher.
                </p>
              </div>
            </div>
          </section>

          {/* 4 Core Tech Verticals */}
          <section className="section-shell" style={{ paddingTop: 0 }}>
            <div className="section-header">
              <div className="section-kicker">
                <Terminal size={13} />
                <span>WHAT WE TEACH</span>
              </div>
              <h2>Practical Skills Taught From the Ground Up</h2>
              <p>
                From MERN stack and Next.js to DSA and foundational programming in C, C++, Java, and Python.
              </p>
            </div>

            <div className="tech-pillars-grid">
              <div className="pillar-card">
                <div className="pillar-icon-box icon-box-dev">
                  <Code2 size={24} />
                </div>
                <h3>Full-Stack MERN &amp; Next.js</h3>
                <p>MongoDB, Express.js, React.js, Node.js, Next.js 15, REST APIs, and Git &amp; GitHub workflows.</p>
                <div className="pillar-tags">
                  <span className="pillar-tag">MongoDB</span>
                  <span className="pillar-tag">React.js</span>
                  <span className="pillar-tag">Next.js</span>
                  <span className="pillar-tag">Node.js</span>
                  <span className="pillar-tag">Git / GitHub</span>
                </div>
              </div>

              <div className="pillar-card">
                <div className="pillar-icon-box icon-box-net">
                  <Sparkles size={24} />
                </div>
                <h3>Frontend, Tailwind &amp; GSAP</h3>
                <p>Pixel-perfect responsive design, modern UI component libraries, and slick interactive animations with GSAP.</p>
                <div className="pillar-tags">
                  <span className="pillar-tag">Tailwind CSS</span>
                  <span className="pillar-tag">GSAP</span>
                  <span className="pillar-tag">UI Libraries</span>
                  <span className="pillar-tag">Responsive UI</span>
                </div>
              </div>

              <div className="pillar-card">
                <div className="pillar-icon-box icon-box-dsa">
                  <Layers size={24} />
                </div>
                <h3>Data Structures &amp; Algorithms (DSA)</h3>
                <p>Problem-solving strategies, loops, arrays, strings, recursion, and step-by-step whiteboard logic drills.</p>
                <div className="pillar-tags">
                  <span className="pillar-tag">Problem Solving</span>
                  <span className="pillar-tag">Arrays &amp; Trees</span>
                  <span className="pillar-tag">Recursion</span>
                  <span className="pillar-tag">Whiteboard Logic</span>
                </div>
              </div>

              <div className="pillar-card">
                <div className="pillar-icon-box icon-box-os">
                  <Cpu size={24} />
                </div>
                <h3>C, C++, Java &amp; Python</h3>
                <p>Learn core programming: C pointers, C++ and Java Object-Oriented Programming (OOP), and Python scripting.</p>
                <div className="pillar-tags">
                  <span className="pillar-tag">C Language</span>
                  <span className="pillar-tag">C++ &amp; OOP</span>
                  <span className="pillar-tag">Core Java</span>
                  <span className="pillar-tag">Python 3</span>
                </div>
              </div>
            </div>
          </section>

          {/* Campus Facility Tour */}
          <section className="section-shell" style={{ paddingTop: 0 }}>
            <div className="section-header">
              <div className="section-kicker">
                <Building2 size={13} />
                <span>PRACTICAL SETUP</span>
              </div>
              <h2>Simple, Clean &amp; Practical Classroom</h2>
              <p>Everything you need for focused learning and hands-on coding practice.</p>
            </div>

            <div className="campus-tour-grid">
              <div className="tour-card">
                <div className="tour-icon-wrap">
                  <Monitor size={22} />
                </div>
                <h4>Comfortable Desks &amp; Power</h4>
                <p>Clean desks with dedicated laptop charging points so you can code without battery worries.</p>
              </div>

              <div className="tour-card">
                <div className="tour-icon-wrap">
                  <Wifi size={22} />
                </div>
                <h4>High-Speed Classroom Wi-Fi</h4>
                <p>Dependable high-speed internet for live package installs, documentation lookups, and GitHub pushes.</p>
              </div>

              <div className="tour-card">
                <div className="tour-icon-wrap">
                  <Layers size={22} />
                </div>
                <h4>Projector &amp; Whiteboard</h4>
                <p>Teachers explain code step-by-step on the screen and draw diagrams clearly on the whiteboard.</p>
              </div>

              <div className="tour-card">
                <div className="tour-icon-wrap">
                  <Users size={22} />
                </div>
                <h4>Extra Practice Space</h4>
                <p>Stay after class to practice your assignments, review notes, and discuss doubts with fellow classmates.</p>
              </div>
            </div>
          </section>

          {/* Walk-in CTA Banner */}
          <section className="campus-cta-shell">
            <div className="campus-cta-card">
              <div className="cta-left">
                <h2>Attend a Free Trial Demo Class Before Deciding.</h2>
                <p>
                  Walk in during our visiting hours. Meet our teachers, see the classroom, and attend a 1-hour trial class to experience our genuine teaching firsthand.
                </p>
                <div className="cta-contact-chips">
                  <div className="contact-chip">
                    <MapPin size={15} color="#38bdf8" />
                    <span>{address}</span>
                  </div>
                  <div className="contact-chip">
                    <Clock size={15} color="#10b981" />
                    <span>{hours}</span>
                  </div>
                  <div className="contact-chip">
                    <Phone size={15} color="#c084fc" />
                    <span>{phone}</span>
                  </div>
                </div>
              </div>

              <div className="cta-right">
                <Link className="btn-cta-main" href="/contact">
                  <span>Book Free Demo Class</span>
                  <ArrowRight size={17} />
                </Link>
                <Link className="btn-cta-ghost" href="/courses">
                  <BookOpen size={16} />
                  <span>Browse Classroom Courses</span>
                </Link>
              </div>
            </div>
          </section>
        </>
      ) : (
        /* CONTACT / WALK-IN PAGE */
        <>
          <section className="courses-catalog-hero" style={{ paddingBottom: "50px" }}>
            <div className="courses-hero-inner">
              <div className="courses-hero-copy">
                <div className="kicker">
                  <span className="pulse-dot" />
                  <span>VISIT US &amp; ATTEND A DEMO CLASS</span>
                </div>
                <h1>
                  Visit Our Coaching Center in Person. <br />
                  <span className="gradient-text-purple">Meet the Teachers.</span>
                </h1>
                <p className="lead">
                  We believe every student should experience how we teach before enrolling. Walk in during visiting hours, meet our teachers, inspect our clean classroom, and book a free trial demo class.
                </p>

                <div className="offline-chips-row">
                  <div className="offline-chip">
                    <Clock size={14} />
                    <span>Open 9:00 AM - 7:00 PM (Mon-Sat)</span>
                  </div>
                  <div className="offline-chip">
                    <MapPin size={14} />
                    <span>Near Metro Station Walkway</span>
                  </div>
                  <div className="offline-chip">
                    <Sparkles size={14} />
                    <span>Free Trial Demo Available</span>
                  </div>
                </div>
              </div>

              {/* Lab Telemetry / Status Card */}
              <div className="lab-specs-card">
                <div className="lab-specs-header">
                  <div className="lab-specs-title">
                    <Building2 size={15} color="#c084fc" />
                    <span>CENTER VISITING HOURS</span>
                  </div>
                  <div className="lab-status-badge">
                    <span className="pulse-dot" />
                    <span>WALK-INS WELCOME</span>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "8px" }}>
                    <span style={{ color: "#94a3b8" }}>Monday – Friday:</span>
                    <strong style={{ color: "#ffffff" }}>09:00 AM – 07:00 PM</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "8px" }}>
                    <span style={{ color: "#94a3b8" }}>Saturday:</span>
                    <strong style={{ color: "#ffffff" }}>09:00 AM – 06:00 PM</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "8px" }}>
                    <span style={{ color: "#94a3b8" }}>Sunday:</span>
                    <strong style={{ color: "#34d399" }}>Special Doubt Clearing Sessions</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "4px" }}>
                    <span style={{ color: "#94a3b8" }}>Demo Appointment:</span>
                    <strong style={{ color: "#38bdf8" }}>Walk in directly or call</strong>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 2-Column Contact Info + Form */}
          <section className="catalog-content-section" style={{ paddingTop: "50px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.15fr", gap: "40px", alignItems: "start" }}>
              {/* Left Column: Campus Info Cards */}
              <div>
                <div className="section-kicker" style={{ marginBottom: "12px" }}>
                  <MapPin size={13} />
                  <span>DIRECT DIRECTORY</span>
                </div>
                <h2 style={{ fontSize: "28px", fontWeight: 800, color: "#ffffff", margin: "0 0 24px" }}>
                  Campus Contact &amp; Location
                </h2>

                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {/* Address Card */}
                  <div
                    style={{
                      background: "#090e2e",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      borderRadius: "16px",
                      padding: "20px",
                      display: "flex",
                      gap: "16px",
                    }}
                  >
                    <div className="pillar-icon-box icon-box-dev" style={{ width: "42px", height: "42px", marginBottom: 0 }}>
                      <MapPin size={20} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff", margin: "0 0 4px" }}>
                        Physical Campus Address
                      </h4>
                      <p style={{ color: "#cbd5e1", fontSize: "13px", lineHeight: 1.6, margin: 0 }}>
                        {address}
                      </p>
                      <span style={{ color: "#38bdf8", fontSize: "12px", display: "block", marginTop: "6px" }}>
                        🚇 200m walk from Metro Station &bull; Visitor parking available
                      </span>
                    </div>
                  </div>

                  {/* Phone Helpline Card */}
                  <div
                    style={{
                      background: "#090e2e",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      borderRadius: "16px",
                      padding: "20px",
                      display: "flex",
                      gap: "16px",
                    }}
                  >
                    <div className="pillar-icon-box icon-box-net" style={{ width: "42px", height: "42px", marginBottom: 0 }}>
                      <Phone size={20} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff", margin: "0 0 4px" }}>
                        Admissions Desk &amp; Helpline
                      </h4>
                      <p style={{ color: "#cbd5e1", fontSize: "14px", fontWeight: 700, margin: 0 }}>
                        {phone}
                      </p>
                      <span style={{ color: "#94a3b8", fontSize: "12px", display: "block", marginTop: "4px" }}>
                        Direct calls &amp; WhatsApp counseling available Mon-Sat
                      </span>
                    </div>
                  </div>

                  {/* Email Card */}
                  <div
                    style={{
                      background: "#090e2e",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      borderRadius: "16px",
                      padding: "20px",
                      display: "flex",
                      gap: "16px",
                    }}
                  >
                    <div className="pillar-icon-box icon-box-os" style={{ width: "42px", height: "42px", marginBottom: 0 }}>
                      <Mail size={20} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff", margin: "0 0 4px" }}>
                        Official Email
                      </h4>
                      <p style={{ color: "#cbd5e1", fontSize: "13px", margin: 0 }}>
                        {email}
                      </p>
                      <span style={{ color: "#94a3b8", fontSize: "12px", display: "block", marginTop: "4px" }}>
                        Send inquiries for syllabus PDFs or corporate training
                      </span>
                    </div>
                  </div>
                </div>

                {/* Campus Visit FAQs */}
                <div style={{ marginTop: "32px" }}>
                  <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#ffffff", marginBottom: "14px" }}>
                    Frequently Asked Questions
                  </h3>

                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div style={{ background: "#090e2e", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "14px" }}>
                      <strong style={{ color: "#ffffff", fontSize: "13px", display: "block", marginBottom: "4px" }}>
                        Do I need an appointment before visiting?
                      </strong>
                      <span style={{ color: "#94a3b8", fontSize: "12px", lineHeight: 1.5, display: "block" }}>
                        No appointment is necessary! You are welcome to walk in between 9:00 AM and 8:30 PM Monday through Saturday.
                      </span>
                    </div>

                    <div style={{ background: "#090e2e", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "14px" }}>
                      <strong style={{ color: "#ffffff", fontSize: "13px", display: "block", marginBottom: "4px" }}>
                        Do I need to bring my own laptop?
                      </strong>
                      <span style={{ color: "#94a3b8", fontSize: "12px", lineHeight: 1.5, display: "block" }}>
                        Yes, carrying your own laptop is necessary for your daily coding practice. Every desk is equipped with dedicated power charging sockets and fast Wi-Fi so you can code directly on your personal machine and keep all your work safe.
                      </span>
                    </div>

                    <div style={{ background: "#090e2e", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "14px" }}>
                      <strong style={{ color: "#ffffff", fontSize: "13px", display: "block", marginBottom: "4px" }}>
                        Can I attend a free demo class before enrolling?
                      </strong>
                      <span style={{ color: "#94a3b8", fontSize: "12px", lineHeight: 1.5, display: "block" }}>
                        Yes! We offer a free trial demo class. Just bring your laptop, sit in the classroom, experience how our teachers break down concepts, and see if it feels right for you.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Inquiry & Demo Booking Form */}
              <div>
                <InquiryForm />
              </div>
            </div>
          </section>
        </>
      )}

      {/* 3. COMPREHENSIVE FOOTER */}
      <footer className="site-footer" id="contact">
        <div className="footer-inner">
          <div className="footer-top-strip">
            <div className="footer-brand-lockup">
              <Link className="brand" href="/">
                <span className="brand-mark">&lt;/&gt;</span>
                <span>{name}</span>
              </Link>
              <div className="footer-live-status">
                <span className="pulse-dot" />
                <span>CENTER OPEN TODAY (09:00 - 19:00 IST)</span>
              </div>
            </div>

            <div className="social-icons-row">
              <a className="social-btn" href="https://github.com" target="_blank" rel="noreferrer" aria-label="GitHub">
                <Code2 size={17} />
              </a>
              <a className="social-btn" href="https://discord.com" target="_blank" rel="noreferrer" aria-label="Discord">
                <Radio size={17} />
              </a>
              <a className="social-btn" href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn">
                <Globe size={17} />
              </a>
              <a className="social-btn" href={`mailto:${email}`} aria-label="Email">
                <Mail size={17} />
              </a>
            </div>
          </div>

          <div className="footer-columns">
            <div className="footer-col">
              <h4>Offline Coaching Center</h4>
              <p className="lead">
                A newly opened coaching center started by dedicated teachers focused on genuine, concept-first education in small batches.
              </p>
              <div className="footer-address-card">
                <strong>📍 Center Location:</strong>
                {address}
                <br />
                <span style={{ color: "#34d399", fontWeight: 600, display: "block", marginTop: "6px" }}>
                  ● Walk-ins welcome Mon-Sat (9 AM - 7 PM)
                </span>
              </div>
            </div>

            <div className="footer-col">
              <h4>Curriculum Verticals</h4>
              <ul className="footer-nav-list">
                <li>
                  <Link href="/courses">
                    <ChevronRight size={13} /> Full-Stack Web Development
                  </Link>
                </li>
                <li>
                  <Link href="/courses">
                    <ChevronRight size={13} /> Computer Networks Fundamentals
                  </Link>
                </li>
                <li>
                  <Link href="/courses">
                    <ChevronRight size={13} /> Linux &amp; OS Basics
                  </Link>
                </li>
                <li>
                  <Link href="/courses">
                    <ChevronRight size={13} /> Programming Logic &amp; DSA
                  </Link>
                </li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Admissions &amp; Portal</h4>
              <ul className="footer-nav-list">
                <li>
                  <Link href="/courses">
                    <ChevronRight size={13} /> All Courses &amp; Syllabi
                  </Link>
                </li>
                <li>
                  <Link href="/register">
                    <ChevronRight size={13} /> Book a Free Demo Class
                  </Link>
                </li>
                <li>
                  <Link href="/login">
                    <ChevronRight size={13} /> Student Portal Login
                  </Link>
                </li>
                <li>
                  <Link href="/admin">
                    <ChevronRight size={13} /> Faculty &amp; Admin Panel
                  </Link>
                </li>
                <li>
                  <Link href="/contact">
                    <ChevronRight size={13} /> Center Walk-in Info
                  </Link>
                </li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Center Contact</h4>
              <ul className="footer-contact-list">
                <li>
                  <Phone size={15} />
                  <span>{phone} (Admissions Desk)</span>
                </li>
                <li>
                  <Mail size={15} />
                  <span>{email}</span>
                </li>
                <li>
                  <Clock size={15} />
                  <span>Visiting Hours: {hours}</span>
                </li>
                <li>
                  <Building2 size={15} />
                  <span>Near Metro Station Walkway</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="footer-assurance-strip">
            <div className="assurance-item">
              <Monitor size={16} />
              <span>Clean Desks &amp; Laptop Charging</span>
            </div>
            <div className="assurance-item">
              <Wifi size={16} />
              <span>High-Speed Classroom Wi-Fi</span>
            </div>
            <div className="assurance-item">
              <Users size={16} />
              <span>10–15 Students Small Batches</span>
            </div>
            <div className="assurance-item">
              <ShieldCheck size={16} />
              <span>Genuine Concept-First Teaching</span>
            </div>
          </div>

          <div className="footer-bottom-bar">
            <span>&copy; <CopyrightYear /> {name}. Dedicated to genuine, practical teaching.</span>
            <div className="footer-bottom-links">
              <Link href="/about">About Center</Link>
              <Link href="/contact">Visit Us</Link>
              <Link href="/courses">All Courses</Link>
              <Link href="/">Back Home</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
