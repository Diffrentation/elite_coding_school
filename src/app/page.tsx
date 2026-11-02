"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import {
  ArrowRight,
  BookOpen,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Code2,
  Cpu,
  Globe,
  HardDrive,
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
  X,
  Zap,
} from "lucide-react";

type HeroBanner = {
  _id: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaUrl: string;
};

type SessionUser = { role: "admin" | "student" } | null;

type CourseItem = {
  title: string;
  slug: string;
  track: "mern" | "core" | "dsa" | "systems";
  trackLabel: string;
  description: string;
  duration: string;
  labHours: string;
  fee: string;
  perks: string[];
  techTags: string[];
};

const COURSES_DATA: CourseItem[] = [
  {
    title: "Full-Stack MERN & Next.js Development",
    slug: "full-stack-development",
    track: "mern",
    trackLabel: "MERN & Next.js",
    description: "Learn to build complete production-grade web applications from scratch with React, Next.js, Node.js, Express, and MongoDB.",
    duration: "4 Months",
    labHours: "120+ Class Hours",
    fee: "₹3,000 / mo",
    perks: [
      "Daily coding on your laptop with live guidance",
      "Build 5+ full-stack projects with Git & GitHub",
      "1:1 teacher debugging whenever you hit an error",
    ],
    techTags: ["MongoDB", "Express.js", "React.js", "Node.js", "Next.js", "Tailwind CSS", "Git/GitHub"],
  },
  {
    title: "Frontend Development, Tailwind CSS & GSAP",
    slug: "frontend-development",
    track: "mern",
    trackLabel: "Frontend & UI",
    description: "Master modern responsive design, UI component libraries, React.js, and slick interactive animations with GSAP and Tailwind CSS.",
    duration: "3 Months",
    labHours: "90+ Class Hours",
    fee: "₹2,500 / mo",
    perks: [
      "Pixel-perfect responsive layout techniques",
      "Interactive animations using GSAP & modern UI kits",
      "Clean component architecture & state management",
    ],
    techTags: ["HTML5/CSS3", "JavaScript (ES6+)", "React.js", "Tailwind CSS", "GSAP Animations", "Git/GitHub"],
  },
  {
    title: "Backend Development & REST APIs with MongoDB",
    slug: "backend-development",
    track: "mern",
    trackLabel: "Backend & DB",
    description: "Build robust backend servers, RESTful APIs, JWT authentication, and database schemas with Node.js, Express, and MongoDB.",
    duration: "3 Months",
    labHours: "90+ Class Hours",
    fee: "₹2,800 / mo",
    perks: [
      "Hands-on API design & Postman testing",
      "Database schema modeling with Mongoose",
      "Teacher reviews your code line-by-line",
    ],
    techTags: ["Node.js", "Express.js", "MongoDB", "Mongoose", "REST APIs", "JWT Auth", "Postman"],
  },
  {
    title: "Computer Networks Fundamentals From Scratch",
    slug: "computer-networks",
    track: "systems",
    trackLabel: "Networking",
    description: "Understand how the internet, routers, switches, IP addressing, and networking protocols work with clear whiteboard demos and laptop exercises.",
    duration: "3 Months",
    labHours: "90+ Class Hours",
    fee: "₹2,500 / mo",
    perks: [
      "Taught from absolute zero with whiteboard diagrams",
      "Practical Wi-Fi, router & LAN setup demos",
      "Hands-on packet inspection with Wireshark",
    ],
    techTags: ["TCP/IP", "IP Subnetting", "DNS/DHCP", "Wireshark", "Routers & LAN", "Network Tools"],
  },
  {
    title: "Linux & Operating Systems From Scratch",
    slug: "operating-systems-kernel",
    track: "systems",
    trackLabel: "OS & Linux",
    description: "Master the Linux command line, bash automation scripts, process management, memory concepts, and foundational C programming from scratch.",
    duration: "3 Months",
    labHours: "90+ Class Hours",
    fee: "₹2,500 / mo",
    perks: [
      "Complete zero-level start on your laptop terminal",
      "Hands-on bash scripting & task automation",
      "Understand processes, memory & file systems",
    ],
    techTags: ["Linux Terminal", "Bash Scripting", "Processes & Memory", "File Permissions", "C Basics", "Git"],
  },
  {
    title: "Data Structures & Algorithms (DSA)",
    slug: "data-structures-algorithms",
    track: "dsa",
    trackLabel: "DSA & Logic",
    description: "Master logic building, algorithmic thinking, and problem solving from scratch with whiteboard explanations and live coding.",
    duration: "3 Months",
    labHours: "90+ Class Hours",
    fee: "₹2,800 / mo",
    perks: [
      "Step-by-step logic explained on the whiteboard",
      "100+ solved problems in C++ or Java",
      "Direct 1:1 desk problem-solving help",
    ],
    techTags: ["C++", "Java", "Arrays & Strings", "Recursion", "Trees & Graphs", "Time Complexity"],
  },
  {
    title: "System Design & Scalable Architecture",
    slug: "system-design",
    track: "dsa",
    trackLabel: "System Design",
    description: "Learn High-Level (HLD) & Low-Level Design (LLD), microservices, load balancers, caching, and scalable architecture with whiteboard case studies.",
    duration: "3 Months",
    labHours: "90+ Class Hours",
    fee: "₹2,800 / mo",
    perks: [
      "Whiteboard breakdowns of real-world scalable systems",
      "HLD & LLD: Microservices, Redis, Nginx & DB sharding",
      "Case studies: WhatsApp, URL Shortener & Netflix architecture",
    ],
    techTags: ["System Design", "HLD / LLD", "Microservices", "Redis", "Load Balancers", "DB Sharding", "Scalability"],
  },
  {
    title: "C & C++ Programming Foundations",
    slug: "c-cpp-programming",
    track: "core",
    trackLabel: "C & C++",
    description: "Start programming from absolute zero. Understand memory management, pointers, and Object-Oriented Programming (OOP) in C++.",
    duration: "3 Months",
    labHours: "90+ Class Hours",
    fee: "₹2,500 / mo",
    perks: [
      "Complete zero-level start with simple explanations",
      "Deep understanding of memory, pointers & logic",
      "College academics & foundational coding prep",
    ],
    techTags: ["C Language", "C++", "Pointers", "OOP (Classes & Objects)", "STL Basics", "Problem Solving"],
  },
  {
    title: "Core Java & Object-Oriented Programming",
    slug: "java-programming",
    track: "core",
    trackLabel: "Java & OOP",
    description: "Learn Core Java from the ground up: classes, inheritance, interfaces, exception handling, and the Collections framework.",
    duration: "3 Months",
    labHours: "90+ Class Hours",
    fee: "₹2,500 / mo",
    perks: [
      "Clear object-oriented mindset from day one",
      "Hands-on Java exercises every single class",
      "Teacher helps you debug logic on your laptop",
    ],
    techTags: ["Core Java", "OOP Concepts", "Collections Framework", "Exceptions", "File I/O", "Git"],
  },
  {
    title: "Python Programming & Logic Building",
    slug: "python-programming",
    track: "core",
    trackLabel: "Python",
    description: "Learn beginner-friendly Python programming, clean syntax, logic building, data handling, and automation scripting.",
    duration: "2.5 Months",
    labHours: "75+ Class Hours",
    fee: "₹2,500 / mo",
    perks: [
      "Easiest language to start your coding journey",
      "Daily coding challenges and logic drills",
      "Build practical automation and utility scripts",
    ],
    techTags: ["Python 3", "Data Structures", "Functions", "Automation Scripts", "Logic Building", "Git"],
  },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<"mern" | "core" | "dsa">("mern");
  const [courseFilter, setCourseFilter] = useState<"all" | "mern" | "core" | "dsa" | "systems">("all");
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [activeBanner, setActiveBanner] = useState(0);

  useEffect(() => {
    fetch("/api/banners")
      .then((res) => res.json())
      .then((body) => setBanners(body.data?.banners ?? []))
      .catch(() => setBanners([]));
  }, []);

  useEffect(() => {
    if (banners.length < 2) return;
    const timer = window.setInterval(() => {
      setActiveBanner((current) => (current + 1) % banners.length);
    }, 7000);
    return () => window.clearInterval(timer);
  }, [banners.length]);

  const banner = banners.length ? banners[activeBanner % banners.length] : null;

  const filteredCourses =
    courseFilter === "all" ? COURSES_DATA : COURSES_DATA.filter((c) => c.track === courseFilter);

  return (
    <main className="home-page">
      {/* 1. SITE NAVIGATION */}
      <Navbar activePage="home" />

      {/* 2. HERO SECTION */}
      <section className="hero-shell" id="home">
        <div className="hero-grid">
          {/* Left Column: Hero Copy */}
          <div className="hero-copy">
            <div className="campus-banner-pill">
              <span className="pulse-dot" />
              <span>NEW BATCH STARTING &bull; OFFLINE COACHING CENTER</span>
              <span className="sub">Mon - Sat: 9:00 AM - 7:00 PM</span>
            </div>

            <h1>
              {banner?.title ?? (
                <>
                  Master MERN, Next.js, <br />
                  DSA &amp; System Design. <br />
                  <span className="gradient-text-purple">Genuine In-Person Teaching.</span>
                </>
              )}
            </h1>

            <p className="lead">
              {banner?.description ??
                "A newly opened offline coaching center created by passionate teachers. Bring your laptop and learn MERN Stack, Next.js, Tailwind, GSAP, DSA, System Design, and foundational coding (C, C++, Java, Python) from absolute scratch."}
            </p>

            <div className="offline-chips-row">
              <div className="offline-chip">
                <CheckCircle2 size={15} />
                <span>MERN &amp; Next.js Stack</span>
              </div>
              <div className="offline-chip">
                <Sparkles size={15} />
                <span>DSA &amp; System Design</span>
              </div>
              <div className="offline-chip">
                <Code2 size={15} />
                <span>C, C++, Java &amp; Python</span>
              </div>
              <div className="offline-chip">
                <Users size={15} />
                <span>Networking &amp; Linux OS</span>
              </div>
            </div>

            <div className="hero-actions">
              <a className="btn-primary-hero" href="#contact-walkin">
                <span>Book Free Trial Demo Class</span>
                <ArrowRight size={18} />
              </a>
              <a className="btn-secondary-hero" href="#courses">
                <BookOpen size={17} />
                <span>Explore All Courses</span>
              </a>
            </div>
          </div>

          {/* Right Column: Interactive Terminal / Lab Workstation */}
          <div className="hero-workstation" aria-label="Interactive Lab Terminal Workstation">
            <div className="workstation-glow" />
            <div className="terminal-window">
              <div className="terminal-top-bar">
                <div className="terminal-dots">
                  <span className="terminal-dot dot-red" />
                  <span className="terminal-dot dot-yellow" />
                  <span className="terminal-dot dot-green" />
                </div>
                <div className="terminal-title">
                  <Terminal size={13} />
                  <span>elite-coding@student-desk: ~/classroom</span>
                </div>
                <span className="terminal-badge">LIVE CLASSROOM CODE</span>
              </div>

              {/* Terminal Tabs */}
              <div className="terminal-tabs" role="tablist">
                <button
                  role="tab"
                  aria-selected={activeTab === "mern"}
                  className={`terminal-tab tab-dev ${activeTab === "mern" ? "active" : ""}`}
                  onClick={() => setActiveTab("mern")}
                >
                  <Code2 size={13} />
                  <span>1. HeroCard.jsx (GSAP)</span>
                </button>
                <button
                  role="tab"
                  aria-selected={activeTab === "core"}
                  className={`terminal-tab tab-net ${activeTab === "core" ? "active" : ""}`}
                  onClick={() => setActiveTab("core")}
                >
                  <Server size={13} />
                  <span>2. server.js (MongoDB)</span>
                </button>
                <button
                  role="tab"
                  aria-selected={activeTab === "dsa"}
                  className={`terminal-tab tab-os ${activeTab === "dsa" ? "active" : ""}`}
                  onClick={() => setActiveTab("dsa")}
                >
                  <Layers size={13} />
                  <span>3. Solution.cpp (DSA)</span>
                </button>
              </div>

              {/* Terminal Body */}
              <div className="terminal-content">
                {activeTab === "mern" && (
                  <>
                    <div className="code-line">
                      <span className="line-num">1</span>
                      <span className="line-code">
                        <span className="token-comment">// React + Next.js + GSAP Animation Class</span>
                      </span>
                    </div>
                    <div className="code-line">
                      <span className="line-num">2</span>
                      <span className="line-code">
                        <span className="token-kw">import</span> &#123; useEffect &#125; <span className="token-kw">from</span> <span className="token-str">&quot;react&quot;</span>;
                      </span>
                    </div>
                    <div className="code-line">
                      <span className="line-num">3</span>
                      <span className="line-code">
                        <span className="token-kw">import</span> gsap <span className="token-kw">from</span> <span className="token-str">&quot;gsap&quot;</span>;
                      </span>
                    </div>
                    <div className="code-line">
                      <span className="line-num">4</span>
                      <span className="line-code">
                        <span className="token-kw">export default function</span> <span className="token-fn">Card</span>() &#123;
                      </span>
                    </div>
                    <div className="code-line">
                      <span className="line-num">5</span>
                      <span className="line-code">
                        &nbsp;&nbsp;<span className="token-fn">useEffect</span>(() =&gt; &#123;
                      </span>
                    </div>
                    <div className="code-line">
                      <span className="line-num">6</span>
                      <span className="line-code">
                        &nbsp;&nbsp;&nbsp;&nbsp;gsap.<span className="token-fn">from</span>(<span className="token-str">&quot;.card&quot;</span>, &#123; opacity: <span className="token-num">0</span>, y: <span className="token-num">30</span>, duration: <span className="token-num">0.8</span> &#125;);
                      </span>
                    </div>
                    <div className="code-line">
                      <span className="line-num">7</span>
                      <span className="line-code">
                        &nbsp;&nbsp;&#125;, []);
                      </span>
                    </div>
                    <div className="code-line">
                      <span className="line-num">8</span>
                      <span className="line-code">
                        &nbsp;&nbsp;<span className="token-kw">return</span> &lt;<span className="token-type">div</span> <span className="token-kw">className</span>=<span className="token-str">&quot;card p-6 bg-slate-900 rounded-xl&quot;</span>&gt;MERN + GSAP&lt;/<span className="token-type">div</span>&gt;;
                      </span>
                    </div>
                    <div className="code-line">
                      <span className="line-num">9</span>
                      <span className="line-code">&#125;</span>
                    </div>
                  </>
                )}

                {activeTab === "core" && (
                  <>
                    <div className="code-line">
                      <span className="line-num">1</span>
                      <span className="line-code">
                        <span className="token-comment">// Backend Node.js, Express &amp; MongoDB Class</span>
                      </span>
                    </div>
                    <div className="code-line">
                      <span className="line-num">2</span>
                      <span className="line-code">
                        <span className="token-kw">const</span> express = <span className="token-fn">require</span>(<span className="token-str">&quot;express&quot;</span>);
                      </span>
                    </div>
                    <div className="code-line">
                      <span className="line-num">3</span>
                      <span className="line-code">
                        <span className="token-kw">const</span> mongoose = <span className="token-fn">require</span>(<span className="token-str">&quot;mongoose&quot;</span>);
                      </span>
                    </div>
                    <div className="code-line">
                      <span className="line-num">4</span>
                      <span className="line-code">
                        <span className="token-kw">const</span> app = <span className="token-fn">express</span>();
                      </span>
                    </div>
                    <div className="code-line">
                      <span className="line-num">5</span>
                      <span className="line-code">
                        <span className="token-kw">await</span> mongoose.<span className="token-fn">connect</span>(process.env.MONGO_URI);
                      </span>
                    </div>
                    <div className="code-line">
                      <span className="line-num">6</span>
                      <span className="line-code">
                        <span className="token-log">✓ [MongoDB Atlas Connected] Database live!</span>
                      </span>
                    </div>
                    <div className="code-line">
                      <span className="line-num">7</span>
                      <span className="line-code">
                        <span className="token-str">✓ [Express REST API] Listening on Port 5000</span>
                      </span>
                    </div>
                  </>
                )}

                {activeTab === "dsa" && (
                  <>
                    <div className="code-line">
                      <span className="line-num">1</span>
                      <span className="line-code">
                        <span className="token-comment">// DSA &amp; Logic Building Class: Two-Pointer Technique</span>
                      </span>
                    </div>
                    <div className="code-line">
                      <span className="line-num">2</span>
                      <span className="line-code">
                        <span className="token-kw">#include</span> <span className="token-str">&lt;iostream&gt;</span>
                      </span>
                    </div>
                    <div className="code-line">
                      <span className="line-num">3</span>
                      <span className="line-code">
                        <span className="token-kw">#include</span> <span className="token-str">&lt;vector&gt;</span>
                      </span>
                    </div>
                    <div className="code-line">
                      <span className="line-num">4</span>
                      <span className="line-code">
                        <span className="token-kw">using namespace</span> std;
                      </span>
                    </div>
                    <div className="code-line">
                      <span className="line-num">5</span>
                      <span className="line-code">
                        <span className="token-type">int</span> <span className="token-fn">main</span>() &#123;
                      </span>
                    </div>
                    <div className="code-line">
                      <span className="line-num">6</span>
                      <span className="line-code">
                        &nbsp;&nbsp;vector&lt;<span className="token-type">int</span>&gt; arr = &#123;<span className="token-num">2</span>, <span className="token-num">7</span>, <span className="token-num">11</span>, <span className="token-num">15</span>&#125;;
                      </span>
                    </div>
                    <div className="code-line">
                      <span className="line-num">7</span>
                      <span className="line-code">
                        &nbsp;&nbsp;cout &lt;&lt; <span className="token-str">&quot;✓ Teacher cleared: Time O(N) | Space O(1)\\n&quot;</span>;
                      </span>
                    </div>
                    <div className="code-line">
                      <span className="line-num">8</span>
                      <span className="line-code">
                        &nbsp;&nbsp;<span className="token-kw">return</span> <span className="token-num">0</span>;
                      </span>
                    </div>
                    <div className="code-line">
                      <span className="line-num">9</span>
                      <span className="line-code">&#125;</span>
                    </div>
                  </>
                )}
              </div>

              {/* Hardware Telemetry Bar */}
              <div className="terminal-telemetry">
                <div className="telemetry-item">
                  <Wifi size={12} color="#10b981" />
                  <span>CLASSROOM: <strong>High-Speed Wi-Fi</strong></span>
                </div>
                <div className="telemetry-item">
                  <Users size={12} color="#38bdf8" />
                  <span>TEACHER: <strong>1:1 In-Class Help</strong></span>
                </div>
                <div className="telemetry-item">
                  <Sparkles size={12} color="#a855f7" />
                  <span>ADMISSIONS: <strong>New Batch Open</strong></span>
                </div>
              </div>
            </div>

            <div className="floating-lab-badge">
              <Sparkles size={16} color="#fbbf24" />
              <span>Genuine Teaching &bull; Zero Video Fluff</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. LAB HARDWARE & STATS STRIP */}
      <section className="stats-strip" aria-label="Campus metrics">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon-wrap">
              <Calendar size={24} />
            </div>
            <div className="stat-data">
              <strong>New Batch</strong>
              <span>Inaugural Cohort Enrolling</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon-wrap">
              <Users size={24} />
            </div>
            <div className="stat-data">
              <strong>10–15</strong>
              <span>Small Batches for Personal Focus</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon-wrap">
              <CheckCircle2 size={24} />
            </div>
            <div className="stat-data">
              <strong>1:1 Help</strong>
              <span>Direct Teacher Doubt Solving</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon-wrap">
              <ShieldCheck size={24} />
            </div>
            <div className="stat-data">
              <strong>Daily</strong>
              <span>Hands-On Laptop Coding</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. THE 4 CORE TECH PILLARS */}
      <section className="section-shell" id="tracks">
        <div className="section-header">
          <div className="section-kicker">
            <Terminal size={13} />
            <span>WHAT WE TEACH</span>
          </div>
          <h2>Technologies We Specialize In &amp; Teach In-Person</h2>
          <p>
            Whether you are starting from zero or sharpening your software engineering skills,
            our teachers guide you through hands-on coding on your laptop every day.
          </p>
        </div>

        <div className="tech-pillars-grid">
          {/* Pillar 1: Full-Stack MERN & Next.js */}
          <div className="pillar-card">
            <div className="pillar-icon-box icon-box-dev">
              <Code2 size={26} />
            </div>
            <h3>Full-Stack MERN &amp; Next.js</h3>
            <p>
              Master MongoDB, Express.js, React.js, and Node.js, alongside Next.js 15 App Router, Tailwind CSS, and Git/GitHub for complete full-stack mastery.
            </p>
            <div className="pillar-tags">
              <span className="pillar-tag">MongoDB</span>
              <span className="pillar-tag">Express.js</span>
              <span className="pillar-tag">React.js</span>
              <span className="pillar-tag">Next.js</span>
              <span className="pillar-tag">Node.js</span>
              <span className="pillar-tag">Git / GitHub</span>
            </div>
            <a className="pillar-link" href="#courses" onClick={() => setCourseFilter("mern")}>
              <span>View MERN Courses</span>
              <ChevronRight size={14} />
            </a>
          </div>

          {/* Pillar 2: Frontend & GSAP Animations */}
          <div className="pillar-card">
            <div className="pillar-icon-box icon-box-net">
              <Sparkles size={26} />
            </div>
            <h3>Frontend, Tailwind &amp; GSAP</h3>
            <p>
              Build stunning, interactive websites with modern CSS, Tailwind utility styling, UI component libraries, and buttery-smooth GSAP animations.
            </p>
            <div className="pillar-tags">
              <span className="pillar-tag">Tailwind CSS</span>
              <span className="pillar-tag">GSAP Animations</span>
              <span className="pillar-tag">React Components</span>
              <span className="pillar-tag">UI Libraries</span>
              <span className="pillar-tag">Responsive UI</span>
            </div>
            <a className="pillar-link" href="#courses" onClick={() => setCourseFilter("mern")}>
              <span>View Frontend Courses</span>
              <ChevronRight size={14} />
            </a>
          </div>

          {/* Pillar 3: DSA & Logic Building */}
          <div className="pillar-card">
            <div className="pillar-icon-box icon-box-dsa">
              <Layers size={26} />
            </div>
            <h3>Data Structures &amp; Algorithms (DSA)</h3>
            <p>
              Build rock-solid problem-solving intuition. Master arrays, strings, recursion, linked lists, trees, and time complexity with whiteboard walkthroughs.
            </p>
            <div className="pillar-tags">
              <span className="pillar-tag">Problem Solving</span>
              <span className="pillar-tag">Arrays &amp; Strings</span>
              <span className="pillar-tag">Recursion</span>
              <span className="pillar-tag">Trees &amp; Graphs</span>
              <span className="pillar-tag">C++ / Java / Python</span>
            </div>
            <a className="pillar-link" href="#courses" onClick={() => setCourseFilter("dsa")}>
              <span>View DSA Courses</span>
              <ChevronRight size={14} />
            </a>
          </div>

          {/* Pillar 4: C, C++, Java & Python */}
          <div className="pillar-card">
            <div className="pillar-icon-box icon-box-os">
              <Cpu size={26} />
            </div>
            <h3>C, C++, Java &amp; Python</h3>
            <p>
              Learn programming from the ground up: C for memory and pointers, C++ and Java for Object-Oriented Programming (OOP), and Python for logic and scripting.
            </p>
            <div className="pillar-tags">
              <span className="pillar-tag">C Language</span>
              <span className="pillar-tag">C++ &amp; OOP</span>
              <span className="pillar-tag">Core Java</span>
              <span className="pillar-tag">Python 3</span>
              <span className="pillar-tag">Collections &amp; STL</span>
            </div>
            <a className="pillar-link" href="#courses" onClick={() => setCourseFilter("core")}>
              <span>View Language Courses</span>
              <ChevronRight size={14} />
            </a>
          </div>
        </div>
      </section>

      {/* 5. COURSES SHOWCASE & CARDS */}
      <section className="courses-section" id="courses">
        <div className="section-shell">
          <div className="section-header">
            <div className="section-kicker">
              <BookOpen size={13} />
              <span>OFFLINE CLASSROOM PROGRAMS</span>
            </div>
            <h2>Practical In-Person Programs</h2>
            <p>
              Every course is taught offline at our coaching center. Bring your laptop, sit in class,
              code alongside your teacher, and get every doubt resolved on the spot.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="course-filter-bar">
            <button
              className={`filter-btn ${courseFilter === "all" ? "active" : ""}`}
              onClick={() => setCourseFilter("all")}
            >
              All Programs ({COURSES_DATA.length})
            </button>
            <button
              className={`filter-btn ${courseFilter === "mern" ? "active" : ""}`}
              onClick={() => setCourseFilter("mern")}
            >
              MERN &amp; Next.js ({COURSES_DATA.filter((c) => c.track === "mern").length})
            </button>
            <button
              className={`filter-btn ${courseFilter === "core" ? "active" : ""}`}
              onClick={() => setCourseFilter("core")}
            >
              C, C++, Java &amp; Python ({COURSES_DATA.filter((c) => c.track === "core").length})
            </button>
            <button
              className={`filter-btn ${courseFilter === "dsa" ? "active" : ""}`}
              onClick={() => setCourseFilter("dsa")}
            >
              DSA &amp; Logic ({COURSES_DATA.filter((c) => c.track === "dsa").length})
            </button>
            <button
              className={`filter-btn ${courseFilter === "systems" ? "active" : ""}`}
              onClick={() => setCourseFilter("systems")}
            >
              Networking &amp; OS ({COURSES_DATA.filter((c) => c.track === "systems").length})
            </button>
          </div>

          {/* Courses Grid */}
          <div className="course-grid">
            {filteredCourses.map((course) => (
              <article className="course-card" key={course.title}>
                <div className="course-top-row">
                  <span className={`course-badge-track badge-${course.track}`}>
                    {course.trackLabel}
                  </span>
                  <span className="course-mode-badge">
                    <span className="pulse-dot" />
                    Offline Lab
                  </span>
                </div>

                <h3>{course.title}</h3>
                <p className="course-desc">{course.description}</p>

                {/* In-Person Perks Checklist */}
                <ul className="course-lab-perks">
                  {course.perks.map((perk) => (
                    <li key={perk}>
                      <CheckCircle2 size={15} />
                      <span>{perk}</span>
                    </li>
                  ))}
                </ul>

                <div className="course-meta-box">
                  <div className="course-duration">
                    <Clock size={14} />
                    <span>{course.duration} &bull; {course.labHours}</span>
                  </div>
                  <div className="course-fee">{course.fee}</div>
                </div>

                <Link className="btn-card-action" href={`/courses/${course.slug}`}>
                  <span>View Syllabus &amp; Lab Schedule</span>
                  <ArrowRight size={15} />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 6. WHY OFFLINE COACHING BEATS ONLINE VIDEOS */}
      <section className="section-shell" id="why-offline">
        <div className="section-header">
          <div className="section-kicker">
            <Zap size={13} />
            <span>THE HONEST COMPARISON</span>
          </div>
          <h2>Why Learning with a Teacher In-Person Works</h2>
          <p>
            Watching someone code in an online video gives the illusion of learning until you try it yourself and get stuck.
            Here is why our genuine classroom coaching makes all the difference.
          </p>
        </div>

        <div className="why-offline-grid">
          {/* Card 1: Online Pitfalls */}
          <div className="comparison-card card-online">
            <div className="card-header-badge">
              <X size={14} strokeWidth={2.5} />
              <span>The Struggle of Learning Alone Online</span>
            </div>
            <h3>Stuck in Confusing Video Loops</h3>
            <p className="sub">
              Pre-recorded tutorials leave you confused as soon as a bug or version mismatch happens on your screen.
            </p>

            <div className="comparison-points">
              <div className="point-row">
                <div className="point-icon cross">
                  <X size={14} strokeWidth={2.5} />
                </div>
                <div className="point-text">
                  <strong>Days Lost to Simple Errors</strong>
                  <span>You get stuck on a tiny syntax bug for 3 days with no teacher to look at your code.</span>
                </div>
              </div>
              <div className="point-row">
                <div className="point-icon cross">
                  <X size={14} strokeWidth={2.5} />
                </div>
                <div className="point-text">
                  <strong>Copy-Pasting Without Understanding</strong>
                  <span>You type along with the video, but when asked to write code from scratch, you blank out.</span>
                </div>
              </div>
              <div className="point-row">
                <div className="point-icon cross">
                  <X size={14} strokeWidth={2.5} />
                </div>
                <div className="point-text">
                  <strong>Loss of Motivation &amp; Routine</strong>
                  <span>Studying alone at home has no accountability. Over 90% of students quit online courses within weeks.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Elite Offline Institute Experience */}
          <div className="comparison-card card-offline">
            <div className="card-header-badge">
              <Check size={14} strokeWidth={2.5} />
              <span>The Elite Coding School Experience</span>
            </div>
            <h3>Genuine, Concept-First Teaching</h3>
            <p className="sub">
              Come to class every day with your laptop, learn directly from passionate teachers, and practice on your machine with instant help.
            </p>

            <div className="comparison-points">
              <div className="point-row">
                <div className="point-icon check">
                  <Check size={14} strokeWidth={2.5} />
                </div>
                <div className="point-text">
                  <strong>Instant Teacher Desk Assistance</strong>
                  <span>Hit an error? Raise your hand. The teacher walks to your desk, points out the bug, and explains the logic.</span>
                </div>
              </div>
              <div className="point-row">
                <div className="point-icon check">
                  <Check size={14} strokeWidth={2.5} />
                </div>
                <div className="point-text">
                  <strong>Clear Whiteboard Concept Building</strong>
                  <span>Every topic is broken down into simple, easy-to-understand logic before writing any code.</span>
                </div>
              </div>
              <div className="point-row">
                <div className="point-icon check">
                  <Check size={14} strokeWidth={2.5} />
                </div>
                <div className="point-text">
                  <strong>Daily Classroom Discipline &amp; Peers</strong>
                  <span>Sit with fellow learners, code together every day, build real consistency, and stay motivated.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. COACHING FACILITIES */}
      <section className="section-shell" id="campus">
        <div className="section-header">
          <div className="section-kicker">
            <Building2 size={13} />
            <span>CLASSROOM FACILITIES</span>
          </div>
          <h2>Simple, Clean &amp; Practical Learning Setup</h2>
          <p>
            We focus all our energy on genuine teaching. Our coaching center provides everything you need to learn and practice comfortably.
          </p>
        </div>

        <div className="campus-tour-grid">
          <div className="tour-card">
            <div className="tour-icon-wrap">
              <Monitor size={24} />
            </div>
            <h4>Bring Your Own Laptop</h4>
            <p>
              Carrying your own laptop is necessary for your daily coding practice. Every desk has dedicated power sockets and fast Wi-Fi so you code on your own machine from day one.
            </p>
          </div>

          <div className="tour-card">
            <div className="tour-icon-wrap">
              <Wifi size={24} />
            </div>
            <h4>High-Speed Classroom Wi-Fi</h4>
            <p>
              Reliable internet connection so you can download development tools, install packages, and browse documentation smoothly.
            </p>
          </div>

          <div className="tour-card">
            <div className="tour-icon-wrap">
              <Layers size={24} />
            </div>
            <h4>Projector &amp; Whiteboard Demos</h4>
            <p>
              Teachers break down concepts step-by-step on the whiteboard, followed by live coding demonstrations projected on the screen.
            </p>
          </div>

          <div className="tour-card">
            <div className="tour-icon-wrap">
              <Users size={24} />
            </div>
            <h4>Extra Practice &amp; Doubt Space</h4>
            <p>
              Stay after class in our open practice space to work on daily coding assignments, ask doubts, and collaborate with batchmates.
            </p>
          </div>
        </div>
      </section>

      {/* 8. OUR COMMITMENT & PHILOSOPHY */}
      <section className="section-shell">
        <div className="section-header">
          <div className="section-kicker">
            <Sparkles size={13} />
            <span>OUR TEACHING COMMITMENT</span>
          </div>
          <h2>Genuine Teaching. No False Hype. Pure Learning.</h2>
          <p>
            We started Elite Coding School with a clear goal: to be an honest, dedicated coaching center where teachers genuinely care about every student&apos;s progress.
          </p>
        </div>

        <div className="testimonials-grid">
          <div className="testimonial-card">
            <h4 style={{ color: "#ffffff", fontSize: "17px", margin: "0 0 10px", fontWeight: 700 }}>
              &ldquo;We Teach From Absolute Zero&rdquo;
            </h4>
            <p className="quote-text">
              You don&apos;t need any previous coding background. We start from basic computer concepts and logic building, ensuring no student feels left behind in class.
            </p>
            <div className="student-profile">
              <div className="student-avatar">01</div>
              <div className="student-info">
                <strong>Foundational Approach</strong>
                <span>Step-by-step concept clarity</span>
              </div>
            </div>
          </div>

          <div className="testimonial-card">
            <h4 style={{ color: "#ffffff", fontSize: "17px", margin: "0 0 10px", fontWeight: 700 }}>
              &ldquo;Every Doubt is Welcomed&rdquo;
            </h4>
            <p className="quote-text">
              In our small batches of 10–15 students, teachers know you by name. If you have a question 10 times, we will explain it 10 times until the concept is crystal clear.
            </p>
            <div className="student-profile">
              <div className="student-avatar">02</div>
              <div className="student-info">
                <strong>Personal Attention</strong>
                <span>Direct 1:1 teacher mentorship</span>
              </div>
            </div>
          </div>

          <div className="testimonial-card">
            <h4 style={{ color: "#ffffff", fontSize: "17px", margin: "0 0 10px", fontWeight: 700 }}>
              &ldquo;Try Before You Decide&rdquo;
            </h4>
            <p className="quote-text">
              We offer free trial demo classes. Walk into our center, sit with our teachers, experience our teaching style first-hand, and enroll only when you are completely satisfied.
            </p>
            <div className="student-profile">
              <div className="student-avatar">03</div>
              <div className="student-info">
                <strong>Fully Transparent</strong>
                <span>Free trial lecture before admission</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. WALK-IN VISIT / FREE DEMO CTA */}
      <section className="campus-cta-shell" id="contact-walkin">
        <div className="campus-cta-card">
          <div className="cta-left">
            <h2>Attend a Free Trial Demo Class Before Enrolling.</h2>
            <p>
              Visit our coaching center today. Meet the teachers, attend a live lecture,
              experience our genuine teaching approach, and see how we explain code from scratch.
            </p>

            <div className="cta-contact-chips">
              <div className="contact-chip">
                <MapPin size={15} color="#38bdf8" />
                <span>Elite Coding School, Coaching Center</span>
              </div>
              <div className="contact-chip">
                <Clock size={15} color="#10b981" />
                <span>Center Timings: Mon - Sat 9:00 AM - 7:00 PM</span>
              </div>
              <div className="contact-chip">
                <Phone size={15} color="#c084fc" />
                <span>Teacher Helpline: +91 98765 43210</span>
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
              <span>Contact Teachers / Center</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 10. COMPREHENSIVE FOOTER */}
      <footer className="site-footer" id="contact">
        <div className="footer-inner">
          {/* Top Strip */}
          <div className="footer-top-strip">
            <div className="footer-brand-lockup">
              <Link className="brand" href="/">
                <span className="brand-mark">&lt;/&gt;</span>
                <span>Elite Coding School</span>
              </Link>
              <div className="footer-live-status">
                <span className="pulse-dot" />
                <span>COACHING CENTER OPEN (09:00 - 19:00 IST)</span>
              </div>
            </div>

            <div className="social-icons-row">
              <a className="social-btn" href="https://github.com" target="_blank" rel="noreferrer" aria-label="GitHub">
                <Code2 size={17} />
              </a>
              <a className="social-btn" href="mailto:info@elitecodingschool.com" aria-label="Email">
                <Mail size={17} />
              </a>
            </div>
          </div>

          {/* 4-Column Grid */}
          <div className="footer-columns">
            {/* Column 1: Campus & Walk-in Hub */}
            <div className="footer-col">
              <h4>About Elite Coding School</h4>
              <p className="lead">
                A newly opened offline tech coaching center dedicated to genuine, hands-on teaching for coders, college students, and beginners.
              </p>
              <div className="footer-address-card">
                <strong>📍 Coaching Center Location:</strong>
                Elite Coding School Campus, Near Main Road &amp; Metro Station.
                <br />
                <span style={{ color: "#34d399", fontWeight: 600, display: "block", marginTop: "6px" }}>
                  ● Walk-ins welcome Mon-Sat (9 AM - 7 PM)
                </span>
              </div>
            </div>

            {/* Column 2: Tech Tracks */}
            <div className="footer-col">
              <h4>Classroom Courses</h4>
              <ul className="footer-nav-list">
                <li>
                  <a href="#courses" onClick={() => setCourseFilter("mern")}>
                    <ChevronRight size={13} /> Full-Stack MERN &amp; Next.js
                  </a>
                </li>
                <li>
                  <a href="#courses" onClick={() => setCourseFilter("mern")}>
                    <ChevronRight size={13} /> Frontend, Tailwind CSS &amp; GSAP
                  </a>
                </li>
                <li>
                  <a href="#courses" onClick={() => setCourseFilter("core")}>
                    <ChevronRight size={13} /> C, C++, Java &amp; Python
                  </a>
                </li>
                <li>
                  <a href="#courses" onClick={() => setCourseFilter("dsa")}>
                    <ChevronRight size={13} /> Data Structures &amp; Algorithms (DSA)
                  </a>
                </li>
                <li>
                  <a href="#courses" onClick={() => setCourseFilter("systems")}>
                    <ChevronRight size={13} /> Networking &amp; Linux OS
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3: Admissions & Portals */}
            <div className="footer-col">
              <h4>Admissions &amp; Trial</h4>
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
                  <Link href="/contact">
                    <ChevronRight size={13} /> Walk-in &amp; Center Address
                  </Link>
                </li>
                <li>
                  <Link href="/login">
                    <ChevronRight size={13} /> Student Portal Login
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Contact & Mentorship */}
            <div className="footer-col">
              <h4>Center Contact</h4>
              <ul className="footer-contact-list">
                <li>
                  <Phone size={15} />
                  <span>+91 98765 43210 (Inquiries)</span>
                </li>
                <li>
                  <Mail size={15} />
                  <span>info@elitecodingschool.com</span>
                </li>
                <li>
                  <Clock size={15} />
                  <span>Classes: 9:00 AM - 7:00 PM (Mon-Sat)</span>
                </li>
                <li>
                  <Building2 size={15} />
                  <span>Near Metro Station • Walk-ins Open</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Offline Quality Assurance Strip */}
          <div className="footer-assurance-strip">
            <div className="assurance-item">
              <CheckCircle2 size={16} />
              <span>Genuine Classroom Teaching</span>
            </div>
            <div className="assurance-item">
              <Users size={16} />
              <span>Small Batches (10–15 Students)</span>
            </div>
            <div className="assurance-item">
              <Sparkles size={16} />
              <span>1:1 Teacher Desk Doubt Solving</span>
            </div>
            <div className="assurance-item">
              <ShieldCheck size={16} />
              <span>Free Demo Class Before Admission</span>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="footer-bottom-bar">
            <span>&copy; {new Date().getFullYear()} Elite Coding School. All rights reserved.</span>
            <div className="footer-bottom-links">
              <Link href="/about">About Center</Link>
              <Link href="/contact">Visit Us</Link>
              <a href="#tracks">Curriculum</a>
              <Link href="/courses">Courses</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
