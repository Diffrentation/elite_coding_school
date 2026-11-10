"use client";

import Link from "next/link";
import { ArrowLeft, BookOpen, Terminal } from "lucide-react";

export default function NotFound() {
  return (
    <main
      className="courses-redesign"
      style={{
        display: "grid",
        placeItems: "center",
        minHeight: "100vh",
        padding: "40px 24px",
        textAlign: "center",
      }}
    >
      <div style={{ maxWidth: "560px" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            color: "#f87171",
            background: "rgba(239, 68, 68, 0.12)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            padding: "5px 14px",
            borderRadius: "20px",
            marginBottom: "20px",
          }}
        >
          <Terminal size={14} />
          <span>ERROR 404 // PACKET ROUTE NOT FOUND</span>
        </div>

        <h1
          style={{
            fontSize: "clamp(36px, 5vw, 64px)",
            fontWeight: 800,
            color: "#ffffff",
            margin: "0 0 16px",
            letterSpacing: "-0.03em",
          }}
        >
          Page Dropped in Transit.
        </h1>

        <p
          style={{
            color: "#949dbd",
            fontSize: "16px",
            lineHeight: 1.65,
            margin: "0 0 32px",
          }}
        >
          The workstation route or program you are looking for does not exist on our campus LAN. Let&apos;s
          get you back to the main campus or active course directory.
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: "14px", flexWrap: "wrap" }}>
          <Link className="btn-primary-hero" href="/">
            <ArrowLeft size={17} />
            <span>Return to Campus Home</span>
          </Link>
          <Link className="btn-secondary-hero" href="/courses">
            <BookOpen size={16} />
            <span>Explore In-Person Tracks</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
