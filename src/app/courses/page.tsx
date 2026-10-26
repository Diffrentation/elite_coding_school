"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BarChart3, BrainCircuit, Braces, Code2, Database, Server, TerminalSquare } from "lucide-react";
type Course = {
  _id: string;
  slug: string;
  title: string;
  icon?: string;
  shortDescription: string;
  durationMonths: number;
  monthlyFee: number;
  level: string;
};
export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [search, setSearch] = useState("");
  const icons = { Code2, Braces, Server, Database, BrainCircuit, BarChart3, TerminalSquare };
  useEffect(() => {
    const timer = setTimeout(
      () =>
        fetch(`/api/courses?search=${encodeURIComponent(search)}`)
          .then((r) => r.json())
          .then((x) => setCourses(x.data?.courses ?? [])),
      300,
    );
    return () => clearTimeout(timer);
  }, [search]);
  return (
    <main className="catalog course-catalog">
      <header>
        <Link className="brand" href="/">
          <span className="brand-mark">&lt;/&gt;</span>
          <span>Elite Coding School</span>
        </Link>
        <Link href="/">Back home</Link>
      </header>
      <p className="kicker">OFFLINE CLASSROOM PROGRAMS</p>
      <h1>Find the right place to start.</h1>
      <p className="catalog-lead">
        Instructor-led programs designed around practical learning, real projects, and mentor support.
      </p>
      <input
        className="catalog-search"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search programs"
        aria-label="Search courses"
      />
      <section>
        {courses.length ? (
          courses.map((course) => (
            <article key={course._id}>
              <span>
                {(() => {
                  const Icon = icons[course.icon as keyof typeof icons] ?? Code2;
                  return <Icon aria-hidden="true" />;
                })()}
              </span>
              <h2>{course.title}</h2>
              <p>{course.shortDescription}</p>
              <small>
                ◷ {course.durationMonths} months · {course.level} · ₹
                {course.monthlyFee.toLocaleString("en-IN")}/month
              </small>
              <Link href={`/courses/${course.slug}`}>View details →</Link>
            </article>
          ))
        ) : (
          <div className="empty-screen">
            <b>◇</b>
            <h3>No published courses yet</h3>
            <p>Our next offline programs will appear here as soon as they are published.</p>
          </div>
        )}
      </section>
    </main>
  );
}
