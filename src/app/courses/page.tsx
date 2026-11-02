"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { Navbar } from "@/components/navbar";
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
    title: "Full-Stack & Distributed Systems",
    category: "Web Development",
    isFeatured: true,
    shortDescription: "Build production-grade web applications, microservices, and real-time distributed platforms from scratch.",
    durationMonths: 6,
    monthlyFee: 6000,
    level: "intermediate",
    perks: [
      "Dedicated dual-monitor Linux workstation",
      "Production deployment to live cloud clusters",
      "Daily 1:1 desk mentor code reviews",
    ],
    techTags: ["Next.js", "TypeScript", "Node.js", "Go", "PostgreSQL", "Docker", "Redis"],
  },
  {
    _id: "c-networking",
    slug: "computer-networks",
    title: "Computer Networks & Cloud Infrastructure",
    category: "Networking",
    isFeatured: true,
    shortDescription: "Master TCP/IP, Cisco routing, switches, Wireshark packet capture, VLANs, firewalls, and cloud architecture.",
    durationMonths: 4,
    monthlyFee: 5500,
    level: "intermediate",
    perks: [
      "Physical Cisco switch & router rack access",
      "Live packet tracing & Wireshark protocol lab",
      "Hands-on subnetting & enterprise firewall setup",
    ],
    techTags: ["TCP/IP", "Cisco Catalyst", "Wireshark", "BGP/OSPF", "Linux Netfilter", "Cloud LAN"],
  },
  {
    _id: "c-os-kernel",
    slug: "operating-systems-kernel",
    title: "Operating Systems & Kernel Programming",
    category: "Operating Systems",
    isFeatured: true,
    shortDescription: "Deep dive into Linux kernel internals, process scheduling, memory virtualization, system calls, C and Rust.",
    durationMonths: 5,
    monthlyFee: 6500,
    level: "advanced",
    perks: [
      "Custom Linux kernel compilation in lab",
      "POSIX threads, mutexes & virtual memory allocators",
      "Desk mentor segfault & GDB debugging sessions",
    ],
    techTags: ["C/C++", "Rust", "Linux Kernel", "POSIX", "Syscalls", "Memory Virtualization", "GDB"],
  },
  {
    _id: "c-dsa",
    slug: "data-structures-algorithms",
    title: "Data Structures & High-Scale Systems",
    category: "Computer Science",
    isFeatured: false,
    shortDescription: "Crack tier-1 technical interviews with rigorous problem solving, graph algorithms, and whiteboard system design.",
    durationMonths: 4,
    monthlyFee: 5000,
    level: "intermediate",
    perks: [
      "Floor-to-ceiling physical whiteboard mock rounds",
      "400+ LeetCode patterns with algorithmic proofs",
      "In-person weekly speed-coding sprints",
    ],
    techTags: ["Trees & Graphs", "Dynamic Programming", "System Design", "Concurrency", "High-Scale"],
  },
  {
    _id: "c-backend",
    slug: "backend-development",
    title: "Backend Architecture & Distributed APIs",
    category: "Backend",
    isFeatured: false,
    shortDescription: "Design fault-tolerant backend services, database schema optimization, caching pipelines, and gRPC APIs.",
    durationMonths: 4,
    monthlyFee: 5500,
    level: "intermediate",
    perks: [
      "Benchmarking under 100k requests/sec",
      "Live SQL query tuning & index optimization",
      "1:1 architectural design reviews",
    ],
    techTags: ["Node.js", "Go", "PostgreSQL", "gRPC", "Kafka", "Redis"],
  },
  {
    _id: "c-netsec",
    slug: "network-security",
    title: "Network Security & Packet Defense",
    category: "Networking",
    isFeatured: false,
    shortDescription: "Inspect network traffic, configure intrusion detection, harden Linux servers, and audit infrastructure defenses.",
    durationMonths: 4,
    monthlyFee: 6000,
    level: "intermediate",
    perks: [
      "Simulated campus red/blue team attack drills",
      "Hardware packet sniffer & MITM interception lab",
      "Enterprise security compliance certification",
    ],
    techTags: ["Wireshark", "Snort IDS", "iptables", "OpenVPN", "Nmap", "SSL/TLS Internals"],
  },
  {
    _id: "c-lowlevel",
    slug: "low-level-systems",
    title: "Low-Level Systems Programming (C & Rust)",
    category: "Operating Systems",
    isFeatured: false,
    shortDescription: "Direct hardware interfacing, embedded device drivers, memory allocators, and assembly basics.",
    durationMonths: 4,
    monthlyFee: 6000,
    level: "advanced",
    perks: [
      "Bare-metal programming on lab boards",
      "Zero-cost abstractions in Rust",
      "Desk-side pointer & register debugging",
    ],
    techTags: ["C", "Rust", "Assembly", "Device Drivers", "Valgrind", "ARM / x86_64"],
  },
  {
    _id: "c-frontend",
    slug: "frontend-development",
    title: "Frontend Engineering & Interactive Web",
    category: "Web Development",
    isFeatured: false,
    shortDescription: "Build sleek, responsive web applications with TypeScript, React, Tailwind CSS, and state machines.",
    durationMonths: 3,
    monthlyFee: 4500,
    level: "beginner",
    perks: [
      "Pixel-perfect responsive design drills",
      "Web performance & Core Web Vitals optimization",
      "1:1 mentor code audits",
    ],
    techTags: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Framer Motion", "State Management"],
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
        (selectedTrack === "dev" && (c.category.includes("Web") || c.category.includes("Backend"))) ||
        (selectedTrack === "net" && c.category.includes("Network")) ||
        (selectedTrack === "os" && (c.category.includes("Operating") || c.category.includes("Systems"))) ||
        (selectedTrack === "dsa" && (c.category.includes("Computer") || c.category.includes("Algorithm")));

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
    if (c.includes("network")) return "badge-networking";
    if (c.includes("operat") || c.includes("kernel") || c.includes("system")) return "badge-os-kernel";
    if (c.includes("computer") || c.includes("algorithm")) return "badge-dsa-systems";
    return "badge-web-dev";
  };

  const getTrackIcon = (category: string) => {
    const c = category.toLowerCase();
    if (c.includes("network")) return <Network size={26} color="#34d399" />;
    if (c.includes("operat") || c.includes("kernel")) return <Cpu size={26} color="#fbbf24" />;
    if (c.includes("computer") || c.includes("algorithm")) return <Layers size={26} color="#38bdf8" />;
    if (c.includes("backend")) return <Server size={26} color="#c084fc" />;
    return <Code2 size={26} color="#c084fc" />;
  };

  return (
    <main className="courses-redesign">
      {/* 1. STICKY GLASS HEADER */}
      <Navbar activePage="courses" />

      {/* 2. COURSES CATALOG HERO */}
      <section className="courses-catalog-hero">
        <div className="courses-hero-inner">
          <div className="courses-hero-copy">
            <div className="kicker">
              <span className="pulse-dot" />
              <span>IN-PERSON CLASSROOM &amp; HARDWARE LABS</span>
            </div>
            <h1>
              Master the Machine. <br />
              <span className="gradient-text-purple">Real Engineering Depth.</span>
            </h1>
            <p className="lead">
              Practical, instructor-led offline cohorts designed for hands-on building.
              From Full-Stack distributed web platforms to Cisco hardware routing and Linux kernel internals —
              learn side-by-side with senior mentors.
            </p>

            <div className="offline-chips-row">
              <div className="offline-chip">
                <Monitor size={14} />
                <span>Dedicated Dual-Screen Desks</span>
              </div>
              <div className="offline-chip">
                <Network size={14} />
                <span>Physical Cisco Switch &amp; Rack Labs</span>
              </div>
              <div className="offline-chip">
                <Cpu size={14} />
                <span>Linux Kernel &amp; Systems Terminal</span>
              </div>
              <div className="offline-chip">
                <Users size={14} />
                <span>2-Min Desk Mentoring</span>
              </div>
            </div>
          </div>

          {/* Right: Live Lab Workstation Specs Card */}
          <div className="lab-specs-card">
            <div className="lab-specs-header">
              <div className="lab-specs-title">
                <Terminal size={15} color="#c084fc" />
                <span>OFFLINE LAB SPECIFICATIONS</span>
              </div>
              <div className="lab-status-badge">
                <span className="pulse-dot" />
                <span>LAB OPEN (09:00 - 21:00)</span>
              </div>
            </div>

            <div className="lab-specs-grid">
              <div className="spec-item">
                <Monitor size={18} />
                <div>
                  <strong>Dual 27&quot; 4K IPS Rigs</strong>
                  <span>Ubuntu 24.04 &amp; Arch Dual-Boot</span>
                </div>
              </div>
              <div className="spec-item">
                <Wifi size={18} />
                <div>
                  <strong>10 Gbps Campus Fiber</strong>
                  <span>Dedicated Gigabit LAN to Each Desk</span>
                </div>
              </div>
              <div className="spec-item">
                <Network size={18} />
                <div>
                  <strong>Cisco Catalyst 3850 Rack</strong>
                  <span>Managed Switches &amp; Packet Bay</span>
                </div>
              </div>
              <div className="spec-item">
                <Users size={18} />
                <div>
                  <strong>1:1 Desk Mentorship</strong>
                  <span>Instant GDB &amp; Wireshark Debugging</span>
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
            className={`track-tab-btn ${selectedTrack === "dev" ? "active" : ""}`}
            onClick={() => setSelectedTrack("dev")}
          >
            <Code2 size={14} />
            <span>Full-Stack &amp; Systems Dev</span>
          </button>
          <button
            className={`track-tab-btn ${selectedTrack === "net" ? "active" : ""}`}
            onClick={() => setSelectedTrack("net")}
          >
            <Network size={14} />
            <span>Computer Networks &amp; Cisco</span>
          </button>
          <button
            className={`track-tab-btn ${selectedTrack === "os" ? "active" : ""}`}
            onClick={() => setSelectedTrack("os")}
          >
            <Cpu size={14} />
            <span>Operating Systems &amp; Kernel</span>
          </button>
          <button
            className={`track-tab-btn ${selectedTrack === "dsa" ? "active" : ""}`}
            onClick={() => setSelectedTrack("dsa")}
          >
            <Layers size={14} />
            <span>DSA &amp; Whiteboard Design</span>
          </button>
        </div>

        {/* Search & Dropdown Filters */}
        <div className="course-filter-bar">
          <label>
            <Search />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by topic, e.g. Linux Kernel, Wireshark, Next.js, TCP/IP, C++, Docker..."
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
            <option value="beginner">Beginner (Foundations)</option>
            <option value="intermediate">Intermediate (Systems &amp; Network)</option>
            <option value="advanced">Advanced (Kernel &amp; Architecture)</option>
          </select>

          <select value={duration} onChange={(e) => setDuration(e.target.value)}>
            <option value="">All Durations</option>
            <option value="short">Up to 3 Months (Intensive)</option>
            <option value="medium">4–6 Months (Comprehensive)</option>
            <option value="long">More than 6 Months (Flagship)</option>
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
                "Dedicated dual-monitor workstation",
                "Physical hardware & lab rack testing",
                "Daily 1:1 desk mentor code reviews",
              ];
              const techTags = course.techTags ?? ["Offline Lab", "Hands-on Projects", "Career Prep"];

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
            <b>2-Minute Desk Debugging</b>
            <small>
              Raise your hand when you hit a segmentation fault or broken packet route. Mentors debug with you live at your desk.
            </small>
          </div>
        </div>

        <div className="benefit-card-box">
          <div className="benefit-icon-wrap">
            <Network size={22} />
          </div>
          <div className="benefit-text-wrap">
            <b>Physical Hardware &amp; Cisco Racks</b>
            <small>
              Crimp Ethernet cables, configure enterprise managed switches, inspect live packets, and build real infrastructure.
            </small>
          </div>
        </div>

        <div className="benefit-card-box">
          <div className="benefit-icon-wrap">
            <Users size={22} />
          </div>
          <div className="benefit-text-wrap">
            <b>Peer Coding Cohorts &amp; Standups</b>
            <small>
              Code 10+ hours a day alongside motivated engineers, whiteboard system design problems, and join weekly offline hackathons.
            </small>
          </div>
        </div>
      </section>

      {/* 6. CAMPUS WALK-IN BANNER */}
      <section className="campus-cta-shell" style={{ marginTop: "40px" }}>
        <div className="campus-cta-card">
          <div className="cta-left">
            <h2>Experience the Coding Lab in Person Before Enrolling.</h2>
            <p>
              Walk into our campus today. Sit at a workstation, explore our Cisco hardware racks,
              meet our senior engineering mentors, and take a free 1-hour hands-on coding trial.
            </p>

            <div className="cta-contact-chips">
              <div className="contact-chip">
                <MapPin size={15} color="#38bdf8" />
                <span>Tech Park Hub, 4th Floor, Koramangala / Indiranagar</span>
              </div>
              <div className="contact-chip">
                <Clock size={15} color="#10b981" />
                <span>Walk-in Hours: Mon - Sat 9:00 AM - 8:30 PM</span>
              </div>
              <div className="contact-chip">
                <Phone size={15} color="#c084fc" />
                <span>Campus Helpline: +91 98765 43210</span>
              </div>
            </div>
          </div>

          <div className="cta-right">
            <Link className="btn-cta-main" href="/register">
              <span>Book Free 1-Day Lab Trial</span>
              <ArrowRight size={18} />
            </Link>
            <Link className="btn-cta-ghost" href="/contact">
              <Mail size={16} />
              <span>Contact Admissions Desk</span>
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
              <a className="social-btn" href="mailto:admissions@elitecodingschool.com" aria-label="Email">
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
                Elite Tech Campus, 3rd &amp; 4th Floor, Innovation Tower, 100 Feet Road, Near Metro Station.
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
                  <a href="#" onClick={(e) => { e.preventDefault(); setSelectedTrack("dev"); }}>
                    <ChevronRight size={13} /> Full-Stack Development
                  </a>
                </li>
                <li>
                  <a href="#" onClick={(e) => { e.preventDefault(); setSelectedTrack("net"); }}>
                    <ChevronRight size={13} /> Computer Networks &amp; CCNA
                  </a>
                </li>
                <li>
                  <a href="#" onClick={(e) => { e.preventDefault(); setSelectedTrack("os"); }}>
                    <ChevronRight size={13} /> Linux &amp; OS Kernel Internals
                  </a>
                </li>
                <li>
                  <a href="#" onClick={(e) => { e.preventDefault(); setSelectedTrack("os"); }}>
                    <ChevronRight size={13} /> Low-Level Systems (C / Rust)
                  </a>
                </li>
                <li>
                  <a href="#" onClick={(e) => { e.preventDefault(); setSelectedTrack("dsa"); }}>
                    <ChevronRight size={13} /> Data Structures &amp; System Design
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
                  <span>+91 98765 43210 (Admissions)</span>
                </li>
                <li>
                  <Mail size={15} />
                  <span>admissions@elitecodingschool.com</span>
                </li>
                <li>
                  <Clock size={15} />
                  <span>Lab Hours: 9:00 AM - 9:00 PM (Mon-Sat)</span>
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
            <span>&copy; {new Date().getFullYear()} Elite Coding School. All rights reserved. Built for ambitious engineers.</span>
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
