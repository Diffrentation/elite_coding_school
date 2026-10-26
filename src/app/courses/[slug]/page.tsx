"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
type Course = {
  _id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  durationMonths: number;
  monthlyFee: number;
  skills: string[];
  prerequisites: string[];
  syllabus: { id: string; title: string; topics: string[] }[];
};
export default function CourseDetail({ params }: { params: Promise<{ slug: string }> }) {
  const [course, setCourse] = useState<Course | null>(null);
  const [enrolling, setEnrolling] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => {
    params.then(({ slug }) =>
      fetch(`/api/courses/${slug}`)
        .then((r) => r.json())
        .then((x) => setCourse(x.data?.course ?? null)),
    );
  }, [params]);
  async function enroll() {
    if (!course) return;
    setEnrolling(true);
    setMessage("");
    try {
      const response = await fetch("/api/me/enrollment-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: course._id }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error?.message ?? "Could not request enrollment.");
      setMessage("Enrollment request sent to the institute.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not request enrollment.");
    } finally {
      setEnrolling(false);
    }
  }
  if (!course)
    return (
      <main className="catalog">
        <div className="empty-screen">
          <b>◇</b>
          <h3>Loading course details…</h3>
        </div>
      </main>
    );
  return (
    <main className="catalog">
      <header>
        <Link className="brand" href="/">
          <span className="brand-mark">&lt;/&gt;</span>
          <span>Elite Coding School</span>
        </Link>
        <Link href="/courses">All courses</Link>
      </header>
      <div className="course-detail">
        <p className="kicker">OFFLINE CLASSROOM PROGRAM</p>
        <h1>{course.title}</h1>
        <p className="catalog-lead">{course.description}</p>
        <div className="course-facts">
          <span>{course.level}</span>
          <span>{course.durationMonths} months</span>
          <span>₹{course.monthlyFee.toLocaleString("en-IN")}/month</span>
        </div>
        <button className="button primary" disabled={enrolling} onClick={enroll}>
          Register interest →
        </button>
        {message && (
          <p
            className={
              message === "Enrollment request sent to the institute." ? "form-success" : "form-error"
            }
          >
            {message}
          </p>
        )}
        <h2>Course details</h2>
        <div className="course-facts">
          <span>{course.category}</span>
          {course.skills.map((skill) => (
            <span key={skill}>{skill}</span>
          ))}
        </div>
        {course.prerequisites.length > 0 && (
          <p className="catalog-lead">
            <b>Prerequisites:</b> {course.prerequisites.join(", ")}
          </p>
        )}
        <h2>What you&apos;ll learn</h2>
        {course.syllabus.map((module) => (
          <details key={module.id}>
            <summary>{module.title}</summary>
            <ul>
              {module.topics.map((topic) => (
                <li key={topic}>{topic}</li>
              ))}
            </ul>
          </details>
        ))}
      </div>
    </main>
  );
}
