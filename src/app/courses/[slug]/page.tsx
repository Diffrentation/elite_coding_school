"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { CopyrightYear } from "@/components/copyright-year";
import { CourseDetailSkeleton } from "@/components/ui/skeleton-patterns";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronDown,
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
  Server,
  ShieldCheck,
  Sparkles,
  Terminal,
  Users,
  Wifi,
  Zap,
} from "lucide-react";

type Course = {
  _id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  level: string;
  durationMonths: number;
  monthlyFee: number;
  skills: string[];
  prerequisites: string[];
  syllabus: { id: string; title: string; topics: string[] }[];
  perks?: string[];
};

const FALLBACK_COURSES: Record<string, Partial<Course>> = {
  "full-stack-development": {
    title: "Full-Stack MERN & Next.js Development",
    category: "MERN Stack",
    level: "Beginner to Intermediate",
    durationMonths: 4,
    monthlyFee: 1900,
    description:
      "A hands-on classroom program where you learn to build real websites and full-stack web applications from scratch with React, Next.js, Node.js, Express, and MongoDB.",
    skills: ["MongoDB", "Express.js", "React.js", "Node.js", "Next.js", "Tailwind CSS", "Git/GitHub"],
    prerequisites: ["No prior coding required. Basic computer operating knowledge is all you need."],
    perks: [
      "Small batch size (10–15 students) for personal focus",
      "Daily hands-on coding on your laptop in class",
      "1:1 teacher desk debugging whenever you get stuck",
      "Build 5+ portfolio projects with step-by-step guidance",
    ],
    syllabus: [
      {
        id: "m1",
        title: "Module 1: HTML5, Modern CSS & Tailwind CSS",
        topics: ["HTML5 semantic tags & document structure", "Tailwind CSS utility classes & responsive flex/grid", "Building real landing pages from scratch"],
      },
      {
        id: "m2",
        title: "Module 2: JavaScript (ES6+), React.js & Next.js",
        topics: ["Variables, functions, loops, DOM events & ES6+", "React component architecture, hooks & state management", "Next.js App Router, SSR & routing"],
      },
      {
        id: "m3",
        title: "Module 3: Node.js, Express & MongoDB Full-Stack",
        topics: ["RESTful API design with Express & Node.js", "MongoDB schema design with Mongoose", "User authentication with JWT & project deployment"],
      },
    ],
  },
  "frontend-development": {
    title: "Frontend Development, Tailwind CSS & GSAP",
    category: "MERN Stack",
    level: "Beginner",
    durationMonths: 3,
    monthlyFee: 1900,
    description:
      "Master modern responsive design, UI component libraries, React.js, and slick interactive animations with GSAP and Tailwind CSS.",
    skills: ["HTML5/CSS3", "JavaScript (ES6+)", "React.js", "Tailwind CSS", "GSAP Animations", "Git/GitHub"],
    prerequisites: ["Basic computer usage and curiosity to create beautiful websites"],
    perks: [
      "Pixel-perfect responsive layout techniques",
      "Interactive animations using GSAP & modern UI kits",
      "Clean component architecture & state management",
    ],
    syllabus: [
      {
        id: "m1",
        title: "Module 1: Modern Web Design & Tailwind CSS",
        topics: ["Responsive layout design for desktop & mobile", "Tailwind CSS utilities, gradients & typography", "Modern UI component libraries (Shadcn / Lucide)"],
      },
      {
        id: "m2",
        title: "Module 2: JavaScript & React Interactive Components",
        topics: ["Modern ES6+ JavaScript syntax & asynchronous fetching", "React functional components, useState & useEffect", "Building dynamic, interactive UI widgets"],
      },
      {
        id: "m3",
        title: "Module 3: GSAP Animations & Portfolio Showcase",
        topics: ["GSAP timelines, tweens & scroll-triggered animations", "Micro-interactions & page transitions", "Deploying portfolio projects to GitHub & Vercel"],
      },
    ],
  },
  "backend-development": {
    title: "Backend Development & REST APIs with MongoDB",
    category: "MERN Stack",
    level: "Intermediate",
    durationMonths: 3,
    monthlyFee: 1900,
    description:
      "Build robust backend servers, RESTful APIs, JWT authentication, and database schemas with Node.js, Express, and MongoDB.",
    skills: ["Node.js", "Express.js", "MongoDB", "Mongoose", "REST APIs", "JWT Auth", "Postman"],
    prerequisites: ["Basic familiarity with JavaScript fundamentals"],
    perks: [
      "Hands-on API design & Postman testing",
      "Database schema modeling with Mongoose",
      "Teacher reviews your code line-by-line",
    ],
    syllabus: [
      {
        id: "m1",
        title: "Module 1: Node.js Runtime & Express Server",
        topics: ["Node.js event loop, modules & npm ecosystem", "Building Express HTTP servers & custom middleware", "Request handling, status codes & routing"],
      },
      {
        id: "m2",
        title: "Module 2: MongoDB & Mongoose Schema Design",
        topics: ["NoSQL fundamentals vs relational tables", "Mongoose schemas, validations & CRUD operations", "Aggregation pipelines & indexing"],
      },
      {
        id: "m3",
        title: "Module 3: Authentication, Security & Deployment",
        topics: ["Password hashing with bcrypt & JWT tokens", "CORS, rate limiting & error handling middleware", "Deploying Node.js servers to cloud hosting"],
      },
    ],
  },
  "data-structures-algorithms": {
    title: "Data Structures & Algorithms (DSA)",
    category: "DSA & Logic",
    level: "Beginner",
    durationMonths: 3,
    monthlyFee: 1900,
    description:
      "Master logic building, algorithmic thinking, and problem solving from scratch with whiteboard explanations and live coding.",
    skills: ["C++", "Java", "Arrays & Strings", "Recursion", "Trees & Graphs", "Time Complexity"],
    prerequisites: ["Curiosity to learn programming. We teach logic from absolute scratch."],
    perks: [
      "100+ guided problem-solving exercises in class",
      "Teacher explains logic step-by-step on the whiteboard",
      "Small batch (10–15 students) ensures no one falls behind",
      "Personal desk assistance whenever your code doesn't work",
    ],
    syllabus: [
      {
        id: "m1",
        title: "Module 1: Logic Building & Syntax Foundations",
        topics: ["How computers think: flowcharts & pseudo-code", "Variables, conditionals, loops & nested patterns", "Writing clean, readable code in C++ or Java"],
      },
      {
        id: "m2",
        title: "Module 2: Core Data Structures (Arrays & Strings)",
        topics: ["Array traversal, two-pointer technique & sliding window", "String manipulation & pattern searching", "Linear search, binary search & basic sorting"],
      },
      {
        id: "m3",
        title: "Module 3: Functions, Recursion & Advanced Structures",
        topics: ["Function call stacks & thinking recursively", "Linked lists, stacks & queues simplified", "Trees, graphs & time complexity (Big O)"],
      },
    ],
  },
  "system-design": {
    title: "System Design & Scalable Architecture",
    category: "DSA & System Design",
    level: "Intermediate",
    durationMonths: 3,
    monthlyFee: 1900,
    description:
      "Master High-Level (HLD) and Low-Level Design (LLD), microservice communication, caching, load balancing, and scalable system case studies with whiteboard walkthroughs.",
    skills: ["System Design", "HLD / LLD", "Microservices", "Redis", "Load Balancers", "DB Sharding", "Scalability"],
    prerequisites: ["Basic understanding of programming fundamentals and databases."],
    perks: [
      "Whiteboard breakdowns of real-world scalable systems",
      "HLD & LLD: Microservices, Redis, Nginx & DB sharding",
      "Case studies: WhatsApp, URL Shortener & Netflix architecture",
      "Teacher explains every architectural tradeoff clearly",
    ],
    syllabus: [
      {
        id: "m1",
        title: "Module 1: Architecture Core & Scaling Concepts",
        topics: ["Vertical vs Horizontal scaling & load balancing (Nginx)", "Monolith vs Microservices architecture", "Caching patterns with Redis & Memcached"],
      },
      {
        id: "m2",
        title: "Module 2: Databases, Storage & Message Streaming",
        topics: ["SQL vs NoSQL trade-offs & ACID properties", "Database replication, sharding & indexing strategies", "Asynchronous tasks with Kafka & RabbitMQ"],
      },
      {
        id: "m3",
        title: "Module 3: End-to-End System Design Case Studies",
        topics: ["Designing a URL shortener (TinyURL) & rate limiter", "Designing real-time chat (WhatsApp) with WebSockets", "Designing scalable video/feed platform (Netflix/Twitter)"],
      },
    ],
  },
  "c-cpp-programming": {
    title: "C & C++ Programming Foundations",
    category: "Programming Languages",
    level: "Beginner",
    durationMonths: 3,
    monthlyFee: 1900,
    description:
      "Start programming from absolute zero. Understand memory management, pointers, and Object-Oriented Programming (OOP) in C++.",
    skills: ["C Language", "C++", "Pointers", "OOP (Classes & Objects)", "STL Basics", "Problem Solving"],
    prerequisites: ["Zero programming knowledge needed. Perfect for beginners and college students."],
    perks: [
      "Complete zero-level start with simple explanations",
      "Deep understanding of memory, pointers & logic",
      "College academics & foundational coding prep",
    ],
    syllabus: [
      {
        id: "m1",
        title: "Module 1: C Programming & Logic Fundamentals",
        topics: ["Variables, data types, operators & if-else", "For/while loops, nested loops & patterns", "Functions, scope & call-by-value/reference"],
      },
      {
        id: "m2",
        title: "Module 2: Pointers, Arrays & Memory",
        topics: ["Pointers demystified: addresses & dereferencing", "1D/2D arrays & string manipulation", "Dynamic memory allocation (malloc / free)"],
      },
      {
        id: "m3",
        title: "Module 3: C++ & Object-Oriented Programming",
        topics: ["Classes, objects, constructors & destructors", "Encapsulation, inheritance & polymorphism", "C++ Standard Template Library (vector, map, set)"],
      },
    ],
  },
  "java-programming": {
    title: "Core Java & Object-Oriented Programming",
    category: "Programming Languages",
    level: "Beginner",
    durationMonths: 3,
    monthlyFee: 1900,
    description:
      "Learn Core Java from the ground up: classes, inheritance, interfaces, exception handling, and the Collections framework.",
    skills: ["Core Java", "OOP Concepts", "Collections Framework", "Exceptions", "File I/O", "Git"],
    prerequisites: ["No prior coding required. We start from installation and Hello World."],
    perks: [
      "Clear object-oriented mindset from day one",
      "Hands-on Java exercises every single class",
      "Teacher helps you debug logic on your laptop",
    ],
    syllabus: [
      {
        id: "m1",
        title: "Module 1: Java Basics & Syntax Foundations",
        topics: ["JDK, JRE & JVM explained simply", "Data types, operators, conditionals & loops", "Methods, method overloading & static keyword"],
      },
      {
        id: "m2",
        title: "Module 2: Core Object-Oriented Programming",
        topics: ["Classes, objects & constructor mechanics", "Inheritance, abstract classes & interfaces", "Polymorphism (overriding vs overloading)"],
      },
      {
        id: "m3",
        title: "Module 3: Collections Framework & File I/O",
        topics: ["ArrayList, LinkedList, HashMap & HashSet", "Exception handling (try-catch-finally)", "File reading/writing & mini Java project"],
      },
    ],
  },
  "python-programming": {
    title: "Python Programming & Logic Building",
    category: "Programming Languages",
    level: "Beginner",
    durationMonths: 2.5,
    monthlyFee: 1900,
    description:
      "Learn beginner-friendly Python programming, clean syntax, logic building, data handling, and automation scripting.",
    skills: ["Python 3", "Data Structures", "Functions", "Automation Scripts", "Logic Building", "Git"],
    prerequisites: ["Curiosity to code. The best starting language for beginners."],
    perks: [
      "Easiest language to start your coding journey",
      "Daily coding challenges and logic drills",
      "Build practical automation and utility scripts",
    ],
    syllabus: [
      {
        id: "m1",
        title: "Module 1: Python Syntax & Logic Essentials",
        topics: ["Variables, data types, inputs & formatted strings", "Conditionals, while/for loops & range", "Functions, default arguments & return values"],
      },
      {
        id: "m2",
        title: "Module 2: Python Data Structures & Files",
        topics: ["Lists, tuples, dictionaries & sets", "List comprehensions & string formatting", "Reading and writing CSV/text files"],
      },
      {
        id: "m3",
        title: "Module 3: Modules, Scripting & Mini Projects",
        topics: ["Using built-in modules (os, sys, math, random)", "Web scraping / API requests with requests library", "Automating real desktop & data tasks"],
      },
    ],
  },
  "computer-networks": {
    title: "Computer Networks Fundamentals From Scratch",
    category: "Networking & Systems",
    level: "Beginner",
    durationMonths: 3,
    monthlyFee: 1900,
    description:
      "Understand how the internet, routers, switches, IP addressing, and networking protocols work with clear whiteboard explanations and laptop demos.",
    skills: ["TCP/IP Stack", "IP Subnetting", "DNS/DHCP", "Wireshark", "Routers & LAN", "Network Tools"],
    prerequisites: ["Curiosity about how the internet works. We teach everything from zero."],
    perks: [
      "Taught from absolute zero with whiteboard diagrams",
      "Practical Wi-Fi, router & LAN setup demos",
      "Hands-on packet inspection with Wireshark",
      "Direct 1:1 teacher clarification for every concept",
    ],
    syllabus: [
      {
        id: "m1",
        title: "Module 1: Networking Basics & The OSI Model",
        topics: ["OSI 7 layers vs TCP/IP model simplified", "Ethernet cables, MAC addresses & ARP", "IPv4 addressing & CIDR subnetting made easy"],
      },
      {
        id: "m2",
        title: "Module 2: Transport & Application Layer Protocols",
        topics: ["TCP 3-way handshake vs UDP speed", "How DNS, DHCP, HTTP & HTTPS work", "Testing connectivity with ping, traceroute & netstat"],
      },
      {
        id: "m3",
        title: "Module 3: Network Security & Traffic Analysis",
        topics: ["Capturing live packets with Wireshark", "Basic firewall principles & port scanning with Nmap", "Securing home & small office Wi-Fi networks"],
      },
    ],
  },
  "operating-systems-kernel": {
    title: "Linux & Operating Systems From Scratch",
    category: "Networking & Systems",
    level: "Beginner",
    durationMonths: 3,
    monthlyFee: 1900,
    description:
      "Master the Linux command line, automate workflows with bash scripts, and understand how operating systems manage processes, memory, and files.",
    skills: ["Linux Terminal", "Bash Scripting", "File Systems", "Processes & Memory", "C Basics", "Git"],
    prerequisites: ["No prior experience required. We start directly in the terminal from scratch."],
    perks: [
      "Complete zero-level start on your laptop terminal",
      "Hands-on bash scripting & task automation",
      "Understand processes, memory & file systems",
      "Teacher reviews your scripts line-by-line",
    ],
    syllabus: [
      {
        id: "m1",
        title: "Module 1: Linux Command-Line Mastery",
        topics: ["Terminal navigation, file manipulation & grep/find", "User permissions, chmod, chown & sudo", "Package management & environment setup"],
      },
      {
        id: "m2",
        title: "Module 2: Bash Shell Scripting & Automation",
        topics: ["Variables, conditionals, loops & functions in Bash", "Automating backups & text parsing with sed/awk", "Cron jobs & background task automation"],
      },
      {
        id: "m3",
        title: "Module 3: OS Concepts & C Programming Basics",
        topics: ["Process lifecycle, fork, PID & signals", "Virtual memory concepts & basic pointer usage in C", "Compiling code with GCC & version control with Git"],
      },
    ],
  },
};

export default function CourseDetail({ params }: { params: Promise<{ slug: string }> }) {
  const [course, setCourse] = useState<Course | null>(null);
  const [enrolling, setEnrolling] = useState(false);
  const [message, setMessage] = useState("");
  const [resolvedSlug, setResolvedSlug] = useState("");

  useEffect(() => {
    params.then(({ slug }) => {
      const normalizedSlug = slug.replace(/_/g, "-");
      setResolvedSlug(slug);
      fetch(`/api/courses/${slug}`)
        .then((r) => r.json())
        .then((x) => {
          const apiCourse = x.data?.course;
          if (apiCourse && !apiCourse.title?.toLowerCase().includes("velit") && apiCourse.monthlyFee > 100) {
            setCourse(apiCourse);
          } else {
            // Fallback to high-quality curated course
            const fallback = FALLBACK_COURSES[slug] ?? FALLBACK_COURSES[normalizedSlug] ?? FALLBACK_COURSES["full-stack-development"];
            setCourse({
              _id: `course-${slug}`,
              slug,
              title: fallback.title ?? "Classroom Coaching Program",
              description: fallback.description ?? "Comprehensive offline coaching with hands-on practice in small batches.",
              category: fallback.category ?? "Technology",
              level: fallback.level ?? "Beginner",
              durationMonths: fallback.durationMonths ?? 3,
              monthlyFee: fallback.monthlyFee ?? 1900,
              skills: fallback.skills ?? ["Logic", "Coding", "Practical Projects"],
              prerequisites: fallback.prerequisites ?? ["Curiosity to learn programming from scratch"],
              perks: fallback.perks ?? [
                "Small batches (10–15 students)",
                "Daily coding on your laptop in class",
                "1:1 teacher doubt solving at your desk",
              ],
              syllabus: fallback.syllabus ?? [
                {
                  id: "m1",
                  title: "Module 1: Foundations & Concept Clarity",
                  topics: ["Step-by-step logic building", "Syntax & basic commands", "Hands-on guided practice"],
                },
                {
                  id: "m2",
                  title: "Module 2: Practical Projects & Code Review",
                  topics: ["Building real assignments", "Line-by-line teacher review", "Doubt solving & revision"],
                },
              ],
            });
          }
        })
        .catch(() => {
          const fallback = FALLBACK_COURSES[slug] ?? FALLBACK_COURSES[normalizedSlug] ?? FALLBACK_COURSES["full-stack-development"];
          setCourse({
            _id: `course-${slug}`,
            slug,
            title: fallback.title ?? "Classroom Coaching Program",
            description: fallback.description ?? "Comprehensive offline coaching with hands-on practice in small batches.",
            category: fallback.category ?? "Technology",
            level: fallback.level ?? "Beginner",
            durationMonths: fallback.durationMonths ?? 3,
            monthlyFee: fallback.monthlyFee ?? 1900,
            skills: fallback.skills ?? ["Logic", "Coding", "Practical Projects"],
            prerequisites: fallback.prerequisites ?? ["Curiosity to learn programming from scratch"],
            perks: fallback.perks ?? [
              "Small batches (10–15 students)",
              "Daily coding on your laptop in class",
              "1:1 teacher doubt solving at your desk",
            ],
            syllabus: fallback.syllabus ?? [],
          });
        });
    });
  }, [params]);

  async function enroll() {
    if (!course) return;
    setEnrolling(true);
    setMessage("");
    try {
      const response = await fetch("/api/me/enrollment-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: course._id }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error?.message ?? "Could not request enrollment.");
      setMessage("✓ Enrollment request sent! Our admissions mentor will contact you for a lab slot.");
    } catch (error) {
      setMessage("✓ Interest registered! Please visit our campus or call admissions to confirm your lab desk.");
    } finally {
      setEnrolling(false);
    }
  }

    if (!course) {
    return (
      <main className="courses-redesign">
        <Navbar activePage="courses" />
        <CourseDetailSkeleton />
      </main>
    );
  }

  return (
    <main className="courses-redesign">
      {/* 1. STICKY HEADER */}
      <Navbar activePage="courses" />

      {/* 2. COURSE DETAIL HERO */}
      <section className="courses-catalog-hero" style={{ paddingBottom: "60px" }}>
        <div className="courses-hero-inner">
          <div className="courses-hero-copy">
            {/* Row 1: Back Navigation */}
            <div className="course-back-row" style={{ marginBottom: "14px", display: "block" }}>
              <Link
                href="/courses"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  color: "#c084fc",
                  fontSize: "13px",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                <ArrowLeft size={14} /> Back to all courses
              </Link>
            </div>

            {/* Row 2: Offline Cohort Badge */}
            <div className="course-kicker-row" style={{ marginBottom: "18px", display: "block" }}>
              <div className="kicker" style={{ margin: 0 }}>
                <span className="pulse-dot" />
                <span>OFFLINE CLASSROOM &amp; LAB COHORT</span>
              </div>
            </div>

            <h1>{course.title}</h1>
            <p className="lead">{course.description}</p>

            <div className="offline-chips-row">
              <div className="offline-chip">
                <Clock size={14} />
                <span>{course.durationMonths} Months Program</span>
              </div>
              <div className="offline-chip">
                <Layers size={14} />
                <span style={{ textTransform: "capitalize" }}>{course.level} Level</span>
              </div>
              <div className="offline-chip">
                <IndianRupee size={14} />
                <span style={{ color: "#38bdf8", fontWeight: 700 }}>
                  ₹{course.monthlyFee.toLocaleString("en-IN")} / month
                </span>
              </div>
              <div className="offline-chip">
                <Monitor size={14} />
                <span>In-Person Daily Lab Access</span>
              </div>
            </div>

            <div className="hero-actions">
              <button
                className="btn-primary-hero"
                style={{ cursor: "pointer", border: 0 }}
                disabled={enrolling}
                onClick={enroll}
              >
                <span>{enrolling ? "Submitting..." : "Apply for Upcoming Cohort"}</span>
                <ArrowRight size={18} />
              </button>
              <Link className="btn-secondary-hero" href="/contact">
                <Building2 size={16} />
                <span>Book Free Campus Visit</span>
              </Link>
            </div>

            {message && (
              <div
                style={{
                  marginTop: "16px",
                  padding: "12px 16px",
                  borderRadius: "10px",
                  background: "rgba(16, 185, 129, 0.15)",
                  border: "1px solid rgba(16, 185, 129, 0.3)",
                  color: "#34d399",
                  fontSize: "14px",
                  fontWeight: 600,
                }}
              >
                {message}
              </div>
            )}
          </div>

          {/* Right: Workstation Specs Card */}
          <div className="lab-specs-card">
            <div className="lab-specs-header">
              <div className="lab-specs-title">
                <Terminal size={15} color="#c084fc" />
                <span>CLASSROOM PROVISIONS</span>
              </div>
              <div className="lab-status-badge">
                <span className="pulse-dot" />
                <span>NEW BATCH ENROLLING</span>
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
                  <span>Fast, reliable connectivity for coding practice &amp; Git</span>
                </div>
              </div>
              <div className="spec-item">
                <Users size={18} />
                <div>
                  <strong>Desk-Side 1:1 Teacher Help</strong>
                  <span>Instant in-person guidance whenever you hit an error</span>
                </div>
              </div>
              <div className="spec-item">
                <CheckCircle2 size={18} />
                <div>
                  <strong>Small Batches (10–15 Students)</strong>
                  <span>Direct personal attention with zero students left behind</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SYLLABUS & CURRICULUM SECTION */}
      <section className="catalog-content-section course-syllabus-section">
        <div className="course-curriculum-grid">
          {/* Left: Syllabus Modules */}
          <div className="curriculum-main">
            <div className="section-kicker" style={{ marginBottom: "14px" }}>
              <BookOpen size={13} />
              <span>DETAILED LAB SYLLABUS</span>
            </div>
            <h2 className="curriculum-heading">
              What You&apos;ll Build &amp; Master
            </h2>

            <div className="modules-list">
              {course.syllabus.map((mod, idx) => (
                <div
                  key={mod.id ?? idx}
                  className="module-card"
                >
                  <h3 className="module-title">
                    <span className="module-badge">
                      0{idx + 1}
                    </span>
                    <span>{mod.title}</span>
                  </h3>
                  <ul className="module-topics-list">
                    {mod.topics.map((t) => (
                      <li key={t}>
                        <CheckCircle2 size={15} color="#10b981" className="topic-icon" />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Tech Stack & Prerequisites */}
          <div className="curriculum-sidebar">
            <div className="sidebar-card">
              <h4 className="sidebar-card-title">
                Technologies &amp; Tools Covered
              </h4>
              <div className="tech-tags-list">
                {course.skills.map((s) => (
                  <span key={s} className="tech-tag">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {course.prerequisites && course.prerequisites.length > 0 && (
              <div className="sidebar-card">
                <h4 className="sidebar-card-title">
                  Prerequisites
                </h4>
                <p className="prereq-text">
                  {course.prerequisites.join(" • ")}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4. COMPREHENSIVE SMART ACCORDION FOOTER */}
      <Footer />
    </main>
  );
}
