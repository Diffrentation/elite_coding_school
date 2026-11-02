import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Elite Coding School | Offline Tech Institute for Coders",
  description:
    "Master Full-Stack Development, Computer Networks, Operating Systems, and Low-Level Architecture in high-tech offline campus labs with 1:1 desk mentoring.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&family=Space+Grotesk:wght@600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
