"use client";

import { FormEvent, useEffect, useState } from "react";

type Settings = {
  instituteName: string;
  tagline: string;
  about: string;
  email: string;
  phone: string;
  address: string;
  openingHours: string;
  socialLinks: { instagram: string; linkedin: string; youtube: string };
  version: number;
};

export function AdminSettings() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error?.message ?? "Could not load settings.");
        setSettings(body.data.settings);
      })
      .catch((reason: Error) => setMessage(reason.message));
  }, []);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!settings) return;
    const form = new FormData(event.currentTarget);
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instituteName: form.get("instituteName"),
          tagline: form.get("tagline"),
          about: form.get("about"),
          email: form.get("email"),
          phone: form.get("phone"),
          address: form.get("address"),
          openingHours: form.get("openingHours"),
          socialLinks: {
            instagram: form.get("instagram"),
            linkedin: form.get("linkedin"),
            youtube: form.get("youtube"),
          },
          version: settings.version,
        }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error?.message ?? "Could not save settings.");
      setSettings(body.data.settings);
      setMessage("Public institute information updated.");
    } catch (reason) {
      setMessage(reason instanceof Error ? reason.message : "Could not save settings.");
    } finally {
      setSaving(false);
    }
  }

  if (!settings)
    return (
      <main className="portal-content">
        <div className="empty-screen">
          <b>Settings</b>
          <h3>Loading institute settings...</h3>
        </div>
      </main>
    );

  return (
    <main className="portal-content admin-settings">
      <div className="portal-intro">
        <div>
          <p className="kicker">PUBLIC INSTITUTE PROFILE</p>
          <h2>Institute settings.</h2>
          <p>These details appear across the public website, including the About and Contact pages.</p>
        </div>
      </div>
      {message && <p className="form-success">{message}</p>}
      <form className="course-form" onSubmit={save}>
        <label>
          Institute name
          <input name="instituteName" defaultValue={settings.instituteName} required />
        </label>
        <label>
          Tagline
          <input name="tagline" defaultValue={settings.tagline} required />
        </label>
        <label>
          Public email
          <input name="email" type="email" defaultValue={settings.email} />
        </label>
        <label>
          Public phone
          <input name="phone" defaultValue={settings.phone} />
        </label>
        <label className="form-wide">
          Address
          <input name="address" defaultValue={settings.address} />
        </label>
        <label>
          Opening hours
          <input name="openingHours" defaultValue={settings.openingHours} />
        </label>
        <label>
          Instagram URL
          <input name="instagram" defaultValue={settings.socialLinks?.instagram ?? ""} />
        </label>
        <label>
          LinkedIn URL
          <input name="linkedin" defaultValue={settings.socialLinks?.linkedin ?? ""} />
        </label>
        <label>
          YouTube URL
          <input name="youtube" defaultValue={settings.socialLinks?.youtube ?? ""} />
        </label>
        <label className="form-wide">
          About the institute
          <textarea name="about" maxLength={3000} defaultValue={settings.about} />
        </label>
        <button className="button primary admin-action" disabled={saving}>
          {saving ? "Saving..." : "Save public information"}
        </button>
      </form>
    </main>
  );
}
