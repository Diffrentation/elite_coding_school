"use client";

import { useEffect, useState } from "react";

type Enrollment = {
  _id: string;
  courseTitleSnapshot: string;
  agreedMonthlyFee: number;
  batch: string;
  joiningDate: string;
  status: "active" | "completed" | "cancelled";
};
type EnrollmentRequest = {
  _id: string;
  status: string;
  courseId?: { title?: string; durationMonths?: number; monthlyFee?: number };
};

export function StudentCourses() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [error, setError] = useState("");
  const [requests, setRequests] = useState<EnrollmentRequest[]>([]);

  useEffect(() => {
    Promise.all([fetch("/api/me/enrollments"), fetch("/api/me/enrollment-requests")])
      .then(async ([response, requestsResponse]) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error?.message ?? "Could not load enrollments.");
        setEnrollments(body.data.enrollments ?? []);
        const requestsBody = await requestsResponse.json();
        if (requestsResponse.ok) setRequests(requestsBody.data.requests ?? []);
      })
      .catch((reason: Error) => setError(reason.message));
  }, []);

  return (
    <main className="portal-content student-courses">
      <div className="portal-intro">
        <div>
          <p className="kicker">MY COURSES</p>
          <h2>Your learning journey.</h2>
          <p>These are the programs officially assigned to your verified student profile.</p>
        </div>
      </div>
      {error && <p className="form-error">{error}</p>}
      {requests.length > 0 && (
        <section className="student-course-list" aria-label="Enrollment requests">
          {requests.map((request) => (
            <article key={request._id}>
              <span className="course-icon">?</span>
              <div>
                <small>ENROLLMENT REQUEST</small>
                <h3>{request.courseId?.title ?? "Course"}</h3>
                <p>The institute will review your request.</p>
              </div>
              <em className={`status-${request.status}`}>{request.status}</em>
            </article>
          ))}
        </section>
      )}
      <section className="student-course-list" aria-label="My enrolled courses">
        {enrollments.map((enrollment) => (
          <article key={enrollment._id}>
            <span className="course-icon" aria-hidden="true">
              &lt;/&gt;
            </span>
            <div>
              <small>COURSE</small>
              <h3>{enrollment.courseTitleSnapshot}</h3>
              <p>{enrollment.batch}</p>
            </div>
            <div>
              <small>JOINED</small>
              <b>{new Date(enrollment.joiningDate).toLocaleDateString("en-IN", { dateStyle: "medium" })}</b>
            </div>
            <div>
              <small>MONTHLY FEE</small>
              <b>Rs. {enrollment.agreedMonthlyFee.toLocaleString("en-IN")}</b>
            </div>
            <em className={`status-${enrollment.status}`}>{enrollment.status}</em>
          </article>
        ))}
        {!enrollments.length && (
          <div className="empty-screen">
            <b>Course</b>
            <h3>No course enrollment yet</h3>
            <p>When the institute assigns a course, its batch and fee details will appear here.</p>
          </div>
        )}
      </section>
    </main>
  );
}
