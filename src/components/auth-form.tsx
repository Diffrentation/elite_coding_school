"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { ArrowRight, Cpu, Monitor, Network, Users } from "lucide-react";

type Mode = "login" | "register" | "verify" | "forgot" | "reset";
const call = async (url: string, body: object) => {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const result = await response.json();
  if (!response.ok || !result.success) throw new Error(result.error?.message ?? "Something went wrong.");
  return result.data;
};

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (mode === "reset") setEmail(new URLSearchParams(window.location.search).get("email") ?? "");
  }, [mode]);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    const values = new FormData(event.currentTarget);
    try {
      if (mode === "register") {
        await call("/api/auth/register", {
          fullName: values.get("fullName"),
          email,
          phone: values.get("phone"),
          password: values.get("password"),
          confirmPassword: values.get("confirmPassword"),
          acceptedTerms: values.get("terms") === "on",
        });
        router.push(`/verify-email?email=${encodeURIComponent(email)}`);
        return;
      }
      if (mode === "login") {
        const result = await call("/api/auth/login", { email, password: values.get("password") });
        if (typeof window !== "undefined") {
          try {
            sessionStorage.removeItem("ecs_session_user");
            sessionStorage.removeItem("ecs_session_checked");
          } catch {
            // ignore
          }
        }
        router.push(result.redirectTo);
        return;
      }
      if (mode === "verify") {
        await call("/api/auth/verify-email", { email, code: values.get("code") });
        router.push("/student");
        return;
      }
      if (mode === "forgot") {
        await call("/api/auth/forgot-password", { email });
        router.push(`/reset-password?email=${encodeURIComponent(email)}`);
        return;
      }
      await call("/api/auth/reset-password", {
        email,
        code: values.get("code"),
        password: values.get("password"),
        confirmPassword: values.get("confirmPassword"),
      });
      router.push("/login");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };
  const title = {
    login: "Welcome back",
    register: "Begin your learning journey",
    verify: "Verify your email",
    forgot: "Reset your password",
    reset: "Choose a new password",
  }[mode];
  return (
    <main className="auth-page">
      <Link href="/" className="brand">
        <span className="brand-mark">&lt;/&gt;</span>
        <span>Elite Coding School</span>
        <span className="brand-offline-tag" style={{ marginLeft: "12px" }}>
          <span className="pulse-dot" />
          Offline Tech Lab
        </span>
      </Link>
      <div className="auth-layout">
        <section className="auth-art" aria-hidden="true">
          <div className="auth-art-glow" />
          <div className="auth-art-copy">
            <p>OFFLINE COACHING CENTER &bull; IN-PERSON CLASSES</p>
            <h2>Learn Directly From Teachers in Classroom.</h2>
            <span>
              Master MERN Stack, Next.js, DSA, C, C++, Java, Python, Networking, Linux OS &amp; System Design
              with daily 1:1 teacher guidance.
            </span>
          </div>
          <div className="auth-art-benefits">
            <div className="auth-benefit-item">
              <Monitor size={22} />
              <div>
                <strong>Bring Your Laptop</strong>
                <span>Dedicated power sockets &amp; fast Wi-Fi</span>
              </div>
            </div>
            <div className="auth-benefit-item">
              <Network size={22} />
              <div>
                <strong>Hands-On Coding</strong>
                <span>Daily practical exercises in class</span>
              </div>
            </div>
            <div className="auth-benefit-item">
              <Users size={22} />
              <div>
                <strong>1:1 Teacher Help</strong>
                <span>Instant desk guidance when stuck</span>
              </div>
            </div>
            <div className="auth-benefit-item">
              <Users size={22} />
              <div>
                <strong>Hacker Cohorts</strong>
                <span>Daily standups &amp; hackathons</span>
              </div>
            </div>
          </div>
          <div className="auth-art-stats">
            <span>
              <b>10–15</b>Small batch size
            </span>
            <span>
              <b>1:1</b>Teacher desk help
            </span>
            <span>
              <b>Daily</b>Hands-on laptop coding
            </span>
          </div>
        </section>
        <section className="auth-card">
          <span className="kicker">{mode === "register" ? "STUDENT ONBOARDING" : "PORTAL ACCESS"}</span>
          <h1>{title}</h1>
          <p className="auth-subtitle">
            {mode === "verify"
              ? "Enter the six-digit code we sent to your email."
              : mode === "forgot"
                ? "We will send a single-use code to your registered email."
                : "Student & Faculty Portal &bull; Elite Coding School"}
          </p>
          <form onSubmit={submit} className={mode === "register" ? "auth-register-form" : undefined}>
            {mode === "register" && (
              <>
                <label className="auth-field">
                  Full name
                  <input name="fullName" required maxLength={80} placeholder="Your full name" />
                </label>
                <label className="auth-field">
                  Mobile number
                  <input name="phone" type="tel" inputMode="numeric" required placeholder="9876543210" />
                </label>
              </>
            )}
            <label className={mode === "register" ? "auth-field auth-field-wide" : undefined}>
              Email address
              <input
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </label>
            {["verify", "reset"].includes(mode) && (
              <label className={mode === "register" ? "auth-field" : undefined}>
                Verification code
                <input
                  name="code"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  required
                  placeholder="123456"
                />
              </label>
            )}
            {["login", "register", "reset"].includes(mode) && (
              <label className={mode === "register" ? "auth-field" : undefined}>
                Password
                <input
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  placeholder="At least 8 characters"
                />
              </label>
            )}
            {["register", "reset"].includes(mode) && (
              <label className={mode === "register" ? "auth-field" : undefined}>
                Confirm password
                <input
                  name="confirmPassword"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="Repeat your password"
                />
              </label>
            )}
            {mode === "register" && (
              <label className="terms">
                <input name="terms" type="checkbox" required />I accept the terms and privacy policy.
              </label>
            )}
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            {message && <p className="form-success">{message}</p>}
            <button className="auth-submit" disabled={busy}>
              <span>
                {busy
                  ? "Please wait…"
                  : mode === "login"
                    ? "Log In to Student Portal"
                    : mode === "register"
                      ? "Create Student Account"
                      : mode === "verify"
                        ? "Verify Account"
                        : mode === "forgot"
                          ? "Send Reset Code"
                          : "Reset Password"}
              </span>
              {!busy && <ArrowRight size={17} />}
            </button>
          </form>
          {mode === "login" && (
            <>
              <Link className="auth-inline" href="/forgot-password">
                Forgot password?
              </Link>
              <a className="google-button" href="/api/auth/google">
                G&nbsp; Continue with Google
              </a>
            </>
          )}
          <p className="auth-switch">
            {mode === "login" ? (
              <>
                New here? <Link href="/register">Create an account</Link>
              </>
            ) : mode === "register" ? (
              <>
                Already registered? <Link href="/login">Log in</Link>
              </>
            ) : (
              <Link href="/login">Back to login</Link>
            )}
          </p>
        </section>
      </div>
    </main>
  );
}
