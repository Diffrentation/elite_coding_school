"use client";

import { FormEvent, useEffect, useState } from "react";
import { Plus, X, Edit3, Globe, Archive, Layers, CheckCircle2, AlertCircle } from "lucide-react";
import { ImagePickerInput } from "@/components/image-picker-input";

type Banner = {
  _id: string;
  title: string;
  description: string;
  desktopImageUrl: string | null;
  mobileImageUrl: string | null;
  ctaLabel: string;
  ctaUrl: string;
  order: number;
  status: "draft" | "published" | "archived";
  version: number;
};

const request = async (url: string, init?: RequestInit) => {
  const response = await fetch(url, init);
  const body = await response.json();
  if (!response.ok) throw new Error(body.error?.message ?? "Request failed.");
  return body.data;
};

export function AdminBanners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [showForm, setShowForm] = useState(false);

  const load = () =>
    request("/api/admin/banners")
      .then((data) => setBanners(data.banners ?? []))
      .catch((reason: Error) => setToast({ type: "error", text: reason.message }));

  useEffect(() => {
    void load();
  }, []);

  function startCreate() {
    setEditing(null);
    setToast(null);
    setShowForm((open) => !open);
  }

  function startEdit(banner: Banner) {
    setToast(null);
    setEditing(banner);
    setShowForm(true);
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      title: form.get("title"),
      description: form.get("description"),
      ctaLabel: form.get("ctaLabel"),
      ctaUrl: form.get("ctaUrl"),
      desktopImageUrl: String(form.get("desktopImageUrl") ?? "") || null,
      mobileImageUrl: String(form.get("mobileImageUrl") ?? "") || null,
      order: Number(form.get("order")),
    };
    setToast(null);
    try {
      if (editing) {
        await request(`/api/admin/banners/${editing._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, status: editing.status, version: editing.version }),
        });
        setToast({ type: "success", text: "Banner updated successfully." });
      } else {
        await request("/api/admin/banners", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        setToast({ type: "success", text: "Banner draft created successfully." });
      }
      setEditing(null);
      setShowForm(false);
      void load();
    } catch (reason) {
      setToast({
        type: "error",
        text: reason instanceof Error ? reason.message : "Unable to save banner.",
      });
    }
  }

  async function changeStatus(id: string, action: "publish" | "archive") {
    setToast(null);
    try {
      await request(`/api/admin/banners/${id}/${action}`, { method: "POST" });
      setToast({
        type: "success",
        text: `Banner ${action === "publish" ? "published" : "archived"} successfully.`,
      });
      void load();
    } catch (reason) {
      setToast({
        type: "error",
        text: reason instanceof Error ? reason.message : "Unable to update banner.",
      });
    }
  }

  return (
    <main className="portal-content admin-banners">
      <div className="portal-intro">
        <div>
          <p className="kicker">HERO BANNERS</p>
          <h2>Promote what matters now.</h2>
          <p>Draft, review, reorder, and publish homepage messages with their responsive image URLs.</p>
        </div>
        <button
          className="button primary admin-action-btn"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            padding: "10px 18px",
            borderRadius: 10,
            background: "linear-gradient(135deg, #7c3aed, #9333ea)",
            color: "#ffffff",
            fontWeight: 700,
            fontSize: 13,
            cursor: "pointer",
            border: "1px solid rgba(255, 255, 255, 0.2)",
          }}
          onClick={startCreate}
        >
          {showForm && !editing ? <X size={16} /> : <Plus size={16} />}
          <span>{showForm && !editing ? "Close form" : "Add banner"}</span>
        </button>
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
      {showForm && (
        <form
          className="course-form"
          key={editing?._id ?? "new"}
          onSubmit={save}
          style={{
            background: "#0a0f32",
            border: "1px solid rgba(133, 41, 244, 0.35)",
            borderRadius: 18,
            padding: "26px 30px 36px",
            boxShadow: "0 18px 45px rgba(0, 0, 0, 0.45)",
            marginBottom: 32,
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 18,
            maxWidth: "100%",
            boxSizing: "border-box",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              gridColumn: "1 / -1",
              borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
              paddingBottom: 14,
              marginBottom: 8,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div>
              <h3 style={{ margin: 0, fontSize: 18, color: "#ffffff", fontFamily: "var(--font-heading)" }}>
                {editing ? `Editing Banner: ${editing.title}` : "Create Homepage Hero Banner"}
              </h3>
              <span style={{ fontSize: 12.5, color: "#94a3b8" }}>
                Upload responsive hero images or paste an image web link to display on the public homepage.
              </span>
            </div>

            <button
              className="button primary admin-action"
              type="submit"
              style={{
                padding: "8px 20px",
                borderRadius: 8,
                background: "linear-gradient(135deg, #7c3aed, #9333ea)",
                color: "#ffffff",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                border: "1px solid rgba(255, 255, 255, 0.2)",
              }}
            >
              {editing ? "Save Changes" : "Save as Draft"}
            </button>
          </div>

          <label>
            Banner title
            <input name="title" defaultValue={editing?.title} required />
          </label>
          <label>
            CTA label
            <input name="ctaLabel" defaultValue={editing?.ctaLabel ?? "Explore courses"} required />
          </label>
          <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
            <ImagePickerInput
              label="Desktop Banner Image"
              name="desktopImageUrl"
              defaultValue={editing?.desktopImageUrl}
              folder="banners"
              helperText="Recommended: 1920x800 px landscape image"
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
            <ImagePickerInput
              label="Mobile Banner Image"
              name="mobileImageUrl"
              defaultValue={editing?.mobileImageUrl}
              folder="banners"
              helperText="Recommended: 800x800 px or portrait image"
            />
          </div>
          <label>
            Display order
            <input name="order" type="number" min="0" defaultValue={editing?.order ?? 0} required />
          </label>
          <label>
            CTA URL
            <input name="ctaUrl" defaultValue={editing?.ctaUrl ?? "/courses"} required />
          </label>
          <label className="form-wide">
            Description
            <textarea name="description" defaultValue={editing?.description ?? ""} />
          </label>

          {/* Sticky Bottom Action Bar */}
          <div
            style={{
              gridColumn: "1 / -1",
              position: "sticky",
              bottom: "16px",
              zIndex: 50,
              background: "#080d2c",
              border: "1px solid #a855f7",
              borderRadius: 14,
              padding: "14px 22px",
              boxShadow: "0 12px 35px rgba(0, 0, 0, 0.8), 0 0 25px rgba(133, 41, 244, 0.35)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 14,
              marginTop: 18,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 0 3px rgba(16, 185, 129, 0.35)" }} />
              <span style={{ fontSize: 13.5, color: "#ffffff", fontWeight: 700 }}>
                {editing ? `Editing "${editing.title}"` : "New Banner Draft"}
              </span>
              <span style={{ fontSize: 12, color: "#94a3b8" }}>— Ready to save</span>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={{
                  padding: "10px 18px",
                  borderRadius: 8,
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(255, 255, 255, 0.14)",
                  color: "#cbd5e1",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                className="button primary admin-action"
                type="submit"
                style={{
                  padding: "10px 24px",
                  borderRadius: 8,
                  background: "linear-gradient(135deg, #7c3aed, #9333ea)",
                  color: "#ffffff",
                  border: "1px solid rgba(255, 255, 255, 0.25)",
                  boxShadow: "0 6px 20px rgba(124, 58, 237, 0.5)",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {editing ? "Save Changes" : "Save as Draft"}
              </button>
            </div>
          </div>
        </form>
      )}
      <div className="course-table" role="region" aria-label="Homepage banners">
        <div className="course-table-head">
          <span>Banner</span>
          <span>Description</span>
          <span>CTA</span>
          <span>Status</span>
          <span>Actions</span>
        </div>
        {banners.map((banner) => (
          <div className="course-table-row" key={banner._id}>
            <b>
              {banner.title}
              <small>Order {banner.order}</small>
            </b>
            <span>{banner.description || "No description"}</span>
            <span>{banner.ctaLabel}</span>
            <em className={`status-${banner.status}`}>{banner.status}</em>
            <div style={{ display: "flex", gap: 6 }}>
              <button
                onClick={() => startEdit(banner)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "5px 10px",
                  borderRadius: 6,
                  background: "rgba(255, 255, 255, 0.06)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  color: "#cbd5e1",
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                <Edit3 size={12} /> Edit
              </button>
              {banner.status !== "published" && (
                <button
                  onClick={() => changeStatus(banner._id, "publish")}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "5px 10px",
                    borderRadius: 6,
                    background: "rgba(16, 185, 129, 0.15)",
                    border: "1px solid rgba(16, 185, 129, 0.3)",
                    color: "#34d399",
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  <Globe size={12} /> Publish
                </button>
              )}
              {banner.status !== "archived" && (
                <button
                  onClick={() => changeStatus(banner._id, "archive")}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "5px 10px",
                    borderRadius: 6,
                    background: "rgba(239, 68, 68, 0.12)",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    color: "#f87171",
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  <Archive size={12} /> Archive
                </button>
              )}
            </div>
          </div>
        ))}
        {!banners.length && (
          <div className="blank-state">
            <b>Banner</b>
            <p>Create a banner draft to customize your homepage.</p>
          </div>
        )}
      </div>
    </main>
  );
}
