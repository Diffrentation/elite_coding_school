"use client";

import { ChangeEvent, useEffect, useState } from "react";

type Profile = {
  fullName: string;
  phone: string;
  email: string;
  studentId: string;
  admissionStatus: string;
  profileImageUrl: string | null;
  version: number;
};

export function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetch("/api/me/profile")
      .then((response) => response.json())
      .then((body) => setProfile(body.data?.profile ?? null));
  }, []);

  async function save(form: FormData) {
    if (!profile) return;
    const response = await fetch("/api/me/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: form.get("fullName"),
        phone: form.get("phone"),
        version: profile.version,
      }),
    });
    const body = await response.json();
    if (!response.ok) {
      setMessage(body.error?.message ?? "Unable to save changes.");
      return;
    }
    setProfile((current) => (current ? { ...current, ...body.data.profile } : current));
    setEditing(false);
    setMessage("Profile updated.");
  }

  async function uploadImage(event: ChangeEvent<HTMLInputElement>) {
    const image = event.target.files?.[0];
    if (!image || !profile) return;
    setUploading(true);
    setMessage("");
    try {
      const form = new FormData();
      form.set("image", image);
      const response = await fetch("/api/me/profile-image", { method: "POST", body: form });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error?.message ?? "Could not upload profile image.");
      setProfile({ ...profile, profileImageUrl: body.data.imageUrl, version: profile.version + 1 });
      setMessage("Profile image updated.");
    } catch (reason) {
      setMessage(reason instanceof Error ? reason.message : "Could not upload profile image.");
    } finally {
      event.target.value = "";
      setUploading(false);
    }
  }

  async function removeImage() {
    if (!profile) return;
    setUploading(true);
    setMessage("");
    try {
      const response = await fetch("/api/me/profile-image", { method: "DELETE" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error?.message ?? "Could not remove profile image.");
      setProfile({ ...profile, profileImageUrl: null, version: profile.version + 1 });
      setMessage("Profile image removed.");
    } catch (reason) {
      setMessage(reason instanceof Error ? reason.message : "Could not remove profile image.");
    } finally {
      setUploading(false);
    }
  }

  if (!profile)
    return (
      <div className="empty-screen">
        <b>Profile</b>
        <h3>Loading your profile...</h3>
      </div>
    );

  const initials = profile.fullName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);

  return (
    <div className="profile-page">
      <div className="profile-card">
        {profile.profileImageUrl ? (
          <span className="profile-photo" style={{ backgroundImage: `url(${profile.profileImageUrl})` }} />
        ) : (
          <span className="avatar">{initials}</span>
        )}
        <div>
          <p className="kicker">STUDENT PROFILE</p>
          <h2>{profile.fullName}</h2>
          <p>
            {profile.studentId} · {profile.admissionStatus.replaceAll("_", " ")}
          </p>
        </div>
        <button className="button primary" onClick={() => setEditing((current) => !current)}>
          {editing ? "Cancel" : "Edit profile"}
        </button>
      </div>
      <div className="profile-image-actions">
        <label className="button secondary">
          {uploading ? "Uploading..." : "Upload photo"}
          <input
            accept="image/jpeg,image/png,image/webp"
            disabled={uploading}
            type="file"
            onChange={uploadImage}
          />
        </label>
        {profile.profileImageUrl && (
          <button className="profile-remove" disabled={uploading} onClick={removeImage}>
            Remove photo
          </button>
        )}
      </div>
      {message && <p className="form-success">{message}</p>}
      <form className="profile-details" action={save}>
        <label>
          Student ID
          <input value={profile.studentId} disabled />
        </label>
        <label>
          Email address
          <input value={profile.email} disabled />
        </label>
        <label>
          Full name
          <input name="fullName" defaultValue={profile.fullName} disabled={!editing} required />
        </label>
        <label>
          Mobile number
          <input name="phone" defaultValue={profile.phone} disabled={!editing} required />
        </label>
        {editing && (
          <button className="button primary" type="submit">
            Save changes
          </button>
        )}
      </form>
    </div>
  );
}
