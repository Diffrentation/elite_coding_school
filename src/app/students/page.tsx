"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";

type Student = {
  studentId: string;
  fullName: string;
  profileImageUrl?: string | null;
  courseName?: string;
  batch?: string;
  completionDate?: string;
};
export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [course, setCourse] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const query = new URLSearchParams({ limit: "24" });
    if (search) query.set("search", search);
    if (course) query.set("course", course);
    setLoading(true);
    fetch(`/api/students?${query}`)
      .then((r) => r.json())
      .then((body) => {
        setStudents(body.data?.students ?? []);
        setCourses(body.data?.courses ?? []);
      })
      .finally(() => setLoading(false));
  }, [search, course]);
  return (
    <>
      <Navbar />
      <main className="public-page" style={{ padding: "110px max(24px, 8vw) 60px", minHeight: "75vh" }}>
        <p className="kicker">STUDENT DIRECTORY</p>
        <h1>Our certified learners</h1>
        <p style={{ color: "#94a3b8", maxWidth: 680 }}>
          Meet students who have explicitly approved their public profile and earned an active Elite Coding
          School certificate.
        </p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", margin: "28px 0" }}>
          <input
            aria-label="Search students"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by student name"
          />
          <select
            aria-label="Filter by course"
            value={course}
            onChange={(event) => setCourse(event.target.value)}
          >
            <option value="">All completed courses</option>
            {courses.map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
        </div>
        <div
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 18 }}
        >
          {students.map((student) => (
            <Link
              key={student.studentId}
              href={`/students/${student.studentId}`}
              className="admin-enrollment-requests-card"
              style={{ textDecoration: "none", color: "inherit", padding: 20 }}
            >
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                {student.profileImageUrl ? (
                  <img
                    src={student.profileImageUrl}
                    alt=""
                    width={52}
                    height={52}
                    style={{ borderRadius: "50%", objectFit: "cover" }}
                  />
                ) : (
                  <span className="profile-avatar">{student.fullName.slice(0, 2).toUpperCase()}</span>
                )}
                <div>
                  <b>{student.fullName}</b>
                  <small style={{ display: "block", color: "#94a3b8" }}>{student.batch}</small>
                </div>
              </div>
              <p style={{ color: "#38bdf8", marginBottom: 0 }}>{student.courseName}</p>
            </Link>
          ))}
        </div>
        {!loading && !students.length && (
          <p className="empty-state">No public student profiles match this search.</p>
        )}
      </main>
      <Footer />
    </>
  );
}
