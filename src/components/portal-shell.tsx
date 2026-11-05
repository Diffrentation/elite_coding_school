"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  GraduationCap,
  Receipt,
  Layers,
  Inbox,
  MessageSquare,
  Settings,
  User,
  Search,
  Menu,
  X,
  LogOut,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

type PortalKind = "student" | "admin";
type CurrentUser = {
  email?: string;
  role?: string;
  fullName?: string;
  studentId?: string;
};

const adminLinks = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
  { icon: Users, label: "Students & Leads", href: "/admin/students" },
  { icon: BookOpen, label: "Courses", href: "/admin/courses" },
  { icon: GraduationCap, label: "Enrollments", href: "/admin/enrollments" },
  { icon: Receipt, label: "Fees & Receipts", href: "/admin/fees" },
  { icon: Layers, label: "Hero Banners", href: "/admin/banners" },
  { icon: Inbox, label: "Inquiries", href: "/admin/inquiries" },
  { icon: MessageSquare, label: "Queries", href: "/admin/queries" },
  { icon: Settings, label: "Settings", href: "/admin/settings" },
];

const studentLinks = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/student" },
  { icon: User, label: "My Profile", href: "/student/profile" },
  { icon: BookOpen, label: "My Courses", href: "/student/courses" },
  { icon: MessageSquare, label: "My Queries", href: "/student/queries" },
  { icon: Receipt, label: "Fees & Receipts", href: "/student/fees" },
  { icon: Settings, label: "Account Settings", href: "/student/settings" },
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
        <div className="portal-brand-block">
          <Link className="portal-brand" href="/">
            <b className="portal-brand-symbol">&lt;/&gt;</b>
            <div className="portal-brand-text">
              <strong>Elite Coding School</strong>
              <small>{role}</small>
            </div>
          </Link>
          <Link href="/" className="sidebar-view-site" title="Open Public Website" target="_blank">
            <ExternalLink size={13} />
            <span>Public Site</span>
          </Link>
        </div>

        <nav className="portal-nav">
          {links.map(({ icon: Icon, label, href }) => {
            const isActive = pathname === href;
            return (
              <Link
                className={`portal-nav-item ${isActive ? "active" : ""}`}
                href={href}
                key={href}
                onClick={() => setOpen(false)}
              >
                <span className="nav-icon-box">
                  <Icon size={18} strokeWidth={isActive ? 2.4 : 1.8} />
                </span>
                <span className="nav-item-label">{label}</span>
                {isActive && <ChevronRight size={14} className="nav-active-arrow" />}
              </Link>
            );
          })}
        </nav>

        <div className="portal-user">
          <span className="portal-user-avatar">{initials || "U"}</span>
          <div className="portal-user-meta">
            <b>{userName}</b>
            <small>{kind === "admin" ? "Administrator" : currentUser?.studentId || "Student portal"}</small>
          </div>
        </div>

        <button type="button" className="sidebar-logout" disabled={loggingOut} onClick={logout}>
          <LogOut size={16} />
          <span>{loggingOut ? "Signing out..." : "Log out"}</span>
        </button>
      </aside>

      <section className="portal-main">
        {kind === "admin" ? (
          <header className="portal-header admin-header">
            <button className="mobile-toggle-btn" onClick={() => setOpen(!open)} aria-label="Toggle navigation">
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
            <label className="admin-search">
              <Search size={17} className="search-icon" />
              <input
                aria-label="Search institute records"
                placeholder="Search students, courses, inquiries, enrollments..."
              />
            </label>
            <div className="admin-header-account">
              <span className="live-data">
                <span className="live-pulse" />
                Live institute data
              </span>
              <div className="admin-profile-pill">
                <span className="admin-avatar" title={userName}>
                  {initials || "A"}
                </span>
                <div className="admin-profile-info">
                  <strong>{userName}</strong>
                  <small>System Admin</small>
                </div>
              </div>
            </div>
          </header>
        ) : (
          <header className="portal-header">
            <button className="mobile-toggle-btn" onClick={() => setOpen(!open)} aria-label="Toggle navigation">
              {open ? <X size={20} /> : <Menu size={20} />}
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
