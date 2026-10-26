"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type DashboardData = {
  metrics: { students: number; activeCourses: number; openQueries: number };
  recentStudents: Array<{
    _id: string;
    studentId: string;
    fullName: string;
    admissionStatus: string;
    registrationDate: string;
  }>;
  recentQueries: Array<{
    _id: string;
    subject: string;
    category: string;
    status: string;
    createdAt: string;
    userId?: { pendingName?: string } | null;
  }>;
};

const metricCards = (data: DashboardData["metrics"]): Array<[string, number, string]> => [
  ["Students", data.students, "Registered learners"],
  ["Courses", data.activeCourses, "Published programs"],
  ["Queries", data.openQueries, "Need a response"],
];
const displayDate = (date: string) =>
  new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(
    new Date(date),
  );
const displayStatus = (status: string) => status.replaceAll("_", " ");

export function AdminDashboard() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error?.message ?? "Could not load the dashboard.");
        setDashboard(body.data);
      })
      .catch((reason: Error) => setError(reason.message));
  }, []);

  const metrics = metricCards(dashboard?.metrics ?? { students: 0, activeCourses: 0, openQueries: 0 });

  return (
    <main className="portal-content admin-dashboard">
      <section className="admin-overview-banner">
        <div>
          <p className="kicker">ADMIN DASHBOARD</p>
          <h2>
            Everything at <span>a glance.</span>
          </h2>
          <p>Monitor learners, course availability, and the questions your team needs to answer.</p>
        </div>
        <div className="overview-note">
          <b>Live institute data</b>
          <span>Live overview of your institute</span>
        </div>
      </section>

      {error && <p className="form-error">{error}</p>}

      <section className="metric-grid admin-metric-grid" aria-label="Institute metrics">
        {metrics.map(([label, value, detail], index) => (
          <article className={`admin-metric-card metric-${index + 1}`} key={label}>
            <i aria-hidden="true">{label.slice(0, 1)}</i>
            <div>
              <strong>{dashboard ? value.toLocaleString("en-IN") : "..."}</strong>
              <span>{detail}</span>
            </div>
            <em>{index === 1 ? "— 0%" : "↑ +1"}</em>
          </article>
        ))}
      </section>

      <section className="admin-grid">
        <article className="dashboard-card">
          <div className="card-heading">
            <div>
              <h3>Recent students</h3>
              <span>Latest registered learners on your platform.</span>
            </div>
            <Link href="/admin/students">View all</Link>
          </div>
          {dashboard?.recentStudents.length ? (
            <div className="dashboard-list">
              <div className="activity-list-head">
                <span>STUDENT</span>
                <span>ENROLLMENT ID</span>
                <span>STATUS</span>
                <span>JOINED ON</span>
              </div>
              {dashboard.recentStudents.map((student) => (
                <div className="dashboard-table-row student-table-row" key={student._id}>
                  <div className="activity-person">
                    <span className="dashboard-initial">{student.fullName.slice(0, 1).toUpperCase()}</span>
                    <b>{student.fullName}</b>
                  </div>
                  <span className="activity-id">{student.studentId}</span>
                  <em className={`status-${student.admissionStatus}`}>
                    {displayStatus(student.admissionStatus)}
                  </em>
                  <time>{displayDate(student.registrationDate)}</time>
                </div>
              ))}
            </div>
          ) : (
            <DashboardEmpty message="Student records will appear here after verified registration." />
          )}
        </article>

        <article className="dashboard-card">
          <div className="card-heading">
            <div>
              <h3>Recent queries</h3>
              <span>Latest questions from students and visitors.</span>
            </div>
            <Link href="/admin/queries">View all</Link>
          </div>
          {dashboard?.recentQueries.length ? (
            <div className="dashboard-list">
              <div className="activity-list-head">
                <span>QUERY</span>
                <span>NAME</span>
                <span>STATUS</span>
                <span>DATE</span>
              </div>
              {dashboard.recentQueries.map((query) => (
                <div className="dashboard-table-row query-table-row" key={query._id}>
                  <div>
                    <b>{query.subject}</b>
                    <small>{query.category}</small>
                  </div>
                  <span className="activity-id">{query.userId?.pendingName ?? "Student"}</span>
                  <em className={`status-${query.status}`}>{query.status}</em>
                  <time>{displayDate(query.createdAt)}</time>
                </div>
              ))}
            </div>
          ) : (
            <DashboardEmpty message="Student questions will appear here once they are submitted." />
          )}
        </article>
      </section>
    </main>
  );
}

function DashboardEmpty({ message }: { message: string }) {
  return <p className="dashboard-empty">{message}</p>;
}
