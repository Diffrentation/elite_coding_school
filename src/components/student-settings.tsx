"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const postJson = async (url: string, body: Record<string, unknown>) => {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message ?? "Request failed.");
  return data.data;
};

export function StudentSettings() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function changeEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setEmailMessage("");
    try {
      const data = await postJson("/api/me/change-email", code ? { email, code } : { email });
      setEmailMessage(data.message ?? "Email update request complete.");
      if (code) {
        setCode("");
        setEmail("");
      }
    } catch (reason) {
      setEmailMessage(reason instanceof Error ? reason.message : "Could not update email.");
    } finally {
      setSaving(false);
    }
  }

  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const newPassword = String(form.get("newPassword") ?? "");
    const confirmPassword = String(form.get("confirmPassword") ?? "");
    setPasswordMessage("");
    if (newPassword !== confirmPassword) {
      setPasswordMessage("New passwords do not match.");
      return;
    }
    setSaving(true);
    try {
      const data = await postJson("/api/me/change-password", {
        currentPassword: form.get("currentPassword"),
        newPassword,
      });
      setPasswordMessage(data.message ?? "Password updated.");
      event.currentTarget.reset();
    } catch (reason) {
      setPasswordMessage(reason instanceof Error ? reason.message : "Could not update password.");
    } finally {
      setSaving(false);
    }
  }

  async function logout() {
    setLoggingOut(true);
    try {
      if (typeof window !== "undefined") {
        try {
          sessionStorage.removeItem("ecs_session_user");
          sessionStorage.removeItem("ecs_session_checked");
        } catch {
          // ignore
        }
      }
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.replace("/login");
      router.refresh();
    }
  }

  return (
    <main className="portal-content student-settings">
      <div className="portal-intro">
        <div>
          <p className="kicker">ACCOUNT SETTINGS</p>
          <h2>Keep your account secure.</h2>
          <p>
            Changes to your email address require an OTP confirmation. Password changes revoke other sessions.
          </p>
        </div>
      </div>
      <div className="account-settings-grid">
        <section className="account-settings-card">
          <h3>Change email address</h3>
          <p>Enter a new email, request a code, then submit the code to confirm the change.</p>
          {emailMessage && <p className="form-success">{emailMessage}</p>}
          <form onSubmit={changeEmail}>
            <label>
              New email address
              <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
            </label>
            <label>
              Verification code
              <input
                inputMode="numeric"
                maxLength={6}
                placeholder="Enter after requesting a code"
                value={code}
                onChange={(event) => setCode(event.target.value)}
              />
            </label>
            <button className="button primary" disabled={saving}>
              {code ? "Confirm email" : "Send verification code"}
            </button>
          </form>
        </section>

        <section className="account-settings-card">
          <h3>Change password</h3>
          <p>Use a unique password with at least eight characters.</p>
          {passwordMessage && <p className="form-success">{passwordMessage}</p>}
          <form onSubmit={changePassword}>
            <label>
              Current password
              <input name="currentPassword" required type="password" autoComplete="current-password" />
            </label>
            <label>
              New password
              <input name="newPassword" required minLength={8} type="password" autoComplete="new-password" />
            </label>
            <label>
              Confirm new password
              <input
                name="confirmPassword"
                required
                minLength={8}
                type="password"
                autoComplete="new-password"
              />
            </label>
            <button className="button primary" disabled={saving}>
              Update password
            </button>
          </form>
        </section>
        <section className="account-settings-card account-signout-card">
          <h3>Sign out</h3>
          <p>
            End this session on this device. You can sign in again whenever you need to access your portal.
          </p>
          <button type="button" className="account-signout" disabled={loggingOut} onClick={logout}>
            {loggingOut ? "Signing out..." : "Log out"}
          </button>
        </section>
      </div>
    </main>
  );
}
