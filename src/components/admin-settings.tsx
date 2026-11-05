"use client";

import { FormEvent, useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

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
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error?.message ?? "Could not load settings.");
        setSettings(body.data.settings);
      })
      .catch((reason: Error) => setToast({ type: "error", text: reason.message }));
  }, []);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!settings) return;
    const form = new FormData(event.currentTarget);
    setSaving(true);
    setToast(null);
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
      setToast({ type: "success", text: "Public institute information updated successfully." });
    } catch (reason) {
      setToast({
        type: "error",
        text: reason instanceof Error ? reason.message : "Could not save settings.",
      });
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

      {toast && (
        <div
          role="alert"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            padding: "13px 20px",
            borderRadius: 12,
            marginBottom: 24,
            fontSize: "13.5px",
            fontWeight: 600,
            background: toast.type === "success" ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
            border: `1px solid ${toast.type === "success" ? "rgba(16, 185, 129, 0.4)" : "rgba(239, 68, 68, 0.4)"}`,
            color: toast.type === "success" ? "#34d399" : "#fca5a5",
            boxShadow:
              toast.type === "success"
                ? "0 4px 18px rgba(16, 185, 129, 0.2)"
                : "0 4px 18px rgba(239, 68, 68, 0.2)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {toast.type === "success" ? (
              <CheckCircle2 size={18} color="#34d399" style={{ flexShrink: 0 }} />
            ) : (
              <AlertCircle size={18} color="#f87171" style={{ flexShrink: 0 }} />
            )}
            <span>{toast.text}</span>
          </div>

          <button
            type="button"
            onClick={() => setToast(null)}
            style={{
              background: "transparent",
              border: 0,
              color: toast.type === "success" ? "#34d399" : "#fca5a5",
              cursor: "pointer",
              padding: 4,
              display: "grid",
              placeItems: "center",
              opacity: 0.8,
            }}
            title="Dismiss notification"
          >
            <X size={15} />
          </button>
        </div>
      )}
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
