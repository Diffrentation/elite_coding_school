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
  track: "dev" | "net" | "os" | "dsa";
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
    title: "Full-Stack & Distributed Systems",
    slug: "full-stack-development",
    track: "dev",
    trackLabel: "Full-Stack Dev",
    description: "Build production-grade web applications, microservices, and real-time distributed platforms from scratch.",
    duration: "6 Months",
    labHours: "360+ Lab Hours",
    fee: "₹6,000 / mo",
    perks: [
      "Dedicated dual-monitor workstation",
      "Production deployment to live cloud clusters",
      "Daily 1:1 desk mentor code reviews",
    ],
    techTags: ["Next.js", "TypeScript", "Node.js", "Go", "PostgreSQL", "Docker", "Redis"],
  },
  {
    title: "Computer Networks & Cloud Infrastructure",
    slug: "computer-networks",
    track: "net",
    trackLabel: "Networking",
    description: "Master TCP/IP, Cisco routing, switches, Wireshark packet capture, VLANs, firewalls, and cloud architecture.",
    duration: "4 Months",
    labHours: "240+ Lab Hours",
    fee: "₹5,500 / mo",
    perks: [
      "Physical Cisco switch & router rack access",
      "Live packet tracing & Wireshark protocol lab",
      "Hands-on subnetting & enterprise firewall setup",
    ],
    techTags: ["TCP/IP", "Cisco Catalyst", "Wireshark", "BGP/OSPF", "Linux Netfilter", "Cloud LAN"],
  },
  {
    title: "Operating Systems & Kernel Programming",
    slug: "operating-systems-kernel",
    track: "os",
    trackLabel: "OS & Kernel",
    description: "Deep dive into Linux kernel internals, process scheduling, memory virtualization, system calls, C and Rust.",
    duration: "5 Months",
    labHours: "300+ Lab Hours",
    fee: "₹6,500 / mo",
    perks: [
      "Custom Linux kernel compilation in lab",
      "POSIX threads, mutexes & virtual memory allocators",
      "Desk mentor segfault & GDB debugging sessions",
    ],
    techTags: ["C/C++", "Rust", "Linux Kernel", "POSIX", "Syscalls", "Memory Virtualization", "GDB"],
  },
  {
    title: "Data Structures & High-Scale Systems",
    slug: "data-structures-algorithms",
    track: "dsa",
    trackLabel: "DSA & Systems",
    description: "Crack tier-1 technical interviews with rigorous problem solving, graph algorithms, and whiteboard system design.",
    duration: "4 Months",
    labHours: "200+ Lab Hours",
    fee: "₹5,000 / mo",
    perks: [
      "Floor-to-ceiling physical whiteboard mock rounds",
      "400+ LeetCode patterns with algorithmic proofs",
      "In-person weekly speed-coding sprints",
    ],
    techTags: ["Trees & Graphs", "Dynamic Programming", "System Design", "Concurrency", "High-Scale"],
  },
  {
    title: "Backend Architecture & API Systems",
    slug: "backend-development",
    track: "dev",
    trackLabel: "Backend Dev",
    description: "Design fault-tolerant backend services, database schema optimization, caching pipelines, and gRPC APIs.",
    duration: "4 Months",
    labHours: "240+ Lab Hours",
    fee: "₹5,500 / mo",
    perks: [
      "Benchmarking under 100k requests/sec",
      "Live SQL query tuning & index optimization",
      "1:1 architectural design reviews",
    ],
    techTags: ["Node.js", "Go", "PostgreSQL", "gRPC", "Kafka", "Redis"],
  },
  {
    title: "Network Security & Packet Defense",
    slug: "network-security",
    track: "net",
    trackLabel: "Networking",
    description: "Inspect network traffic, configure intrusion detection, harden Linux servers, and audit infrastructure defenses.",
    duration: "4 Months",
    labHours: "220+ Lab Hours",
    fee: "₹6,000 / mo",
    perks: [
      "Simulated campus red/blue team attack drills",
      "Hardware packet sniffer & MITM interception lab",
      "Enterprise security compliance certification",
    ],
    techTags: ["Wireshark", "Snort IDS", "iptables", "OpenVPN", "Nmap", "SSL/TLS Internals"],
  },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<"dev" | "net" | "os">("dev");
  const [courseFilter, setCourseFilter] = useState<"all" | "dev" | "net" | "os" | "dsa">("all");
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
              <span>IN-PERSON CAMPUS &amp; HARDWARE LAB</span>
              <span className="sub">Mon - Sat: 9:00 AM - 9:00 PM</span>
            </div>

            <h1>
              {banner?.title ?? (
                <>
                  Forge Real Engineering Depth.{" "}
                  <span className="gradient-text-purple">In-Person.</span>
                </>
              )}
            </h1>

            <p className="lead">
              {banner?.description ??
                "Escape tutorial hell. Master Full-Stack Development, Computer Networking, and Operating Systems inside high-spec offline coding labs with desk-side senior mentors."}
            </p>

            <div className="offline-chips-row">
              <div className="offline-chip">
                <Monitor size={15} />
                <span>Dedicated Dual-Screen Desks</span>
              </div>
              <div className="offline-chip">
                <Network size={15} />
                <span>Physical Cisco Switch &amp; Rack Labs</span>
              </div>
              <div className="offline-chip">
                <Cpu size={15} />
                <span>Linux Kernel &amp; Systems Terminal</span>
              </div>
              <div className="offline-chip">
                <Users size={15} />
                <span>2-Min Desk Mentoring</span>
              </div>
            </div>

            <div className="hero-actions">
              <a className="btn-primary-hero" href="#contact-walkin">
                <span>Book Free Lab Pass &amp; Demo</span>
                <ArrowRight size={18} />
              </a>
              <a className="btn-secondary-hero" href="#courses">
                <BookOpen size={17} />
                <span>Explore In-Person Tracks</span>
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
                  <span>elite-lab@workstation-14: ~/workspace</span>
                </div>
                <span className="terminal-badge">LIVE LAB RUNTIME</span>
              </div>

              {/* Terminal Tabs */}
              <div className="terminal-tabs" role="tablist">
                <button
                  role="tab"
                  aria-selected={activeTab === "dev"}
                  className={`terminal-tab tab-dev ${activeTab === "dev" ? "active" : ""}`}
                  onClick={() => setActiveTab("dev")}
                >
                  <Code2 size={13} />
                  <span>1. fullstack_server.ts</span>
                </button>
                <button
                  role="tab"
                  aria-selected={activeTab === "net"}
                  className={`terminal-tab tab-net ${activeTab === "net" ? "active" : ""}`}
                  onClick={() => setActiveTab("net")}
                >
                  <Network size={13} />
                  <span>2. network_trace.sh</span>
                </button>
                <button
                  role="tab"
                  aria-selected={activeTab === "os"}
                  className={`terminal-tab tab-os ${activeTab === "os" ? "active" : ""}`}
                  onClick={() => setActiveTab("os")}
                >
                  <Cpu size={13} />
                  <span>3. sys_kernel.c</span>
                </button>
              </div>

              {/* Terminal Body */}
              <div className="terminal-content">
                {activeTab === "dev" && (
                  <>
                    <div className="code-line">
                      <span className="line-num">1</span>
                      <span className="line-code">
                        <span className="token-comment">// Full-Stack Systems &amp; Microservices Lab</span>
                      </span>
                    </div>
                    <div className="code-line">
                      <span className="line-num">2</span>
                      <span className="line-code">
                        <span className="token-kw">import</span> &#123; createServer &#125;{" "}
                        <span className="token-kw">from</span> <span className="token-str">&quot;node:http&quot;</span>;
                      </span>
                    </div>
                    <div className="code-line">
                      <span className="line-num">3</span>
                      <span className="line-code">
                        <span className="token-kw">import</span> &#123; WebSocketServer &#125;{" "}
                        <span className="token-kw">from</span> <span className="token-str">&quot;ws&quot;</span>;
                      </span>
                    </div>
                    <div className="code-line">
                      <span className="line-num">4</span>
                      <span className="line-code">
                        <span className="token-kw">const</span> wss ={" "}
                        <span className="token-kw">new</span> <span className="token-fn">WebSocketServer</span>(&#123; port:{" "}
                        <span className="token-num">8080</span> &#125;);
                      </span>
                    </div>
                    <div className="code-line">
                      <span className="line-num">5</span>
                      <span className="line-code">
                        wss.<span className="token-fn">on</span>(<span className="token-str">&quot;connection&quot;</span>, (socket) =&gt; &#123;
                      </span>
                    </div>
                    <div className="code-line">
                      <span className="line-num">6</span>
                      <span className="line-code">
                        &nbsp;&nbsp;socket.<span className="token-fn">send</span>(JSON.<span className="token-fn">stringify</span>(&#123; status:{" "}
                        <span className="token-str">&quot;LAB_LIVE&quot;</span>, ping: <span className="token-str">&quot;0.8ms&quot;</span> &#125;));
                      </span>
                    </div>
                    <div className="code-line">
                      <span className="line-num">7</span>
                      <span className="line-code">&#125;);</span>
                    </div>
                    <div className="code-line">
                      <span className="line-num">8</span>
                      <span className="line-code">
                        <span className="token-log">✓ [PORT 8080] Microservice cluster online on Workstation #14</span>
                      </span>
                    </div>
                  </>
                )}

                {activeTab === "net" && (
                  <>
                    <div className="code-line">
                      <span className="line-num">1</span>
                      <span className="line-code">
                        <span className="token-comment"># Cisco Hardware &amp; Linux Packet Inspection Lab</span>
                      </span>
                    </div>
                    <div className="code-line">
                      <span className="line-num">2</span>
                      <span className="line-code">
                        <span className="token-kw">$</span> sudo tcpdump -i eth0 -nn <span className="token-str">&#39;tcp port 443&#39;</span> -c 2
                      </span>
                    </div>
                    <div className="code-line">
                      <span className="line-num">3</span>
                      <span className="line-code">
                        17:10:02.104 IP <span className="token-num">192.168.10.42.54892</span> &gt; <span className="token-num">10.0.0.1.443</span>: Flags [S]
                      </span>
                    </div>
                    <div className="code-line">
                      <span className="line-num">4</span>
                      <span className="line-code">
                        17:10:02.105 IP <span className="token-num">10.0.0.1.443</span> &gt; <span className="token-num">192.168.10.42.54892</span>: Flags [S.]
                      </span>
                    </div>
                    <div className="code-line">
                      <span className="line-num">5</span>
                      <span className="line-code">
                        <span className="token-kw">$</span> ip route show | grep default
                      </span>
                    </div>
                    <div className="code-line">
                      <span className="line-num">6</span>
                      <span className="line-code">
                        default via <span className="token-num">192.168.10.1</span> dev eth0 proto static metric 100
                      </span>
                    </div>
                    <div className="code-line">
                      <span className="line-num">7</span>
                      <span className="line-code">
                        <span className="token-str">✓ [Cisco Catalyst 3850] VLAN 20 trunk verified • Zero packet drop</span>
                      </span>
                    </div>
                  </>
                )}

                {activeTab === "os" && (
                  <>
                    <div className="code-line">
                      <span className="line-num">1</span>
                      <span className="line-code">
                        <span className="token-comment">// Operating Systems &amp; Low-Level Memory Lab</span>
                      </span>
                    </div>
                    <div className="code-line">
                      <span className="line-num">2</span>
                      <span className="line-code">
                        <span className="token-kw">#include</span> <span className="token-str">&lt;sys/mman.h&gt;</span>
                      </span>
                    </div>
                    <div className="code-line">
                      <span className="line-num">3</span>
                      <span className="line-code">
                        <span className="token-type">void</span> *vmem = <span className="token-fn">mmap</span>(NULL, <span className="token-num">4096</span>, PROT_READ|PROT_WRITE,
                      </span>
                    </div>
                    <div className="code-line">
                      <span className="line-num">4</span>
                      <span className="line-code">
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;MAP_PRIVATE|MAP_ANONYMOUS, -<span className="token-num">1</span>, <span className="token-num">0</span>);
                      </span>
                    </div>
                    <div className="code-line">
                      <span className="line-num">5</span>
                      <span className="line-code">
                        <span className="token-fn">printf</span>(<span className="token-str">&quot;⚡ Virtual page mapped at: %p (Kernel 6.8.0)\\n&quot;</span>, vmem);
                      </span>
                    </div>
                    <div className="code-line">
                      <span className="line-num">6</span>
                      <span className="line-code">
                        <span className="token-fn">printf</span>(<span className="token-str">&quot;✓ Desk mentor verified: Zero segmentation fault!\\n&quot;</span>);
                      </span>
                    </div>
                    <div className="code-line">
                      <span className="line-num">7</span>
                      <span className="line-code">
                        <span className="token-log">✓ Memory allocator compiled with GCC -O3 &bull; Benchmark: 4.2ns/alloc</span>
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Hardware Telemetry Bar */}
              <div className="terminal-telemetry">
                <div className="telemetry-item">
                  <Wifi size={12} color="#10b981" />
                  <span>LAN: <strong>10 Gbps Active</strong></span>
                </div>
                <div className="telemetry-item">
                  <Cpu size={12} color="#38bdf8" />
                  <span>KERNEL: <strong>Linux 6.8.0-RT</strong></span>
                </div>
                <div className="telemetry-item">
                  <Users size={12} color="#a855f7" />
                  <span>MENTOR: <strong>Floor Active</strong></span>
                </div>
              </div>
            </div>

            <div className="floating-lab-badge">
              <Sparkles size={16} color="#fbbf24" />
              <span>100% In-Person Labs • Zero Video Fluff</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. LAB HARDWARE & STATS STRIP */}
      <section className="stats-strip" aria-label="Campus metrics">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon-wrap">
              <Users size={24} />
            </div>
            <div className="stat-data">
              <strong>1,200+</strong>
              <span>Engineers Trained Offline</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon-wrap">
              <Wifi size={24} />
            </div>
            <div className="stat-data">
              <strong>10 Gbps</strong>
              <span>Dedicated Fiber Campus LAN</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon-wrap">
              <Cpu size={24} />
            </div>
            <div className="stat-data">
              <strong>1:1</strong>
              <span>In-Person Desk Mentoring</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon-wrap">
              <ShieldCheck size={24} />
            </div>
            <div className="stat-data">
              <strong>100%</strong>
              <span>Hands-On Physical Labs</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. THE 4 CORE TECH PILLARS */}
      <section className="section-shell" id="tracks">
        <div className="section-header">
          <div className="section-kicker">
            <Terminal size={13} />
            <span>CORE CURRICULUM VERTICALS</span>
          </div>
          <h2>Master the Full Engineering Spectrum</h2>
          <p>
            Real tech careers require more than superficial framework tutorials. Our offline curriculum
            gives you foundational mastery across development, networks, operating systems, and high-scale design.
          </p>
        </div>

        <div className="tech-pillars-grid">
          {/* Pillar 1: Full-Stack */}
          <div className="pillar-card">
            <div className="pillar-icon-box icon-box-dev">
              <Code2 size={26} />
            </div>
            <h3>Full-Stack &amp; Systems Dev</h3>
            <p>
              Build high-performance web systems, distributed microservices, event streaming, and resilient databases from scratch.
            </p>
            <div className="pillar-tags">
              <span className="pillar-tag">Next.js 15</span>
              <span className="pillar-tag">TypeScript</span>
              <span className="pillar-tag">Node / Go</span>
              <span className="pillar-tag">PostgreSQL</span>
              <span className="pillar-tag">Redis</span>
            </div>
            <a className="pillar-link" href="#courses" onClick={() => setCourseFilter("dev")}>
              <span>View Dev Programs</span>
              <ChevronRight size={14} />
            </a>
          </div>

          {/* Pillar 2: Networking */}
          <div className="pillar-card">
            <div className="pillar-icon-box icon-box-net">
              <Network size={26} />
            </div>
            <h3>Computer Networks &amp; Cloud</h3>
            <p>
              Wire enterprise Cisco switches, configure VLANs, dissect TCP/IP handshakes with Wireshark, and deploy cloud infrastructure.
            </p>
            <div className="pillar-tags">
              <span className="pillar-tag">TCP/IP Stack</span>
              <span className="pillar-tag">Wireshark</span>
              <span className="pillar-tag">Cisco Routing</span>
              <span className="pillar-tag">BGP / OSPF</span>
              <span className="pillar-tag">Firewalls</span>
            </div>
            <a className="pillar-link" href="#courses" onClick={() => setCourseFilter("net")}>
              <span>View Networking Tracks</span>
              <ChevronRight size={14} />
            </a>
          </div>

          {/* Pillar 3: OS & Systems */}
          <div className="pillar-card">
            <div className="pillar-icon-box icon-box-os">
              <Cpu size={26} />
            </div>
            <h3>Operating Systems &amp; Kernel</h3>
            <p>
              Understand how software talks to silicon. Linux kernel compilation, virtual memory, POSIX threads, syscalls, C and Rust.
            </p>
            <div className="pillar-tags">
              <span className="pillar-tag">Linux Internals</span>
              <span className="pillar-tag">C / C++</span>
              <span className="pillar-tag">Rust Systems</span>
              <span className="pillar-tag">Syscalls</span>
              <span className="pillar-tag">GDB / Valgrind</span>
            </div>
            <a className="pillar-link" href="#courses" onClick={() => setCourseFilter("os")}>
              <span>View OS &amp; Systems Tracks</span>
              <ChevronRight size={14} />
            </a>
          </div>

          {/* Pillar 4: DSA & System Design */}
          <div className="pillar-card">
            <div className="pillar-icon-box icon-box-dsa">
              <Layers size={26} />
            </div>
            <h3>DSA &amp; Whiteboard Design</h3>
            <p>
              Crush product-company interviews with algorithmic proofs, data structures, and in-person whiteboard architectural mock drills.
            </p>
            <div className="pillar-tags">
              <span className="pillar-tag">Tree &amp; Graph DP</span>
              <span className="pillar-tag">System Design</span>
              <span className="pillar-tag">Concurrency</span>
              <span className="pillar-tag">Mock Interviews</span>
            </div>
            <a className="pillar-link" href="#courses" onClick={() => setCourseFilter("dsa")}>
              <span>View DSA Programs</span>
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
              <span>IN-PERSON CAMPUS PROGRAMS</span>
            </div>
            <h2>Comprehensive Offline Programs</h2>
            <p>
              Every course runs inside our offline tech lab with dedicated workstations, real hardware,
              and instructors ready to debug side-by-side at your desk.
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
              className={`filter-btn ${courseFilter === "dev" ? "active" : ""}`}
              onClick={() => setCourseFilter("dev")}
            >
              Full-Stack &amp; Systems ({COURSES_DATA.filter((c) => c.track === "dev").length})
            </button>
            <button
              className={`filter-btn ${courseFilter === "net" ? "active" : ""}`}
              onClick={() => setCourseFilter("net")}
            >
              Networking &amp; Infra ({COURSES_DATA.filter((c) => c.track === "net").length})
            </button>
            <button
              className={`filter-btn ${courseFilter === "os" ? "active" : ""}`}
              onClick={() => setCourseFilter("os")}
            >
              OS &amp; Kernel Systems ({COURSES_DATA.filter((c) => c.track === "os").length})
            </button>
            <button
              className={`filter-btn ${courseFilter === "dsa" ? "active" : ""}`}
              onClick={() => setCourseFilter("dsa")}
            >
              DSA &amp; Whiteboard ({COURSES_DATA.filter((c) => c.track === "dsa").length})
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

      {/* 6. WHY OFFLINE LAB BEATS ONLINE VIDEOS */}
      <section className="section-shell" id="why-offline">
        <div className="section-header">
          <div className="section-kicker">
            <Zap size={13} />
            <span>THE REALITY CHECK</span>
          </div>
          <h2>Why Online Video Courses Fail Coders</h2>
          <p>
            Watching someone code in a polished 10-minute video doesn&apos;t teach you how to think,
            debug, or configure complex networks. Here is why in-person lab coaching changes everything.
          </p>
        </div>

        <div className="why-offline-grid">
          {/* Card 1: Online Pitfalls */}
          <div className="comparison-card card-online">
            <div className="card-header-badge">
              <span>✕ The Online Bootcamp Reality</span>
            </div>
            <h3>Stuck in Solitary Tutorial Hell</h3>
            <p className="sub">
              Pre-recorded tutorials provide an illusion of competence until you hit a real segmentation fault
              or broken packet route.
            </p>

            <div className="comparison-points">
              <div className="point-row">
                <div className="point-icon cross">✕</div>
                <div className="point-text">
                  <strong>Days Lost to Cryptic Errors</strong>
                  <span>Stuck on a bug for 72 hours with unanswered forum posts or generic chatbot replies.</span>
                </div>
              </div>
              <div className="point-row">
                <div className="point-icon cross">✕</div>
                <div className="point-text">
                  <strong>Simulated Toy Sandboxes</strong>
                  <span>Browser-based fake terminals that hide real Linux kernel configs and physical network hardware.</span>
                </div>
              </div>
              <div className="point-row">
                <div className="point-icon cross">✕</div>
                <div className="point-text">
                  <strong>90%+ Course Abandonment</strong>
                  <span>No physical peer accountability, no daily standups, and zero high-intensity hackathon energy.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Elite Offline Institute Experience */}
          <div className="comparison-card card-offline">
            <div className="card-header-badge">
              <Check size={14} />
              <span>✓ The Elite Offline Lab Experience</span>
            </div>
            <h3>Built for Real Engineering Muscle</h3>
            <p className="sub">
              Sit in high-tech coding labs from morning to evening, surrounded by passionate peers and senior engineers.
            </p>

            <div className="comparison-points">
              <div className="point-row">
                <div className="point-icon check">✓</div>
                <div className="point-text">
                  <strong>2-Minute Desk Debugging</strong>
                  <span>Raise your hand. A senior mentor walks to your workstation, reviews your GDB trace or Wireshark stream live.</span>
                </div>
              </div>
              <div className="point-row">
                <div className="point-icon check">✓</div>
                <div className="point-text">
                  <strong>Physical Cisco Racks &amp; Linux Desks</strong>
                  <span>Touch real managed switches, crimp Ethernet cables, configure firewall rules, and compile custom kernels.</span>
                </div>
              </div>
              <div className="point-row">
                <div className="point-icon check">✓</div>
                <div className="point-text">
                  <strong>Hacker Cohort &amp; Daily Standups</strong>
                  <span>Pair programming, physical whiteboard architectural mock drills, and intense weekly offline hackathons.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. CAMPUS & HARDWARE TOUR */}
      <section className="section-shell" id="campus">
        <div className="section-header">
          <div className="section-kicker">
            <Building2 size={13} />
            <span>CAMPUS INFRASTRUCTURE</span>
          </div>
          <h2>Inside Our Offline Coding Lab</h2>
          <p>
            Designed from the ground up for software developers, network engineers, and systems architects.
          </p>
        </div>

        <div className="campus-tour-grid">
          <div className="tour-card">
            <div className="tour-icon-wrap">
              <Monitor size={24} />
            </div>
            <h4>Dual-Screen Workstations</h4>
            <p>
              Dual 27-inch 4K displays, mechanical keyboards, ergonomic Herman Miller chairs, and high-spec Ubuntu / Windows dual-boot rigs.
            </p>
          </div>

          <div className="tour-card">
            <div className="tour-icon-wrap">
              <Server size={24} />
            </div>
            <h4>Cisco &amp; Server Hardware Bay</h4>
            <p>
              Physical server racks with enterprise Cisco Catalyst switches, patch bays, Mikrotik routers, and local Kubernetes nodes.
            </p>
          </div>

          <div className="tour-card">
            <div className="tour-icon-wrap">
              <Layers size={24} />
            </div>
            <h4>Whiteboard War Rooms</h4>
            <p>
              Floor-to-ceiling magnetic whiteboards where students map out microservice schemas, dynamic programming tables, and network topologies.
            </p>
          </div>

          <div className="tour-card">
            <div className="tour-icon-wrap">
              <Radio size={24} />
            </div>
            <h4>Developer Lounge &amp; Library</h4>
            <p>
              High-speed Wi-Fi, artisan coffee bar, systems engineering book library, and breakout pods for evening tech talks and mock interviews.
            </p>
          </div>
        </div>
      </section>

      {/* 8. ALUMNI SUCCESS STORIES */}
      <section className="section-shell">
        <div className="section-header">
          <div className="section-kicker">
            <Sparkles size={13} />
            <span>STUDENT TESTIMONIALS</span>
          </div>
          <h2>Hear From Coders Who Learned In-Person</h2>
          <p>
            From college beginners to placed systems engineers and cloud architects.
          </p>
        </div>

        <div className="testimonials-grid">
          <div className="testimonial-card">
            <p className="quote-text">
              &ldquo;I spent 8 months stuck trying to learn networking and Linux on YouTube. At Elite, plugging into real Cisco switches and having mentors debug my iptables rules at my desk taught me more in 6 weeks than an entire year online.&rdquo;
            </p>
            <div className="student-profile">
              <div className="student-avatar">RK</div>
              <div className="student-info">
                <strong>Rohan Kulkarni</strong>
                <span>Network Infrastructure Engineer &bull; Cloudflare</span>
              </div>
            </div>
          </div>

          <div className="testimonial-card">
            <p className="quote-text">
              &ldquo;The operating systems &amp; C track was intense. When my custom memory allocator had a segfault, the mentor sat with me for 40 minutes showing me how to read assembly disassembly in GDB. That in-person guidance got me hired as a Systems Dev.&rdquo;
            </p>
            <div className="student-profile">
              <div className="student-avatar">AM</div>
              <div className="student-info">
                <strong>Ananya Mishra</strong>
                <span>Systems Software Engineer &bull; Qualcomm</span>
              </div>
            </div>
          </div>

          <div className="testimonial-card">
            <p className="quote-text">
              &ldquo;The physical whiteboard system design drills and the hacker house culture pushed me to build real distributed apps. Coding next to other hungry developers 10 hours a day changes your mindset completely.&rdquo;
            </p>
            <div className="student-profile">
              <div className="student-avatar">VS</div>
              <div className="student-info">
                <strong>Vikram Sharma</strong>
                <span>Full-Stack Platform Engineer &bull; Razorpay</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. WALK-IN CAMPUS VISIT / FREE PASS CTA */}
      <section className="campus-cta-shell" id="contact-walkin">
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

      {/* 10. COMPREHENSIVE HIGH-TECH FOOTER */}
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

          {/* 4-Column Grid */}
          <div className="footer-columns">
            {/* Column 1: Campus & Walk-in Hub */}
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

            {/* Column 2: Tech Tracks */}
            <div className="footer-col">
              <h4>Technology Tracks</h4>
              <ul className="footer-nav-list">
                <li>
                  <a href="#courses" onClick={() => setCourseFilter("dev")}>
                    <ChevronRight size={13} /> Full-Stack Development
                  </a>
                </li>
                <li>
                  <a href="#courses" onClick={() => setCourseFilter("net")}>
                    <ChevronRight size={13} /> Computer Networks &amp; CCNA
                  </a>
                </li>
                <li>
                  <a href="#courses" onClick={() => setCourseFilter("os")}>
                    <ChevronRight size={13} /> Linux &amp; OS Kernel Internals
                  </a>
                </li>
                <li>
                  <a href="#courses" onClick={() => setCourseFilter("os")}>
                    <ChevronRight size={13} /> Low-Level Systems (C / Rust)
                  </a>
                </li>
                <li>
                  <a href="#courses" onClick={() => setCourseFilter("dsa")}>
                    <ChevronRight size={13} /> Data Structures &amp; System Design
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3: Admissions & Portals */}
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

            {/* Column 4: Contact & Mentorship */}
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

          {/* Offline Quality Assurance Strip */}
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

          {/* Bottom Bar */}
          <div className="footer-bottom-bar">
            <span>&copy; {new Date().getFullYear()} Elite Coding School. All rights reserved. Built for ambitious engineers.</span>
            <div className="footer-bottom-links">
              <Link href="/about">About Institute</Link>
              <Link href="/contact">Campus Tour</Link>
              <a href="#tracks">Curriculum</a>
              <a href="#why-offline">Code of Conduct</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
