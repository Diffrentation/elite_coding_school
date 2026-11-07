"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";

export type NavbarProps = {
  activePage?: "home" | "courses" | "about" | "contact" | "none";
};

type SessionUser = { role: "admin" | "student" } | null;

export function Navbar({ activePage = "home" }: NavbarProps) {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const [sessionUser, setSessionUser] = useState<SessionUser>(null);

  const visibleRef = useRef(true);
  const lastScrollYRef = useRef(0);
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((body) => setSessionUser(body.data?.authenticated ? body.data.user : null))
      .catch(() => setSessionUser(null));
  }, []);

  useEffect(() => {
    lastScrollYRef.current = typeof window !== "undefined" ? window.scrollY : 0;

    const updateNavbar = () => {
      const currentScrollY = window.scrollY;

      // 4. When at the very top of the page (scrollY <= 10), always keep navbar visible
      if (currentScrollY <= 10) {
        if (!visibleRef.current) {
          visibleRef.current = true;
          setVisible(true);
        }
        lastScrollYRef.current = currentScrollY;
        return;
      }

      // If mobile menu is open, keep navbar visible
      if (open) {
        if (!visibleRef.current) {
          visibleRef.current = true;
          setVisible(true);
        }
        lastScrollYRef.current = currentScrollY;
        return;
      }

      // 5. Scroll direction detection
      const diff = currentScrollY - lastScrollYRef.current;

      // Small threshold to ignore sub-pixel trackpad noise
      if (Math.abs(diff) > 2) {
        if (diff > 0) {
          // 1. Scrolling down -> hide navbar smoothly
          if (visibleRef.current) {
            visibleRef.current = false;
            setVisible(false);
          }
        } else {
          // 2. Scrolling even slightly upward -> immediately reveal navbar
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

  const portalHref = sessionUser?.role === "admin" ? "/admin" : "/student";
  const portalLabel = sessionUser?.role === "admin" ? "Admin Panel" : "Student Portal";

  return (
    <>
      <div className={`courses-header-wrap ${!visible ? "is-hidden" : ""}`}>
        <header className="courses-header">
          <Link className="brand" href="/" aria-label="Elite Coding School">
            <span className="brand-mark">&lt;/&gt;</span>
            <span className="brand-text">Elite Coding School</span>
            <span className="brand-offline-tag">
              <span className="pulse-dot" />
              Offline Tech Lab
            </span>
          </Link>

          <button
            className="courses-menu"
            onClick={() => setOpen(!open)}
            aria-label="Toggle navigation menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>

          <nav className={open ? "open" : ""}>
            <Link
              className={activePage === "home" ? "active" : ""}
              href="/"
              onClick={() => setOpen(false)}
            >
              Home
            </Link>
            <Link
              className={activePage === "courses" ? "active" : ""}
              href="/courses"
              onClick={() => setOpen(false)}
            >
              Courses
            </Link>
            <a
              href="/#why-offline"
              onClick={() => setOpen(false)}
            >
              Why Offline Lab
            </a>
            <Link
              className={activePage === "about" ? "active" : ""}
              href="/about"
              onClick={() => setOpen(false)}
            >
              About Campus
            </Link>
            <Link
              className={activePage === "contact" ? "active" : ""}
              href="/contact"
              onClick={() => setOpen(false)}
            >
              Walk-in &amp; Contact
            </Link>

            {sessionUser ? (
              <div className="nav-actions">
                <Link
                  className="btn-nav-primary"
                  href={portalHref}
                  onClick={() => setOpen(false)}
                >
                  <span>{portalLabel}</span>
                  <ArrowRight size={14} className="btn-nav-arrow" />
                </Link>
              </div>
            ) : (
              <div className="nav-actions">
                <Link
                  className="btn-nav-ghost"
                  href="/login"
                  onClick={() => setOpen(false)}
                >
                  <span>Login</span>
                </Link>
                <Link
                  className="btn-nav-primary"
                  href="/register"
                  onClick={() => setOpen(false)}
                >
                  <span>Book Free Demo</span>
                  <ArrowRight size={14} className="btn-nav-arrow" />
                </Link>
              </div>
            )}
          </nav>
        </header>
      </div>
      {/* Spacer to prevent layout shift with fixed navbar */}
      <div className="navbar-spacer" aria-hidden="true" />
    </>
  );
}

