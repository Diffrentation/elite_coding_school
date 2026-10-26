"use client";

import { FormEvent, useEffect, useState } from "react";

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
  const [message, setMessage] = useState("");
  const [editing, setEditing] = useState<Banner | null>(null);
  const [showForm, setShowForm] = useState(false);

  const load = () =>
    request("/api/admin/banners")
      .then((data) => setBanners(data.banners ?? []))
      .catch((reason: Error) => setMessage(reason.message));

  useEffect(() => {
    void load();
  }, []);

  function startCreate() {
    setEditing(null);
    setShowForm((open) => !open);
  }

  function startEdit(banner: Banner) {
    setMessage("");
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
    setMessage("");
    try {
      if (editing) {
        await request(`/api/admin/banners/${editing._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, status: editing.status, version: editing.version }),
        });
        setMessage("Banner updated.");
      } else {
        await request("/api/admin/banners", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        setMessage("Banner draft created.");
      }
      setEditing(null);
      setShowForm(false);
      void load();
    } catch (reason) {
      setMessage(reason instanceof Error ? reason.message : "Unable to save banner.");
    }
  }

  async function changeStatus(id: string, action: "publish" | "archive") {
    setMessage("");
    try {
      await request(`/api/admin/banners/${id}/${action}`, { method: "POST" });
      setMessage(action === "publish" ? "Banner published." : "Banner archived.");
      void load();
    } catch (reason) {
      setMessage(reason instanceof Error ? reason.message : "Unable to update banner.");
    }
  }

  return (
    <div className="admin-courses">
      <div className="portal-intro">
        <div>
          <p className="kicker">HERO BANNERS</p>
          <h2>Promote what matters now.</h2>
          <p>Draft, review, reorder, and publish homepage messages with their responsive image URLs.</p>
        </div>
        <button className="button primary admin-action" onClick={startCreate}>
          {showForm && !editing ? "Close form" : "Add banner"}
        </button>
      </div>
      {message && <p className="form-success">{message}</p>}
      {showForm && (
        <form className="course-form" key={editing?._id ?? "new"} onSubmit={save}>
          <label>
            Banner title
            <input name="title" defaultValue={editing?.title} required />
          </label>
          <label>
            CTA label
            <input name="ctaLabel" defaultValue={editing?.ctaLabel ?? "Explore courses"} required />
          </label>
          <label>
            Desktop image URL
            <input name="desktopImageUrl" type="url" defaultValue={editing?.desktopImageUrl ?? ""} />
          </label>
          <label>
            Mobile image URL
            <input name="mobileImageUrl" type="url" defaultValue={editing?.mobileImageUrl ?? ""} />
          </label>
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
          <button className="button primary admin-action">
            {editing ? "Save changes" : "Save as draft"}
          </button>
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
            <div>
              <button onClick={() => startEdit(banner)}>Edit</button>
              {banner.status !== "published" && (
                <button onClick={() => changeStatus(banner._id, "publish")}>Publish</button>
              )}
              {banner.status !== "archived" && (
                <button onClick={() => changeStatus(banner._id, "archive")}>Archive</button>
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
    </div>
  );
}
