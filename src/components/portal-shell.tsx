"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";

type PortalKind = "student" | "admin";
type CurrentUser = {
  email?: string;
  role?: string;
  fullName?: string;
  studentId?: string;
};

const studentLinks = [
  ["D", "Dashboard", "/student"],
  ["P", "My Profile", "/student/profile"],
  ["C", "My Courses", "/student/courses"],
  ["Q", "My Queries", "/student/queries"],
  ["F", "Fees & Receipts", "/student/fees"],
  ["S", "Account Settings", "/student/settings"],
];

const adminLinks = [
  ["D", "Dashboard", "/admin"],
  ["S", "Students", "/admin/students"],
  ["C", "Courses", "/admin/courses"],
  ["E", "Enrollments", "/admin/enrollments"],
  ["F", "Fees & Receipts", "/admin/fees"],
  ["B", "Hero Banners", "/admin/banners"],
  ["I", "Inquiries", "/admin/inquiries"],
  ["Q", "Queries", "/admin/queries"],
  ["S", "Settings", "/admin/settings"],
];

export function PortalShell({ children, kind }: { children: ReactNode; kind: PortalKind }) {
  const [open, setOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const links = kind === "admin" ? adminLinks : studentLinks;
  const role = kind === "admin" ? "Admin Panel" : "Student Portal";
  const userName =
    kind === "admin"
      ? currentUser?.email?.split("@")[0] || "Administrator"
      : currentUser?.fullName || "Student";
  const initials = userName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => {
    fetch("/api/me")
      .then(async (response) => {
        if (!response.ok) return null;
        const body = await response.json();
        return body.data?.user ?? null;
      })
      .then((user) => setCurrentUser(user))
      .catch(() => setCurrentUser(null));
  }, []);

  async function logout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.replace("/login");
      router.refresh();
    }
  }

  return (
    <div className={`portal ${kind}-portal`}>
      <aside className={`portal-sidebar ${open ? "open" : ""}`}>
        <Link className="portal-brand" href="/">
          <b>&lt;/&gt;</b>
          <span>
            Elite Coding School<small>{role}</small>
          </span>
        </Link>
        <nav>
          {links.map(([icon, label, href]) => (
            <Link
              className={pathname === href ? "active" : ""}
              href={href}
              key={label}
              onClick={() => setOpen(false)}
            >
              <i>{icon}</i>
              {label}
            </Link>
          ))}
        </nav>
        <div className="portal-user">
          <span>{initials || "U"}</span>
          <div>
            <b>{userName}</b>
            <small>{kind === "admin" ? "Administrator" : currentUser?.studentId || "Student portal"}</small>
          </div>
        </div>
        {kind === "admin" && (
          <button type="button" className="sidebar-logout" disabled={loggingOut} onClick={logout}>
            <span>↪</span>
            {loggingOut ? "Signing out..." : "Log out"}
          </button>
        )}
      </aside>
      <section className="portal-main">
        {kind === "admin" ? (
          <header className="portal-header admin-header">
            <button onClick={() => setOpen(true)} aria-label="Open navigation">
              Menu
            </button>
            <label className="admin-search">
              <span aria-hidden="true">⌕</span>
              <input
                aria-label="Search institute records"
                placeholder="Search students, courses, queries..."
              />
            </label>
            <div className="admin-header-account">
              <span className="live-data">
                <i />
                Live institute data
              </span>
              <span className="admin-avatar" title={userName}>
                {initials || "U"}
              </span>
            </div>
          </header>
        ) : (
          <header className="portal-header">
            <button onClick={() => setOpen(true)} aria-label="Open navigation">
              Menu
            </button>
            <div>
              <span>{role}</span>
              <h1>{`Welcome back, ${userName}`}</h1>
            </div>
            <div className="header-actions" aria-label="Current account">
              <span title={userName}>{initials || "U"}</span>
            </div>
          </header>
        )}
        {children}
      </section>
    </div>
  );
}
