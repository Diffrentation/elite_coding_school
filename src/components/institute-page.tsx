"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { InquiryForm } from "@/components/inquiry-form";

type Settings = {
  instituteName: string;
  about: string;
  email: string;
  phone: string;
  address: string;
  openingHours: string;
};

export function InstitutePage({ type }: { type: "about" | "contact" }) {
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((response) => response.json())
      .then((body) => setSettings(body.data?.settings ?? null))
      .catch(() => setSettings(null));
  }, []);

  const name = settings?.instituteName ?? "Elite Coding School";

  return (
    <main className="catalog">
      <header>
        <Link className="brand" href="/">
          <span className="brand-mark">&lt;/&gt;</span>
          <span>{name}</span>
        </Link>
        <Link href="/courses">Courses</Link>
      </header>
      {type === "about" ? (
        <section className="institute-copy">
          <p className="kicker">ABOUT THE INSTITUTE</p>
          <h1>Practical learning for ambitious developers.</h1>
          <p>
            {settings?.about ||
              "Our institute information will be published here once it has been configured by the administrator."}
          </p>
          <Link className="button primary" href="/courses">
            Explore programs &rarr;
          </Link>
        </section>
      ) : (
        <div className="contact-layout">
          <section className="institute-copy">
            <p className="kicker">CONTACT</p>
            <h1>Talk to our team.</h1>
            <p>For course, schedule, or admission information, use the details below or send an inquiry.</p>
            <dl>
              <dt>Email</dt>
              <dd>{settings?.email || "Not published yet"}</dd>
              <dt>Phone</dt>
              <dd>{settings?.phone || "Not published yet"}</dd>
              <dt>Address</dt>
              <dd>{settings?.address || "Not published yet"}</dd>
              <dt>Hours</dt>
              <dd>{settings?.openingHours || "Not published yet"}</dd>
            </dl>
          </section>
          <InquiryForm />
        </div>
      )}
    </main>
  );
}
