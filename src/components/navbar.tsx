"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronRight, Menu, X } from "lucide-react";

export type NavbarProps = {
  activePage?: "home" | "courses" | "about" | "contact" | "none";
};

type SessionUser = { role: "admin" | "student" } | null;

// Synchronous session initialization to prevent "Student Login" from blinking on page switches
const getCachedSession = (): SessionUser => {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem("ecs_session_user");
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return null;
};

export function Navbar({ activePage = "home" }: NavbarProps) {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const [sessionUser, setSessionUser] = useState<SessionUser>(getCachedSession);
  const [authResolved, setAuthResolved] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("ecs_session_checked") === "true";
    }
    return false;
  });
  const [activeSection, setActiveSection] = useState<string>("");

  const visibleRef = useRef(true);
  const lastScrollYRef = useRef(0);
  const rafIdRef = useRef<number | null>(null);
  const isNavigatingRef = useRef(false);

  // Helper to lock navbar as visible during in-page click smooth scrolls
  const triggerNav = () => {
    isNavigatingRef.current = true;
    visibleRef.current = true;
    setVisible(true);
    setTimeout(() => {
      isNavigatingRef.current = false;
      if (typeof window !== "undefined") {
        lastScrollYRef.current = window.scrollY;
      }
    }, 900);
  };

  useEffect(() => {
    let isMounted = true;
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((body) => {
        if (!isMounted) return;
        const user = body.data?.authenticated ? body.data.user : null;
        setSessionUser(user);
        setAuthResolved(true);
        if (typeof window !== "undefined") {
          try {
            sessionStorage.setItem("ecs_session_checked", "true");
            if (user) {
              sessionStorage.setItem("ecs_session_user", JSON.stringify(user));
            } else {
              sessionStorage.removeItem("ecs_session_user");
            }
          } catch {
            // ignore
          }
        }
      })
      .catch(() => {
        if (!isMounted) return;
        setSessionUser(null);
        setAuthResolved(true);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Track initial hash & hashchange
  useEffect(() => {
    const syncHash = () => {
      if (typeof window !== "undefined") {
        if (window.location.hash === "#why-offline") {
          setActiveSection("why-offline");
        } else if (activePage === "home" && !window.location.hash) {
          setActiveSection("home");
        }
      }
    };

    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, [activePage]);

  // Sync scroll on the home page so scrolling into/out of why-offline updates active state
  useEffect(() => {
    if (activePage !== "home" && typeof window !== "undefined" && window.location.pathname !== "/") {
      return;
    }

    const checkScrollPosition = () => {
      const whyOfflineEl = document.getElementById("why-offline");
      if (!whyOfflineEl) return;

      const rect = whyOfflineEl.getBoundingClientRect();
      if (rect.top <= 260 && rect.bottom >= 140) {
        setActiveSection("why-offline");
      } else if (window.scrollY < 300) {
        setActiveSection("home");
      }
    };

    window.addEventListener("scroll", checkScrollPosition, { passive: true });
    checkScrollPosition();
    return () => window.removeEventListener("scroll", checkScrollPosition);
  }, [activePage]);

  useEffect(() => {
    lastScrollYRef.current = typeof window !== "undefined" ? window.scrollY : 0;

    const updateNavbar = () => {
      const currentScrollY = window.scrollY;

      // 1. If user clicked a navbar item or programmatic scroll is active, keep navbar steady and visible
      if (isNavigatingRef.current) {
        if (!visibleRef.current) {
          visibleRef.current = true;
          setVisible(true);
        }
        lastScrollYRef.current = currentScrollY;
        return;
      }

      // 2. Near top of the page (<= 80px), always keep navbar visible
      if (currentScrollY <= 80) {
        if (!visibleRef.current) {
          visibleRef.current = true;
          setVisible(true);
        }
        lastScrollYRef.current = currentScrollY;
        return;
      }

      // 3. If mobile menu drawer is open, keep navbar visible
      if (open) {
        if (!visibleRef.current) {
          visibleRef.current = true;
          setVisible(true);
        }
        lastScrollYRef.current = currentScrollY;
        return;
      }

      // 4. Directional scroll detection with stable threshold
      const diff = currentScrollY - lastScrollYRef.current;

      // Stable 14px threshold prevents micro-scroll jitter and trackpad flickering
      if (Math.abs(diff) > 14) {
        if (diff > 0 && currentScrollY > 120) {
          // Scrolling down past hero -> hide smoothly
          if (visibleRef.current) {
            visibleRef.current = false;
            setVisible(false);
          }
        } else if (diff < 0) {
          // Scrolling upward -> immediately reveal smoothly
          if (!visibleRef.current) {
            visibleRef.current = true;
            setVisible(true);
          }
        }
        lastScrollYRef.current = currentScrollY;
      }
    };

    const handleScroll = () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
      rafIdRef.current = requestAnimationFrame(updateNavbar);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [open]);

  // Lock body scroll and listen for Escape key when right sidebar is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") setOpen(false);
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", handleKeyDown);
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [open]);

  const portalHref = sessionUser?.role === "admin" ? "/admin" : "/student";
  const portalLabel = sessionUser?.role === "admin" ? "Admin Panel" : "Student Portal";

  return (
    <>
      <div className={`courses-header-wrap ${!visible ? "is-hidden" : ""}`}>
        {/* Transparent click-outside backdrop positioned left of sidebar */}
        <div
          className={`nav-backdrop ${open ? "open" : ""}`}
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />

        <header className="courses-header">
          <Link className="brand" href="/" aria-label="Elite Coding School">
            <span className="brand-mark">&lt;/&gt;</span>
            <div className="brand-text-wrap">
              <span className="brand-text">Elite Coding School</span>
              <span className="brand-offline-tag">
                <span className="pulse-dot" />
                Offline Tech Lab
              </span>
            </div>
          </Link>

          <button className="courses-menu" onClick={() => setOpen(!open)} aria-label="Toggle navigation menu">
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>

          <nav className={open ? "open" : ""}>
            {/* Drawer Header (visible on mobile in right sidebar) */}
            <div className="nav-drawer-header">
              <div className="nav-drawer-brand">
                <span className="brand-mark">&lt;/&gt;</span>
                <span className="nav-drawer-title">Navigation</span>
              </div>
              <button
                type="button"
                className="nav-drawer-close"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            <div className="nav-links-stack">
              <Link
                className={activePage === "home" && activeSection !== "why-offline" ? "active" : ""}
                href="/"
                onClick={() => {
                  setOpen(false);
                  triggerNav();
                  setActiveSection("home");
                  if (typeof window !== "undefined" && window.location.pathname === "/") {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                    if (window.location.hash) {
                      window.history.pushState(null, "", "/");
                    }
                  }
                }}
              >
                <span>Home</span>
                <ChevronRight size={14} className="drawer-nav-arrow" />
              </Link>
              <Link
                className={activePage === "courses" ? "active" : ""}
                href="/courses"
                onClick={() => {
                  setOpen(false);
                  triggerNav();
                  setActiveSection("");
                }}
              >
                <span>Courses</span>
                <ChevronRight size={14} className="drawer-nav-arrow" />
              </Link>
              <a
                className={activeSection === "why-offline" ? "active" : ""}
                href="/#why-offline"
                onClick={(e) => {
                  setOpen(false);
                  triggerNav();
                  setActiveSection("why-offline");
                  if (typeof window !== "undefined" && window.location.pathname === "/") {
                    e.preventDefault();
                    const el = document.getElementById("why-offline");
                    if (el) {
                      el.scrollIntoView({ behavior: "smooth", block: "start" });
                      window.history.pushState(null, "", "/#why-offline");
                    }
                  }
                }}
              >
                <span>Why Offline Lab</span>
                <ChevronRight size={14} className="drawer-nav-arrow" />
              </a>
              <Link
                className={activePage === "about" ? "active" : ""}
                href="/about"
                onClick={() => {
                  setOpen(false);
                  triggerNav();
                  setActiveSection("");
                }}
              >
                <span>About Campus</span>
                <ChevronRight size={14} className="drawer-nav-arrow" />
              </Link>
              <Link
                className={activePage === "contact" ? "active" : ""}
                href="/contact#contact-form"
                onClick={() => {
                  setOpen(false);
                  triggerNav();
                  setActiveSection("");
                  if (typeof window !== "undefined" && window.location.pathname === "/contact") {
                    const el =
                      document.getElementById("contact-form") || document.getElementById("book-demo");
                    if (el) {
                      el.scrollIntoView({ behavior: "smooth", block: "start" });
                    }
                  }
                }}
              >
                <span>Walk-in &amp; Contact</span>
                <ChevronRight size={14} className="drawer-nav-arrow" />
              </Link>
            </div>

            {sessionUser ? (
              <div className="nav-actions">
                <Link
                  className="btn-nav-primary"
                  href={portalHref}
                  onClick={() => {
                    setOpen(false);
                    triggerNav();
                  }}
                >
                  <span>{portalLabel}</span>
                  <ArrowRight size={14} className="btn-nav-arrow" />
                </Link>
              </div>
            ) : (
              <div
                className="nav-actions"
                style={{
                  opacity: authResolved ? 1 : 0,
                  transition: "opacity 0.15s ease",
                }}
              >
                <Link
                  className="btn-nav-ghost"
                  href="/login"
                  onClick={() => {
                    setOpen(false);
                    triggerNav();
                  }}
                >
                  <span>Student Login</span>
                </Link>
                <Link
                  className="btn-nav-primary"
                  href="/contact#contact-form"
                  onClick={() => {
                    setOpen(false);
                    triggerNav();
                    if (typeof window !== "undefined" && window.location.pathname === "/contact") {
                      const el =
                        document.getElementById("contact-form") || document.getElementById("book-demo");
                      if (el) {
                        el.scrollIntoView({ behavior: "smooth", block: "start" });
                      }
                    }
                  }}
                >
                  <span>Book Free Demo</span>
                  <ArrowRight size={14} className="btn-nav-arrow" />
                </Link>
              </div>
            )}

            {/* Drawer Footer (visible on mobile in right sidebar) */}
            <div className="nav-drawer-footer">
              <span className="pulse-dot" />
              <span>Center Open Today (09:00 - 19:00)</span>
            </div>
          </nav>
        </header>
      </div>
      {/* Spacer to prevent layout shift with fixed navbar */}
      <div className="navbar-spacer" aria-hidden="true" />
    </>
  );
}
