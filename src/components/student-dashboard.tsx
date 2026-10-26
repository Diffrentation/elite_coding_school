"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Dashboard = {
  student: { fullName: string; studentId: string; admissionStatus: string };
  enrollments: Array<{ _id: string; courseTitleSnapshot: string; batch: string; status: string }>;
  outstandingFee: number;
  openQueries: number;
};

export function StudentDashboard() {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/me/dashboard")
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error?.message ?? "Could not load your dashboard.");
        setDashboard(body.data);
      })
      .catch((reason: Error) => setError(reason.message));
  }, []);

  const name = dashboard?.student.fullName ?? "Student";
  const enrollment = dashboard?.enrollments[0];

  return (
    <main className="portal-content">
      <div className="portal-intro">
        <div>
          <p className="kicker">STUDENT DASHBOARD</p>
          <p>Keep an eye on your course access, fee status, and questions for the institute team.</p>
        </div>
        <span className="status-pill">
          {dashboard?.student.admissionStatus.replaceAll("_", " ") ?? "Loading"}
        </span>
      </div>
      {error && <p className="form-error">{error}</p>}
      <section className="student-summary">
        <article className="profile-preview">
          <span className="avatar">{name.slice(0, 2).toUpperCase()}</span>
          <div>
            <small>STUDENT ID</small>
            <h3>{dashboard?.student.studentId ?? "Loading..."}</h3>
            <p>{dashboard?.student.admissionStatus.replaceAll("_", " ") ?? ""}</p>
          </div>
          <Link href="/student/profile">View profile &rarr;</Link>
        </article>
        <article className="empty-panel">
          <span>Course</span>
          <h3>{enrollment?.courseTitleSnapshot ?? "No active course"}</h3>
          <p>{enrollment ? enrollment.batch : "Explore our programs or ask the institute team for help."}</p>
          <Link href={enrollment ? "/student/courses" : "/courses"}>
            {enrollment ? "View course" : "Explore courses"} &rarr;
          </Link>
        </article>
      </section>
      <section className="student-dashboard-metrics" aria-label="Student overview">
        <article>
          <small>OUTSTANDING FEES</small>
          <b>Rs. {(dashboard?.outstandingFee ?? 0).toLocaleString("en-IN")}</b>
          <Link href="/student/fees">View fees</Link>
        </article>
        <article>
          <small>OPEN QUERIES</small>
          <b>{dashboard?.openQueries ?? 0}</b>
          <Link href="/student/queries">View queries</Link>
        </article>
      </section>
      <section className="quick-actions">
        <h3>Quick actions</h3>
        <div>
          <Link href="/student/profile">
            P
            <span>
              My Profile<small>Manage personal details</small>
            </span>
            &rarr;
          </Link>
          <Link href="/student/queries">
            Q
            <span>
              My Queries<small>Ask or track questions</small>
            </span>
            &rarr;
          </Link>
          <Link href="/student/fees">
            F
            <span>
              Fees & Receipts<small>Review your payments</small>
            </span>
            &rarr;
          </Link>
        </div>
      </section>
    </main>
  );
}
