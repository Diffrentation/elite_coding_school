"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
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
    "Elite Tech Campus, 3rd & 4th Floor, Innovation Tower, 100 Feet Road, Near Metro Station.";
  const phone = settings?.phone || "+91 98765 43210";
  const email = settings?.email || "admissions@elitecodingschool.com";
  const hours = settings?.openingHours || "Monday – Saturday: 9:00 AM – 9:00 PM";

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
                  <span>ABOUT OUR OFFLINE CODING SANCTUM</span>
                </div>
                <h1>
                  Engineering Depth Forged in Silicon &amp; Code.{" "}
                  <span className="gradient-text-purple">In-Person.</span>
                </h1>
                <p className="lead">
                  {settings?.about ||
                    "Elite Coding School was founded on a singular conviction: genuine software engineering, packet-level computer networking, and operating systems programming cannot be mastered through 10-minute video tutorials. We built a high-tech offline campus where aspiring coders write real code, wire physical switches, compile Linux kernels, and debug with senior mentors right beside them."}
                </p>

                <div className="offline-chips-row">
                  <div className="offline-chip">
                    <Monitor size={14} />
                    <span>Dedicated Linux Desks</span>
                  </div>
                  <div className="offline-chip">
                    <Network size={14} />
                    <span>Cisco Catalyst Racks</span>
                  </div>
                  <div className="offline-chip">
                    <Cpu size={14} />
                    <span>Kernel &amp; Systems Lab</span>
                  </div>
                  <div className="offline-chip">
                    <Users size={14} />
                    <span>2-Min Desk Mentoring</span>
                  </div>
                </div>

                <div className="hero-actions">
                  <Link className="btn-primary-hero" href="/courses">
                    <span>Explore In-Person Programs</span>
                    <ArrowRight size={17} />
                  </Link>
                  <Link className="btn-secondary-hero" href="/contact">
                    <Building2 size={16} />
                    <span>Schedule Free Campus Visit</span>
                  </Link>
                </div>
              </div>

              {/* Lab Specs Summary */}
              <div className="lab-specs-card">
                <div className="lab-specs-header">
                  <div className="lab-specs-title">
                    <Terminal size={15} color="#c084fc" />
                    <span>CAMPUS HIGHLIGHTS</span>
                  </div>
                  <div className="lab-status-badge">
                    <span className="pulse-dot" />
                    <span>OPEN 6 DAYS / WEEK</span>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div className="spec-item">
                    <Monitor size={18} />
                    <div>
                      <strong>Dual 27&quot; 4K Workstations</strong>
                      <span>High-spec Ubuntu / Arch Linux dual-boot setups for each student</span>
                    </div>
                  </div>
                  <div className="spec-item">
                    <Wifi size={18} />
                    <div>
                      <strong>10 Gbps Campus Fiber LAN</strong>
                      <span>Low-latency packet tracing &amp; local cluster deployment</span>
                    </div>
                  </div>
                  <div className="spec-item">
                    <Network size={18} />
                    <div>
                      <strong>Physical Cisco Hardware Bay</strong>
                      <span>Cisco Catalyst 3850 managed switches &amp; server racks</span>
                    </div>
                  </div>
                  <div className="spec-item">
                    <Users size={18} />
                    <div>
                      <strong>1:1 Desk-Side Faculty</strong>
                      <span>Live debugging with experienced systems architects</span>
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
                <span>OUR CORE TEACHING PHILOSOPHY</span>
              </div>
              <h2>Why We Built an Offline Institute</h2>
              <p>
                Online platforms promised education for all, but produced isolated coders who quit at the first
                cryptic compiler error. Here is how our offline campus changes the paradigm.
              </p>
            </div>

            <div className="tech-pillars-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
              <div className="pillar-card">
                <div className="pillar-icon-box icon-box-dev">
                  <Zap size={24} />
                </div>
                <h3>Desk-Side 2-Minute Debugging</h3>
                <p>
                  No 3-day forum delays. When you get a segmentation fault in C, an iptables drop, or a broken
                  Next.js cache, an instructor walks to your desk and teaches you how to trace it in GDB or Wireshark.
                </p>
              </div>

              <div className="pillar-card">
                <div className="pillar-icon-box icon-box-net">
                  <Network size={24} />
                </div>
                <h3>Real Hardware &amp; Wire Packets</h3>
                <p>
                  You cannot learn networking from a browser simulator. At Elite, you crimp RJ45 cables, configure
                  physical Cisco switches, sniff wire packets, and deploy microservices to physical local servers.
                </p>
              </div>

              <div className="pillar-card">
                <div className="pillar-icon-box icon-box-os">
                  <Users size={24} />
                </div>
                <h3>Hacker Cohorts &amp; Daily Standups</h3>
                <p>
                  Surrounded by 50+ hungry developers coding 10 hours a day. Morning standups, peer code reviews,
                  whiteboard system architecture debates, and high-intensity weekend hackathons.
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
              <h2>From Silicon to Cloud Infrastructure</h2>
              <p>
                Our curriculum bridges the gap between high-level web engineering and low-level computer systems.
              </p>
            </div>

            <div className="tech-pillars-grid">
              <div className="pillar-card">
                <div className="pillar-icon-box icon-box-dev">
                  <Code2 size={24} />
                </div>
                <h3>Full-Stack &amp; Systems Dev</h3>
                <p>Distributed microservices, Next.js, Go, Node.js, PostgreSQL query tuning, and Redis caching.</p>
                <div className="pillar-tags">
                  <span className="pillar-tag">Next.js</span>
                  <span className="pillar-tag">TypeScript</span>
                  <span className="pillar-tag">Go</span>
                  <span className="pillar-tag">Postgres</span>
                </div>
              </div>

              <div className="pillar-card">
                <div className="pillar-icon-box icon-box-net">
                  <Network size={24} />
                </div>
                <h3>Computer Networks &amp; Cloud</h3>
                <p>TCP/IP stack, Cisco Catalyst switching, Wireshark packet capture, VLANs, BGP/OSPF, and firewalls.</p>
                <div className="pillar-tags">
                  <span className="pillar-tag">TCP/IP</span>
                  <span className="pillar-tag">Cisco</span>
                  <span className="pillar-tag">Wireshark</span>
                  <span className="pillar-tag">Firewalls</span>
                </div>
              </div>

              <div className="pillar-card">
                <div className="pillar-icon-box icon-box-os">
                  <Cpu size={24} />
                </div>
                <h3>Operating Systems &amp; Kernel</h3>
                <p>Linux kernel internals, custom memory allocators, system calls, POSIX threads, C and Rust.</p>
                <div className="pillar-tags">
                  <span className="pillar-tag">Linux</span>
                  <span className="pillar-tag">C/C++</span>
                  <span className="pillar-tag">Rust</span>
                  <span className="pillar-tag">Syscalls</span>
                </div>
              </div>

              <div className="pillar-card">
                <div className="pillar-icon-box icon-box-dsa">
                  <Layers size={24} />
                </div>
                <h3>DSA &amp; Whiteboard Design</h3>
                <p>Algorithmic problem solving, dynamic programming, and floor-to-ceiling whiteboard mock rounds.</p>
                <div className="pillar-tags">
                  <span className="pillar-tag">Algorithms</span>
                  <span className="pillar-tag">DP</span>
                  <span className="pillar-tag">System Design</span>
                </div>
              </div>
            </div>
          </section>

          {/* Campus Facility Tour */}
          <section className="section-shell" style={{ paddingTop: 0 }}>
            <div className="section-header">
              <div className="section-kicker">
                <Building2 size={13} />
                <span>PHYSICAL CAMPUS AMENITIES</span>
              </div>
              <h2>Tour Our Offline Facility</h2>
              <p>Designed for focused coding sessions from 9:00 AM to 9:00 PM.</p>
            </div>

            <div className="campus-tour-grid">
              <div className="tour-card">
                <div className="tour-icon-wrap">
                  <Monitor size={22} />
                </div>
                <h4>Dual-Screen Workstations</h4>
                <p>Dual 27-inch 4K IPS monitors, mechanical keyboards, ergonomic seating, and dual-boot OS rigs.</p>
              </div>

              <div className="tour-card">
                <div className="tour-icon-wrap">
                  <Server size={22} />
                </div>
                <h4>Cisco Hardware Rack Bay</h4>
                <p>Live patch bays, managed enterprise switches, router testbeds, and local Kubernetes clusters.</p>
              </div>

              <div className="tour-card">
                <div className="tour-icon-wrap">
                  <Layers size={22} />
                </div>
                <h4>Whiteboard War Rooms</h4>
                <p>Floor-to-ceiling magnetic whiteboards for architecture planning and mock interview rounds.</p>
              </div>

              <div className="tour-card">
                <div className="tour-icon-wrap">
                  <Radio size={22} />
                </div>
                <h4>Developer Study Lounge</h4>
                <p>High-speed campus Wi-Fi, systems engineering book library, and coffee bar for evening hack sessions.</p>
              </div>
            </div>
          </section>

          {/* Walk-in CTA Banner */}
          <section className="campus-cta-shell">
            <div className="campus-cta-card">
              <div className="cta-left">
                <h2>Visit the Coding Lab in Person Today.</h2>
                <p>
                  Walk in during open lab hours. Sit at a workstation, explore our Cisco hardware racks,
                  and meet our senior instructors for a free 1-hour trial.
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
                  <span>Book Free 1-Day Lab Trial</span>
                  <ArrowRight size={17} />
                </Link>
                <Link className="btn-cta-ghost" href="/courses">
                  <BookOpen size={16} />
                  <span>Browse In-Person Courses</span>
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
                  <span>CAMPUS ADMISSIONS &amp; WALK-IN CENTER</span>
                </div>
                <h1>
                  Visit Our Coding Lab in Person. <br />
                  <span className="gradient-text-purple">Walk In Today.</span>
                </h1>
                <p className="lead">
                  We encourage prospective engineers to experience our offline lab before enrolling.
                  Sit at a workstation, test our Cisco network rack, meet our senior faculty, and discuss your career goals.
                </p>

                <div className="offline-chips-row">
                  <div className="offline-chip">
                    <Clock size={14} />
                    <span>Open 9:00 AM - 9:00 PM (Mon-Sat)</span>
                  </div>
                  <div className="offline-chip">
                    <MapPin size={14} />
                    <span>200m from Metro Station</span>
                  </div>
                  <div className="offline-chip">
                    <Sparkles size={14} />
                    <span>Free 1-Day Trial Pass Available</span>
                  </div>
                </div>
              </div>

              {/* Lab Telemetry / Status Card */}
              <div className="lab-specs-card">
                <div className="lab-specs-header">
                  <div className="lab-specs-title">
                    <Building2 size={15} color="#c084fc" />
                    <span>CAMPUS WALK-IN TIMINGS</span>
                  </div>
                  <div className="lab-status-badge">
                    <span className="pulse-dot" />
                    <span>WALK-INS WELCOME</span>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "8px" }}>
                    <span style={{ color: "#94a3b8" }}>Monday – Friday:</span>
                    <strong style={{ color: "#ffffff" }}>09:00 AM – 09:00 PM</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "8px" }}>
                    <span style={{ color: "#94a3b8" }}>Saturday:</span>
                    <strong style={{ color: "#ffffff" }}>09:00 AM – 08:30 PM</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "8px" }}>
                    <span style={{ color: "#94a3b8" }}>Sunday:</span>
                    <strong style={{ color: "#34d399" }}>Open for Student Hackathons</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "4px" }}>
                    <span style={{ color: "#94a3b8" }}>Appointment:</span>
                    <strong style={{ color: "#38bdf8" }}>No prior booking required</strong>
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
                        Every enrolled student gets a dedicated dual-monitor workstation in our coding lab. You can bring a laptop if you prefer, but it is not required.
                      </span>
                    </div>

                    <div style={{ background: "#090e2e", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "14px" }}>
                      <strong style={{ color: "#ffffff", fontSize: "13px", display: "block", marginBottom: "4px" }}>
                        Can I test the lab before paying fees?
                      </strong>
                      <span style={{ color: "#94a3b8", fontSize: "12px", lineHeight: 1.5, display: "block" }}>
                        Yes! We offer a free 1-day lab trial where you can sit at a workstation, code with current students, and meet our instructors.
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
                <span>CAMPUS OPEN NOW (09:00 - 21:00 IST)</span>
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
              <h4>Offline Campus Hub</h4>
              <p className="lead">
                India&apos;s premier in-person coding institute for software engineers, network architects, and systems developers.
              </p>
              <div className="footer-address-card">
                <strong>📍 Campus Location:</strong>
                {address}
                <br />
                <span style={{ color: "#34d399", fontWeight: 600, display: "block", marginTop: "6px" }}>
                  ● Walk-ins welcome Mon-Sat (9 AM - 9 PM)
                </span>
              </div>
            </div>

            <div className="footer-col">
              <h4>Technology Tracks</h4>
              <ul className="footer-nav-list">
                <li>
                  <Link href="/courses">
                    <ChevronRight size={13} /> Full-Stack Development
                  </Link>
                </li>
                <li>
                  <Link href="/courses">
                    <ChevronRight size={13} /> Computer Networks &amp; CCNA
                  </Link>
                </li>
                <li>
                  <Link href="/courses">
                    <ChevronRight size={13} /> Linux &amp; OS Kernel Internals
                  </Link>
                </li>
                <li>
                  <Link href="/courses">
                    <ChevronRight size={13} /> Low-Level Systems (C / Rust)
                  </Link>
                </li>
                <li>
                  <Link href="/courses">
                    <ChevronRight size={13} /> Data Structures &amp; System Design
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
                    <ChevronRight size={13} /> Apply for Upcoming Cohort
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
                    <ChevronRight size={13} /> Request Fee Structure PDF
                  </Link>
                </li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Campus Contact</h4>
              <ul className="footer-contact-list">
                <li>
                  <Phone size={15} />
                  <span>{phone} (Admissions)</span>
                </li>
                <li>
                  <Mail size={15} />
                  <span>{email}</span>
                </li>
                <li>
                  <Clock size={15} />
                  <span>Lab Hours: {hours}</span>
                </li>
                <li>
                  <Building2 size={15} />
                  <span>Metro Station: 200m Walk</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="footer-assurance-strip">
            <div className="assurance-item">
              <Monitor size={16} />
              <span>Dedicated High-Spec Linux Desks</span>
            </div>
            <div className="assurance-item">
              <Server size={16} />
              <span>Physical Cisco Switches &amp; Hardware Bay</span>
            </div>
            <div className="assurance-item">
              <Users size={16} />
              <span>1:1 Desk-Side Senior Mentoring</span>
            </div>
            <div className="assurance-item">
              <ShieldCheck size={16} />
              <span>100% In-Person &bull; Zero Recorded Videos</span>
            </div>
          </div>

          <div className="footer-bottom-bar">
            <span>&copy; {new Date().getFullYear()} {name}. All rights reserved. Built for ambitious engineers.</span>
            <div className="footer-bottom-links">
              <Link href="/about">About Institute</Link>
              <Link href="/contact">Campus Tour</Link>
              <Link href="/courses">All Programs</Link>
              <Link href="/">Back Home</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
