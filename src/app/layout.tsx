import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Elite Coding School",
  description: "Industry-focused coding programs for ambitious learners.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
