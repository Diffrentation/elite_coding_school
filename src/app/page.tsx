"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const features = [
  ["▣", "Live Classes"],
  ["◇", "Real Projects"],
  ["♧", "1:1 Mentorship"],
  ["✦", "Career Support"],
];
const stats = [
  ["♙", "1,200+", "Students trained"],
  ["◇", "10+", "Industry courses"],
  ["▤", "95%", "Placement support"],
  ["♧", "4.8/5", "Student rating"],
];
const courses = [
  [
    "Full Stack Development",
    "Build complete web applications from the ground up.",
    "12 Months",
    "₹2,500 / month",
    "01",
  ],
  [
    "Data Structures & Algorithms",
    "Master problem solving for technical interviews.",
    "6 Months",
    "₹1,800 / month",
    "02",
  ],
  [
    "Python Programming",
    "Start coding with Python and practical projects.",
    "4 Months",
    "₹1,500 / month",
    "03",
  ],
];

type HeroBanner = {
  _id: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaUrl: string;
};
type SessionUser = { role: "admin" | "student" } | null;

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeCourse, setActiveCourse] = useState(0);
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [activeBanner, setActiveBanner] = useState(0);
  const [sessionUser, setSessionUser] = useState<SessionUser>(null);

  useEffect(() => {
    fetch("/api/banners")
      .then((response) => response.json())
      .then((body) => setBanners(body.data?.banners ?? []))
      .catch(() => setBanners([]));
  }, []);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((response) => response.json())
      .then((body) => setSessionUser(body.data?.authenticated ? body.data.user : null))
      .catch(() => setSessionUser(null));
  }, []);

  useEffect(() => {
    if (banners.length < 2) return;
    const timer = window.setInterval(() => {
      setActiveBanner((current) => (current + 1) % banners.length);
    }, 7_000);
    return () => window.clearInterval(timer);
  }, [banners.length]);

  useEffect(() => {
    if (banners.length < 2) return;
    const controls = document.querySelectorAll<HTMLButtonElement>(".hero-controls button");
    const previous = () => setActiveBanner((current) => (current - 1 + banners.length) % banners.length);
    const next = () => setActiveBanner((current) => (current + 1) % banners.length);
    controls[0]?.addEventListener("click", previous);
    controls[1]?.addEventListener("click", next);
    return () => {
      controls[0]?.removeEventListener("click", previous);
      controls[1]?.removeEventListener("click", next);
    };
  }, [banners.length]);

  const banner = banners.length ? banners[activeBanner % banners.length] : null;
  const portalHref = sessionUser?.role === "admin" ? "/admin" : "/student";
  const portalLabel = sessionUser?.role === "admin" ? "Admin panel" : "Student portal";
  return (
    <main>
      <section className="hero-shell" id="home">
        <nav className="nav-wrap" aria-label="Main navigation">
          <a className="brand" href="#home" aria-label="Elite Coding School home">
            <span className="brand-mark">&lt;/&gt;</span>
            <span>Elite Coding School</span>
          </a>
          <button className="menu-toggle" aria-label="Toggle menu" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? "×" : "☰"}
          </button>
          <div className={`nav-links ${menuOpen ? "is-open" : ""}`}>
            <a className="active" href="#home" onClick={() => setMenuOpen(false)}>
              Home
            </a>
            <Link href="/courses" onClick={() => setMenuOpen(false)}>
              Courses
            </Link>
            <a href="#about" onClick={() => setMenuOpen(false)}>
              About
            </a>
            <a href="#contact" onClick={() => setMenuOpen(false)}>
              Contact
            </a>
            {sessionUser ? (
              <Link className="register-link" href={portalHref} onClick={() => setMenuOpen(false)}>
                {portalLabel}
              </Link>
            ) : (
              <>
                <Link className="login-link" href="/login">
                  Login
                </Link>
                <Link className="register-link" href="/register">
                  Register
                </Link>
              </>
            )}
          </div>
        </nav>
        <div className="hero-grid">
          <div className="hero-copy">
            <div className="eyebrow">🚀 &nbsp; New course launch</div>
            <h1>
              {banner?.title ?? (
                <>
                  Master Full Stack <span>Development</span>
                </>
              )}
            </h1>
            <p>
              {banner?.description ??
                "Practical, industry-focused programs that make you job-ready with real-world projects, mentorship and placement support."}
            </p>
            <div className="feature-row">
              {features.map(([icon, label]) => (
                <div className="feature" key={label}>
                  <i>{icon}</i>
                  {label}
                </div>
              ))}
            </div>
            <div className="hero-actions">
              <Link className="button primary" href={banner?.ctaUrl ?? "/courses"}>
                Explore courses <b>→</b>
              </Link>
              <Link className="button secondary" href={sessionUser ? portalHref : "/register"}>
                {sessionUser ? portalLabel : "Register now"}
              </Link>
            </div>
          </div>
          <div className="hero-art" aria-label="Laptop displaying code">
            <div className="art-glow one" />
            <div className="art-glow two" />
            <div className="code-window">
              <span className="dot red" />
              <span className="dot yellow" />
              <span className="dot green" />
              <div className="code-lines">
                <b>const</b> future = <em>&quot;yours&quot;</em>;<br />
                <b>function</b> <span>buildCareer</span>() &#123;
                <br />
                &nbsp;&nbsp;return <em>success</em>;<br />
                &#125;
              </div>
            </div>
            <div className="laptop-base" />
            <div className="floating-card">
              <small>NEW</small>
              <strong>
                Full Stack
                <br />
                Development
              </strong>
            </div>
            <div className="code-badge">&lt;/&gt;</div>
          </div>
        </div>
        <div className="hero-controls">
          <button aria-label="Previous slide">‹</button>
          <div>
            <i className="selected" />
            <i />
            <i />
          </div>
          <button aria-label="Next slide">›</button>
        </div>
      </section>
      <section className="stats-bar" aria-label="School highlights">
        {stats.map(([icon, number, label]) => (
          <div className="stat" key={label}>
            <i>{icon}</i>
            <div>
              <strong>{number}</strong>
              <span>{label}</span>
            </div>
          </div>
        ))}
      </section>
      <section className="courses-section" id="courses">
        <div className="section-heading">
          <div>
            <span>OUR PROGRAMS</span>
            <h2>
              Learn skills that <em>open doors.</em>
            </h2>
          </div>
          <a href="#all-courses">
            View all courses <b>→</b>
          </a>
        </div>
        <div className="course-grid">
          {courses.map(([title, description, duration, fee, number], index) => (
            <article
              className={`course-card ${activeCourse === index ? "selected" : ""}`}
              key={title}
              onMouseEnter={() => setActiveCourse(index)}
            >
              <div className="course-top">
                <span className="course-icon">&lt;/&gt;</span>
                <b>{number}</b>
              </div>
              <h3>{title}</h3>
              <p>{description}</p>
              <div className="course-meta">
                <span>◷ {duration}</span>
                <span>{fee}</span>
              </div>
              <a href="#register">
                Explore program <b>→</b>
              </a>
            </article>
          ))}
        </div>
      </section>
      <section className="journey" id="about">
        <div>
          <span>THE ELITE WAY</span>
          <h2>
            More than a course.
            <br />
            <em>A launchpad.</em>
          </h2>
        </div>
        <div className="journey-steps">
          <article>
            <b>01</b>
            <h3>Learn by doing</h3>
            <p>Build projects from your very first week.</p>
          </article>
          <article>
            <b>02</b>
            <h3>Get mentored</h3>
            <p>Get unstuck with guidance from people who care.</p>
          </article>
          <article>
            <b>03</b>
            <h3>Launch confidently</h3>
            <p>Prepare for interviews and your next opportunity.</p>
          </article>
        </div>
      </section>
      <section className="cta" id="register">
        <div>
          <span>YOUR NEXT STEP STARTS HERE</span>
          <h2>
            Ready to turn curiosity
            <br />
            into a <em>career?</em>
          </h2>
        </div>
        <a className="button primary" href="#contact">
          Talk to our team <b>→</b>
        </a>
      </section>
      <footer id="contact">
        <a className="brand" href="#home">
          <span className="brand-mark">&lt;/&gt;</span>
          <span>Elite Coding School</span>
        </a>
        <p>Learn. Build. Grow.</p>
        <span>© 2026 Elite Coding School</span>
      </footer>
    </main>
  );
}
