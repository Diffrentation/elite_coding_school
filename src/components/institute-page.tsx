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
  HelpCircle,
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
import { Footer } from "@/components/footer";

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

  // Auto-scroll directly to contact form if arrived via #contact-form or #book-demo
  useEffect(() => {
    if (type !== "contact") return;
    const scrollToForm = () => {
      const hash = typeof window !== "undefined" ? window.location.hash : "";
      if (hash === "#contact-form" || hash === "#book-demo" || hash === "#inquiry-form") {
        const el = document.getElementById("contact-form") || document.getElementById("book-demo");
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
          const firstInput = el.querySelector("input") as HTMLInputElement | null;
          if (firstInput) {
            setTimeout(() => firstInput.focus({ preventScroll: true }), 400);
          }
        }
      }
    };

    const timer = setTimeout(scrollToForm, 150);
    window.addEventListener("hashchange", scrollToForm);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("hashchange", scrollToForm);
    };
  }, [type]);

  const name = settings?.instituteName ?? "Elite Coding School";
  const address =
    settings?.address ||
    "Vijay Nagar Bypass, Bagu";
  const phone = settings?.phone || "+91 9311278407";
  const email = settings?.email || "bbhupender100@gmail.com";
  const hours = settings?.openingHours || "Monday – Saturday: 9:00 AM – 7:00 PM";

  return (
    <main className={`courses-redesign institute-page institute-page--${type}`}>
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
                    <span>In-Person Classroom</span>
                  </div>
                  <div className="offline-chip">
                    <Users size={14} />
                    <span>Small Batches (10–15)</span>
                  </div>
                  <div className="offline-chip">
                    <Code2 size={14} />
                    <span>Daily Laptop Coding</span>
                  </div>
                  <div className="offline-chip">
                    <Zap size={14} />
                    <span>1:1 Teacher Help</span>
                  </div>
                </div>

                <div className="hero-actions">
                  <Link className="btn-primary-hero" href="/courses">
                    <span>View Classroom Courses</span>
                    <ArrowRight size={17} />
                  </Link>
                  <Link className="btn-secondary-hero" href="/contact#contact-form">
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

            <div className="tech-pillars-grid teaching-commitment-grid">
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
                <Link className="btn-cta-main" href="/contact#contact-form">
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
                <div className="kicker kicker-vertical">
                  <span className="kicker-line">● VISIT OUR COACHING CENTER</span>
                  <span className="kicker-sub-line">IN-PERSON DEMO CLASS</span>
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
                    <span>09:00 AM – 07:00 PM</span>
                  </div>
                  <div className="offline-chip">
                    <MapPin size={14} />
                    <span>Vijay Nagar Bypass</span>
                  </div>
                  <div className="offline-chip">
                    <Sparkles size={14} />
                    <span>Free Trial Demo Class</span>
                  </div>
                  <div className="offline-chip">
                    <Users size={14} />
                    <span>Small Batches (10–15)</span>
                  </div>
                </div>

                <div className="hero-actions" style={{ marginTop: "24px" }}>
                  <a
                    className="btn-primary-hero"
                    href="#contact-form"
                    onClick={(e) => {
                      e.preventDefault();
                      const el = document.getElementById("contact-form") || document.getElementById("book-demo");
                      if (el) {
                        el.scrollIntoView({ behavior: "smooth", block: "start" });
                        const firstInput = el.querySelector("input") as HTMLInputElement | null;
                        if (firstInput) setTimeout(() => firstInput.focus({ preventScroll: true }), 400);
                      }
                    }}
                  >
                    <span>Book Free Trial Demo Class</span>
                    <ArrowRight size={17} />
                  </a>
                  <a className="btn-secondary-hero" href="#campus-directory">
                    <Building2 size={16} />
                    <span>View Campus Details</span>
                  </a>
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

          {/* Contact Info + Inquiry Form Section */}
          <section className="catalog-content-section contact-body-section">
            <div className="contact-main-grid">
              {/* Left Column: Campus Info Cards */}
              <div className="contact-dir-column" id="campus-directory">
                <div className="section-kicker" style={{ marginBottom: "12px" }}>
                  <MapPin size={13} />
                  <span>CAMPUS DIRECTORY</span>
                </div>
                <h2 className="contact-section-title">
                  Campus Contact &amp; Location
                </h2>
                <p className="contact-section-subtitle">
                  Visit our classroom for in-person counseling or connect directly with our mentors.
                </p>

                <div className="contact-cards-stack">
                  {/* Address Card */}
                  <div className="contact-info-card">
                    <div className="pillar-icon-box icon-box-dev" style={{ width: "44px", height: "44px", minWidth: "44px", marginBottom: 0 }}>
                      <MapPin size={20} />
                    </div>
                    <div className="contact-info-body">
                      <h4>Physical Campus Address</h4>
                      <p>{address}</p>
                      <span className="contact-sub-highlight">
                        🚇 200m walk from Metro Station &bull; Visitor parking available
                      </span>
                    </div>
                  </div>

                  {/* Phone Helpline Card */}
                  <div className="contact-info-card">
                    <div className="pillar-icon-box icon-box-net" style={{ width: "44px", height: "44px", minWidth: "44px", marginBottom: 0 }}>
                      <Phone size={20} />
                    </div>
                    <div className="contact-info-body">
                      <h4>Admissions Desk &amp; Helpline</h4>
                      <a href={`tel:${phone.replace(/\s+/g, "")}`} className="contact-action-link contact-phone-link">
                        <span>{phone}</span>
                        <ArrowRight size={14} />
                      </a>
                      <span className="contact-sub-note">
                        Direct calls &amp; WhatsApp counseling available Mon–Sat
                      </span>
                    </div>
                  </div>

                  {/* Email Card */}
                  <div className="contact-info-card">
                    <div className="pillar-icon-box icon-box-os" style={{ width: "44px", height: "44px", minWidth: "44px", marginBottom: 0 }}>
                      <Mail size={20} />
                    </div>
                    <div className="contact-info-body">
                      <h4>Official Email</h4>
                      <a href={`mailto:${email}`} className="contact-action-link contact-email-link">
                        <span>{email}</span>
                      </a>
                      <span className="contact-sub-note">
                        Send inquiries for syllabus PDFs or corporate training
                      </span>
                    </div>
                  </div>

                  {/* Visiting Hours Card */}
                  <div className="contact-info-card">
                    <div className="pillar-icon-box icon-box-data" style={{ width: "44px", height: "44px", minWidth: "44px", marginBottom: 0 }}>
                      <Clock size={20} />
                    </div>
                    <div className="contact-info-body">
                      <h4>Center Walk-in Hours</h4>
                      <p>{hours}</p>
                      <span className="contact-sub-highlight" style={{ color: "#34d399" }}>
                        ● Walk-ins welcome anytime during open hours
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Inquiry & Demo Booking Form */}
              <div className="contact-form-column" id="contact-form">
                <InquiryForm />
              </div>
            </div>

            {/* Campus Visit FAQs (Full Width Section below) */}
            <div className="contact-faqs-section">
              <div className="contact-faqs-header">
                <div className="section-kicker">
                  <HelpCircle size={13} />
                  <span>FREQUENT QUESTIONS</span>
                </div>
                <h3>Campus Visit &amp; Walk-in FAQs</h3>
                <p>Everything you need to know before visiting our offline coaching center.</p>
              </div>

              <div className="contact-faqs-grid">
                <div className="contact-faq-card">
                  <div className="contact-faq-badge">01</div>
                  <strong>Do I need an appointment before visiting?</strong>
                  <p>
                    No appointment is necessary! You are welcome to walk in between 9:00 AM and 7:00 PM Monday through Saturday. Our teachers and counselors are always present in the center to show you the lab.
                  </p>
                </div>

                <div className="contact-faq-card">
                  <div className="contact-faq-badge">02</div>
                  <strong>Do I need to bring my own laptop?</strong>
                  <p>
                    Yes, carrying your own laptop is necessary for daily coding practice. Every desk has dedicated power charging sockets and fast Wi-Fi so you code directly on your personal machine and keep all your projects safe.
                  </p>
                </div>

                <div className="contact-faq-card">
                  <div className="contact-faq-badge">03</div>
                  <strong>Can I attend a free demo class before enrolling?</strong>
                  <p>
                    Yes! We offer a free trial demo class. Just bring your laptop, sit in the classroom, experience how our teachers break down concepts, and see if our practical teaching style feels right for you.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {/* 3. COMPREHENSIVE SMART ACCORDION FOOTER */}
      <Footer name={name} address={address} phone={phone} email={email} hours={hours} />
    </main>
  );
}
