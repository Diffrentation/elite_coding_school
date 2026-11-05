"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { Navbar } from "@/components/navbar";
import { CopyrightYear } from "@/components/copyright-year";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock,
  Code2,
  Cpu,
  Globe,
  IndianRupee,
  Layers,
  Mail,
  MapPin,
  Monitor,
  Network,
  Phone,
  Radio,
  Search,
  Server,
  ShieldCheck,
  Sparkles,
  Terminal,
  Users,
  Wifi,
  X,
  Zap,
} from "lucide-react";

type Course = {
  _id: string;
  slug: string;
  title: string;
  icon?: string;
  category: string;
  isFeatured?: boolean;
  shortDescription: string;
  durationMonths: number;
  monthlyFee: number;
  level: string;
  perks?: string[];
  techTags?: string[];
};

const CURATED_OFFLINE_COURSES: Course[] = [
  {
    _id: "c-fullstack",
    slug: "full-stack-development",
    title: "Full-Stack MERN & Next.js Development",
    category: "MERN Stack",
    isFeatured: true,
    shortDescription: "Learn to build complete production-grade web applications from scratch with React, Next.js, Node.js, Express, and MongoDB.",
    durationMonths: 4,
    monthlyFee: 1900,
    level: "beginner",
    perks: [
      "Daily coding on your laptop with live guidance",
      "Build 5+ full-stack projects with Git & GitHub",
      "1:1 teacher debugging whenever you hit an error",
    ],
    techTags: ["MongoDB", "Express.js", "React.js", "Node.js", "Next.js", "Tailwind CSS", "Git/GitHub"],
  },
  {
    _id: "c-frontend",
    slug: "frontend-development",
    title: "Frontend Development, Tailwind CSS & GSAP",
    category: "MERN Stack",
    isFeatured: true,
    shortDescription: "Master modern responsive design, UI component libraries, React.js, and slick interactive animations with GSAP and Tailwind CSS.",
    durationMonths: 3,
    monthlyFee: 1900,
    level: "beginner",
    perks: [
      "Pixel-perfect responsive layout techniques",
      "Interactive animations using GSAP & modern UI kits",
      "Clean component architecture & state management",
    ],
    techTags: ["HTML5/CSS3", "JavaScript (ES6+)", "React.js", "Tailwind CSS", "GSAP Animations", "Git/GitHub"],
  },
  {
    _id: "c-backend",
    slug: "backend-development",
    title: "Backend Development & REST APIs with MongoDB",
    category: "MERN Stack",
    isFeatured: false,
    shortDescription: "Build robust backend servers, RESTful APIs, JWT authentication, and database schemas with Node.js, Express, and MongoDB.",
    durationMonths: 3,
    monthlyFee: 1900,
    level: "intermediate",
    perks: [
      "Hands-on API design & Postman testing",
      "Database schema modeling with Mongoose",
      "Teacher reviews your code line-by-line",
    ],
    techTags: ["Node.js", "Express.js", "MongoDB", "Mongoose", "REST APIs", "JWT Auth", "Postman"],
  },
  {
    _id: "c-dsa",
    slug: "data-structures-algorithms",
    title: "Data Structures & Algorithms (DSA)",
    category: "DSA & Logic",
    isFeatured: true,
    shortDescription: "Master logic building, algorithmic thinking, and problem solving from scratch with whiteboard explanations and live coding.",
    durationMonths: 3,
    monthlyFee: 1900,
    level: "beginner",
    perks: [
      "Step-by-step logic explained on the whiteboard",
      "100+ solved problems in C++ or Java",
      "Direct 1:1 desk problem-solving help",
    ],
    techTags: ["C++", "Java", "Arrays & Strings", "Recursion", "Trees & Graphs", "Time Complexity"],
  },
  {
    _id: "c-system-design",
    slug: "system-design",
    title: "System Design & Scalable Architecture",
    category: "DSA & System Design",
    isFeatured: true,
    shortDescription: "Learn High-Level (HLD) & Low-Level Design (LLD), microservices, load balancers, caching, and scalable architecture with whiteboard case studies.",
    durationMonths: 3,
    monthlyFee: 1900,
    level: "intermediate",
    perks: [
      "Whiteboard breakdowns of real-world scalable systems",
      "HLD & LLD: Microservices, Redis, Nginx & DB sharding",
      "Case studies: WhatsApp, URL Shortener & Netflix architecture",
    ],
    techTags: ["System Design", "HLD / LLD", "Microservices", "Redis", "Load Balancers", "DB Sharding", "Scalability"],
  },
  {
    _id: "c-cpp",
    slug: "c-cpp-programming",
    title: "C & C++ Programming Foundations",
    category: "Programming Languages",
    isFeatured: false,
    shortDescription: "Start programming from absolute zero. Understand memory management, pointers, and Object-Oriented Programming (OOP) in C++.",
    durationMonths: 3,
    monthlyFee: 1900,
    level: "beginner",
    perks: [
      "Complete zero-level start with simple explanations",
      "Deep understanding of memory, pointers & logic",
      "College academics & foundational coding prep",
    ],
    techTags: ["C Language", "C++", "Pointers", "OOP (Classes & Objects)", "STL Basics", "Problem Solving"],
  },
  {
    _id: "c-java",
    slug: "java-programming",
    title: "Core Java & Object-Oriented Programming",
    category: "Programming Languages",
    isFeatured: false,
    shortDescription: "Learn Core Java from the ground up: classes, inheritance, interfaces, exception handling, and the Collections framework.",
    durationMonths: 3,
    monthlyFee: 1900,
    level: "beginner",
    perks: [
      "Clear object-oriented mindset from day one",
      "Hands-on Java exercises every single class",
      "Teacher helps you debug logic on your laptop",
    ],
    techTags: ["Core Java", "OOP Concepts", "Collections Framework", "Exceptions", "File I/O", "Git"],
  },
  {
    _id: "c-python",
    slug: "python-programming",
    title: "Python Programming & Logic Building",
    category: "Programming Languages",
    isFeatured: false,
    shortDescription: "Learn beginner-friendly Python programming, clean syntax, logic building, data handling, and automation scripting.",
    durationMonths: 2.5,
    monthlyFee: 1900,
    level: "beginner",
    perks: [
      "Easiest language to start your coding journey",
      "Daily coding challenges and logic drills",
      "Build practical automation and utility scripts",
    ],
    techTags: ["Python 3", "Data Structures", "Functions", "Automation Scripts", "Logic Building", "Git"],
  },
  {
    _id: "c-networking",
    slug: "computer-networks",
    title: "Computer Networks Fundamentals From Scratch",
    category: "Networking & Systems",
    isFeatured: true,
    shortDescription: "Understand how the internet, routers, switches, IP addressing, and networking protocols work with clear whiteboard demos and laptop exercises.",
    durationMonths: 3,
    monthlyFee: 1900,
    level: "beginner",
    perks: [
      "Taught from absolute zero with whiteboard diagrams",
      "Practical Wi-Fi, router & LAN setup demos",
      "Hands-on packet inspection with Wireshark",
    ],
    techTags: ["TCP/IP", "IP Subnetting", "DNS/DHCP", "Wireshark", "Routers & LAN", "Network Tools"],
  },
  {
    _id: "c-os",
    slug: "operating-systems-kernel",
    title: "Linux & Operating Systems From Scratch",
    category: "Networking & Systems",
    isFeatured: true,
    shortDescription: "Master the Linux command line, bash automation scripts, process management, memory concepts, and foundational C programming from scratch.",
    durationMonths: 3,
    monthlyFee: 1900,
    level: "beginner",
    perks: [
      "Complete zero-level start on your laptop terminal",
      "Hands-on bash scripting & task automation",
      "Understand processes, memory & file systems",
    ],
    techTags: ["Linux Terminal", "Bash Scripting", "Processes & Memory", "File Permissions", "C Basics", "Git"],
  },
];

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("");
  const [duration, setDuration] = useState("");
  const [selectedTrack, setSelectedTrack] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      const q = new URLSearchParams({
        ...(search && { search }),
        ...(level && { level }),
        ...(duration && { duration }),
        ...(selectedTrack !== "all" && { category: selectedTrack }),
      });

      fetch(`/api/courses?${q}`)
        .then(async (r) => {
          if (!r.ok) throw new Error();
          const b = await r.json();
          const apiCourses: Course[] = b.data?.courses ?? [];
          // Filter out dummy test courses like 'Velit dolorem' with fee 6
          const validApiCourses = apiCourses.filter(
            (c) => c.title && !c.title.toLowerCase().includes("velit") && c.monthlyFee > 100,
          );
          if (validApiCourses.length > 0) {
            setCourses(validApiCourses);
          } else {
            // Use curated offline courses catalog with matching search/filter
            setCourses(CURATED_OFFLINE_COURSES);
          }
        })
        .catch(() => {
          setCourses(CURATED_OFFLINE_COURSES);
        })
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(timer);
  }, [search, level, duration, selectedTrack]);

  // Client-side filtering on curated courses if fallback active
  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const matchSearch =
        !search ||
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.shortDescription.toLowerCase().includes(search.toLowerCase()) ||
        (c.techTags && c.techTags.some((t) => t.toLowerCase().includes(search.toLowerCase())));

      const matchLevel = !level || c.level.toLowerCase() === level.toLowerCase();

      const matchDuration =
        !duration ||
        (duration === "short" && c.durationMonths <= 3) ||
        (duration === "medium" && c.durationMonths >= 4 && c.durationMonths <= 6) ||
        (duration === "long" && c.durationMonths >= 7);

      const matchTrack =
        selectedTrack === "all" ||
        c.category.toLowerCase().includes(selectedTrack.toLowerCase()) ||
        (selectedTrack === "mern" && (c.category.includes("MERN") || c.category.includes("Web") || c.category.includes("Backend"))) ||
        (selectedTrack === "core" && (c.category.includes("Languages") || c.category.includes("Foundations"))) ||
        (selectedTrack === "dsa" && (c.category.includes("DSA") || c.category.includes("Logic"))) ||
        (selectedTrack === "systems" && (c.category.includes("Networking") || c.category.includes("Systems") || c.category.includes("Operating")));

      return matchSearch && matchLevel && matchDuration && matchTrack;
    });
  }, [courses, search, level, duration, selectedTrack]);

  const clear = () => {
    setSearch("");
    setLevel("");
    setDuration("");
    setSelectedTrack("all");
  };

  const getTrackBadgeClass = (category: string) => {
    const c = category.toLowerCase();
    if (c.includes("network") || c.includes("system")) return "badge-networking";
    if (c.includes("language") || c.includes("foundations")) return "badge-os-kernel";
    if (c.includes("dsa") || c.includes("logic")) return "badge-dsa-systems";
    return "badge-web-dev";
  };

  const getTrackIcon = (category: string) => {
    const c = category.toLowerCase();
    if (c.includes("network") || c.includes("system")) return <Network size={26} color="#34d399" />;
    if (c.includes("dsa") || c.includes("logic")) return <Layers size={26} color="#38bdf8" />;
    if (c.includes("language") || c.includes("foundations")) return <Cpu size={26} color="#fbbf24" />;
    if (c.includes("backend")) return <Server size={26} color="#c084fc" />;
    return <Code2 size={26} color="#c084fc" />;
  };

  return (
    <main className="courses-redesign courses-page">
      {/* 1. STICKY GLASS HEADER */}
      <Navbar activePage="courses" />

      {/* 2. COURSES CATALOG HERO */}
      <section className="courses-catalog-hero">
        <div className="courses-hero-inner">
          <div className="courses-hero-copy">
            <div className="kicker">
              <span className="pulse-dot" />
              <span>OFFLINE CLASSROOM PROGRAMS &bull; IN-PERSON TEACHING</span>
            </div>
            <h1>
              Practical Tech Courses. <br />
              <span className="gradient-text-purple">Genuine, Teacher-Led Classes.</span>
            </h1>
            <p className="lead">
              Every course is taught offline in our classroom. We focus on real concept clarity,
              daily hands-on coding practice, and personal teacher guidance from scratch so every student learns with confidence.
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
                <span>Daily Laptop Coding in Class</span>
              </div>
              <div className="offline-chip">
                <Sparkles size={14} />
                <span>1:1 Teacher Doubt Solving</span>
              </div>
            </div>
          </div>

          {/* Right: Live Lab Workstation Specs Card */}
          <div className="lab-specs-card">
            <div className="lab-specs-header">
              <div className="lab-specs-title">
                <Terminal size={15} color="#c084fc" />
                <span>CLASSROOM FACILITIES &amp; SETUP</span>
              </div>
              <div className="lab-status-badge">
                <span className="pulse-dot" />
                <span>NEW BATCH OPEN (09:00 - 19:00)</span>
              </div>
            </div>

            <div className="lab-specs-grid">
              <div className="spec-item">
                <Monitor size={18} />
                <div>
                  <strong>Comfortable Coding Desks</strong>
                  <span>Dedicated Power Sockets for Laptops</span>
                </div>
              </div>
              <div className="spec-item">
                <Wifi size={18} />
                <div>
                  <strong>High-Speed Classroom Wi-Fi</strong>
                  <span>Fast Internet for Coding &amp; Git</span>
                </div>
              </div>
              <div className="spec-item">
                <Layers size={18} />
                <div>
                  <strong>Projector &amp; Whiteboard Demos</strong>
                  <span>Live Concept Building on Screen</span>
                </div>
              </div>
              <div className="spec-item">
                <Users size={18} />
                <div>
                  <strong>Direct Teacher Mentorship</strong>
                  <span>1:1 Desk Help for Every Error</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. INTERACTIVE FILTER SUITE */}
      <section className="catalog-filter-section">
        {/* Quick Domain Filter Tabs */}
        <div className="quick-track-tabs">
          <button
            className={`track-tab-btn ${selectedTrack === "all" ? "active" : ""}`}
            onClick={() => setSelectedTrack("all")}
          >
            All Tracks ({courses.length})
          </button>
          <button
            className={`track-tab-btn ${selectedTrack === "mern" ? "active" : ""}`}
            onClick={() => setSelectedTrack("mern")}
          >
            <Code2 size={14} />
            <span>MERN Stack &amp; Next.js</span>
          </button>
          <button
            className={`track-tab-btn ${selectedTrack === "core" ? "active" : ""}`}
            onClick={() => setSelectedTrack("core")}
          >
            <Cpu size={14} />
            <span>C, C++, Java &amp; Python</span>
          </button>
          <button
            className={`track-tab-btn ${selectedTrack === "dsa" ? "active" : ""}`}
            onClick={() => setSelectedTrack("dsa")}
          >
            <Layers size={14} />
            <span>DSA &amp; System Design</span>
          </button>
          <button
            className={`track-tab-btn ${selectedTrack === "systems" ? "active" : ""}`}
            onClick={() => setSelectedTrack("systems")}
          >
            <Network size={14} />
            <span>Networking &amp; Linux OS</span>
          </button>
        </div>

        {/* Search & Dropdown Filters */}
        <div className="course-filter-bar">
          <label>
            <Search />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by topic, e.g. React, Next.js, MongoDB, Node.js, Networking, Linux, C++, Java, Python, DSA..."
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                style={{ background: "none", border: 0, color: "#8b92b6", cursor: "pointer" }}
              >
                <X size={16} />
              </button>
            )}
          </label>

          <select value={level} onChange={(e) => setLevel(e.target.value)}>
            <option value="">All Experience Levels</option>
            <option value="beginner">Beginner (Foundations from Zero)</option>
            <option value="intermediate">Intermediate (Web &amp; Core Dev)</option>
            <option value="advanced">Advanced (DSA, Architecture &amp; OS)</option>
          </select>

          <select value={duration} onChange={(e) => setDuration(e.target.value)}>
            <option value="">All Durations</option>
            <option value="short">Up to 3 Months (Foundations)</option>
            <option value="medium">4–6 Months (Full Track)</option>
            <option value="long">More than 6 Months (Mastery)</option>
          </select>
        </div>

        {/* Filter Summary */}
        <div className="filter-summary-row">
          <span className="active-results-badge">
            Showing <strong>{filteredCourses.length}</strong> In-Person Programs &bull; Offline Cohorts Enrolling
          </span>
          {(search || level || duration || selectedTrack !== "all") && (
            <button className="clear-filters-btn" onClick={clear}>
              <X size={14} />
              <span>Reset all filters</span>
            </button>
          )}
        </div>
      </section>

      {/* 4. COURSES GRID */}
      <section className="catalog-content-section">
        <div className="courses-grid">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <article className="course-skeleton" key={i} />)
          ) : filteredCourses.length > 0 ? (
            filteredCourses.map((course) => {
              const trackBadgeClass = getTrackBadgeClass(course.category);
              const trackIcon = getTrackIcon(course.category);
              const perks = course.perks ?? [
                "Small batches (10–15 students)",
                "Daily hands-on coding on your laptop",
                "1:1 teacher doubt solving at your desk",
              ];
              const techTags = course.techTags ?? ["Classroom Teaching", "Hands-on Projects", "Concept Clarity"];

              return (
                <article
                  className={`public-course-card ${course.isFeatured ? "featured" : ""}`}
                  key={course._id}
                >
                  <div className="card-header-top">
                    <span className={`card-track-badge ${trackBadgeClass}`}>
                      {course.category}
                    </span>
                    <span className="card-mode-pill">
                      <span className="pulse-dot" />
                      Offline Lab
                    </span>
                  </div>

                  <div className="card-icon-box" style={{ background: "rgba(255,255,255,0.04)" }}>
                    {trackIcon}
                  </div>

                  <h2>{course.title}</h2>
                  <p className="card-desc">{course.shortDescription}</p>

                  {/* Offline Perks Checklist */}
                  <ul className="card-perks-list">
                    {perks.slice(0, 3).map((perk) => (
                      <li key={perk}>
                        <CheckCircle2 size={15} />
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Tech Tags */}
                  <div className="card-tags-row">
                    {techTags.slice(0, 4).map((tag) => (
                      <span className="card-tech-tag" key={tag}>
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Metadata Box */}
                  <div className="course-metadata">
                    <span>
                      <small>Duration</small>
                      <b>{course.durationMonths} Months</b>
                    </span>
                    <span>
                      <small>Level</small>
                      <b style={{ textTransform: "capitalize" }}>{course.level}</b>
                    </span>
                    <span>
                      <small>Tuition</small>
                      <b style={{ color: "#38bdf8" }}>₹{course.monthlyFee.toLocaleString("en-IN")}/mo</b>
                    </span>
                  </div>

                  <Link className="card-action-btn" href={`/courses/${course.slug}`}>
                    <span>View Syllabus &amp; Lab Schedule</span>
                    <ArrowRight size={15} />
                  </Link>
                </article>
              );
            })
          ) : (
            <div className="courses-state" style={{ gridColumn: "1 / -1" }}>
              <h2>No courses match your criteria</h2>
              <p style={{ color: "#94a3b8", marginBottom: "20px" }}>
                Try adjusting your search query or selecting a different tech track.
              </p>
              <button onClick={clear}>Reset Filters</button>
            </div>
          )}
        </div>
      </section>

      {/* 5. WHY OFFLINE LAB BEATS ONLINE TUTORIALS STRIP */}
      <section className="course-benefits" id="why-offline">
        <div className="benefit-card-box">
          <div className="benefit-icon-wrap">
            <Zap size={22} />
          </div>
          <div className="benefit-text-wrap">
            <b>1:1 Teacher Doubt Solving</b>
            <small>
              Whenever you hit a bug or get stuck on a concept, teachers sit with you at your desk and guide you until you understand.
            </small>
          </div>
        </div>

        <div className="benefit-card-box">
          <div className="benefit-icon-wrap">
            <Monitor size={22} />
          </div>
          <div className="benefit-text-wrap">
            <b>Clean Desks &amp; Power Sockets</b>
            <small>
              Bring your laptop, plug into dedicated power sockets, connect to high-speed classroom Wi-Fi, and code comfortably.
            </small>
          </div>
        </div>

        <div className="benefit-card-box">
          <div className="benefit-icon-wrap">
            <Users size={22} />
          </div>
          <div className="benefit-text-wrap">
            <b>Small Batches (10–15 Students)</b>
            <small>
              We deliberately keep batch sizes small so that every single student gets direct teacher interaction and personal guidance.
            </small>
          </div>
        </div>
      </section>

      {/* 6. CAMPUS WALK-IN BANNER */}
      <section className="campus-cta-shell" style={{ marginTop: "40px" }}>
        <div className="campus-cta-card">
          <div className="cta-left">
            <h2>Attend a Free Trial Demo Class Before Deciding.</h2>
            <p>
              Visit our new coaching center today. Meet our teachers, sit in a real classroom session,
              experience our genuine teaching approach, and see if our practical coding style works for you.
            </p>

            <div className="cta-contact-chips">
              <div className="contact-chip">
                <MapPin size={15} color="#38bdf8" />
                <span>Vijay Nagar Bypass, Bagu</span>
              </div>
              <div className="contact-chip">
                <Clock size={15} color="#10b981" />
                <span>Visiting &amp; Demo Hours: Mon - Sat 9:00 AM - 7:00 PM</span>
              </div>
              <div className="contact-chip">
                <Phone size={15} color="#c084fc" />
                <span>Center Helpline: +91 9311278407</span>
              </div>
            </div>
          </div>

          <div className="cta-right">
            <Link className="btn-cta-main" href="/register">
              <span>Book Free Demo Class</span>
              <ArrowRight size={18} />
            </Link>
            <Link className="btn-cta-ghost" href="/contact">
              <Mail size={16} />
              <span>Contact Teachers Desk</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 7. COMPREHENSIVE FOOTER */}
      <footer className="site-footer" id="contact">
        <div className="footer-inner">
          <div className="footer-top-strip">
            <div className="footer-brand-lockup">
              <Link className="brand" href="/">
                <span className="brand-mark">&lt;/&gt;</span>
                <span>Elite Coding School</span>
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
              <a className="social-btn" href="mailto:bbhupender100@gmail.com" aria-label="Email">
                <Mail size={17} />
              </a>
            </div>
          </div>

          <div className="footer-columns">
            <div className="footer-col">
              <h4>Offline Coaching Center</h4>
              <p className="lead">
                A newly opened local coaching center started by passionate teachers focused on genuine, concept-first education in small batches.
              </p>
              <div className="footer-address-card">
                <strong>📍 Center Location:</strong>
                Vijay Nagar Bypass, Bagu
                <br />
                <span style={{ color: "#34d399", fontWeight: 600, display: "block", marginTop: "6px" }}>
                  ● Walk-ins &amp; Demo Classes welcome Mon-Sat (9 AM - 7 PM)
                </span>
              </div>
            </div>

            <div className="footer-col">
              <h4>Curriculum Verticals</h4>
              <ul className="footer-nav-list">
                <li>
                  <a href="#" onClick={(e) => { e.preventDefault(); setSelectedTrack("dev"); }}>
                    <ChevronRight size={13} /> Full-Stack Web Development
                  </a>
                </li>
                <li>
                  <a href="#" onClick={(e) => { e.preventDefault(); setSelectedTrack("net"); }}>
                    <ChevronRight size={13} /> Computer Networks Fundamentals
                  </a>
                </li>
                <li>
                  <a href="#" onClick={(e) => { e.preventDefault(); setSelectedTrack("os"); }}>
                    <ChevronRight size={13} /> Linux &amp; Operating Systems Basics
                  </a>
                </li>
                <li>
                  <a href="#" onClick={(e) => { e.preventDefault(); setSelectedTrack("dsa"); }}>
                    <ChevronRight size={13} /> Programming Logic &amp; DSA Basics
                  </a>
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
                  <span>+91 9311278407 (Admissions Desk)</span>
                </li>
                <li>
                  <Mail size={15} />
                  <span>bbhupender100@gmail.com</span>
                </li>
                <li>
                  <Clock size={15} />
                  <span>Center Hours: 9:00 AM - 7:00 PM (Mon-Sat)</span>
                </li>
                <li>
                  <Building2 size={15} />
                  <span>Vijay Nagar Bypass, Bagu</span>
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
            <span>&copy; <CopyrightYear /> Elite Coding School. Dedicated to genuine, practical teaching.</span>
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
