"use client";

import { FormEvent, useEffect, useState } from "react";

type Student = { _id: string; fullName: string; studentId: string };
type Course = { _id: string; title: string; monthlyFee: number; status: string };
type Enrollment = {
  _id: string;
  courseTitleSnapshot: string;
  agreedMonthlyFee: number;
  batch: string;
  joiningDate: string;
  status: string;
  studentId?: { fullName?: string; studentId?: string } | null;
};
type EnrollmentRequest = {
  _id: string;
  status: "pending" | "approved" | "rejected";
  studentId?: { fullName?: string; studentId?: string };
  courseId?: { title?: string; monthlyFee?: number };
};

const request = async (url: string, init?: RequestInit) => {
  const response = await fetch(url, init);
  const body = await response.json();
  if (!response.ok) throw new Error(body.error?.message ?? "Request failed.");
  return body.data;
};

export function AdminEnrollments() {
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [enrollmentRequests, setEnrollmentRequests] = useState<EnrollmentRequest[]>([]);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = () =>
    Promise.all([
      request("/api/admin/students?limit=100"),
      request("/api/admin/courses"),
      request("/api/admin/enrollments"),
      request("/api/admin/enrollment-requests"),
    ])
      .then(([studentData, courseData, enrollmentData, requestData]) => {
        setStudents(studentData.students ?? []);
        setCourses((courseData.courses ?? []).filter((course: Course) => course.status === "published"));
        setEnrollments(enrollmentData.enrollments ?? []);
        setEnrollmentRequests(requestData.requests ?? []);
      })
      .catch((reason: Error) => setMessage(reason.message));

  useEffect(() => {
    void load();
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setMessage("");
    setSubmitting(true);
    try {
      await request("/api/admin/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: form.get("studentId"),
          courseId: form.get("courseId"),
          batch: form.get("batch"),
          joiningDate: form.get("joiningDate"),
          agreedMonthlyFee: Number(form.get("agreedMonthlyFee")),
        }),
      });
      event.currentTarget.reset();
      setMessage("Student enrolled successfully.");
      void load();
    } catch (reason) {
      setMessage(reason instanceof Error ? reason.message : "Could not create enrollment.");
    } finally {
      setSubmitting(false);
    }
  }

  async function reviewRequest(id: string, action: "approve" | "reject") {
    setMessage("");
    try {
      await request(`/api/admin/enrollment-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      setMessage(`Enrollment request ${action === "approve" ? "approved" : "rejected"}.`);
      void load();
    } catch (reason) {
      setMessage(reason instanceof Error ? reason.message : "Could not review request.");
    }
  }

  return (
    <main className="portal-content admin-enrollments">
      <div className="portal-intro">
        <div>
          <p className="kicker">ADMISSIONS</p>
          <h2>Create an enrollment.</h2>
          <p>Assign a verified student to a published course while preserving the agreed fee snapshot.</p>
        </div>
      </div>
      {message && <p className="form-success">{message}</p>}
      <section className="enrollment-table" aria-label="Enrollment requests">
        <h3>Student enrollment requests</h3>
        {enrollmentRequests
          .filter((item) => item.status === "pending")
          .map((item) => (
            <article key={item._id}>
              <div>
                <b>{item.studentId?.fullName ?? "Student"}</b>
                <small>{item.studentId?.studentId ?? ""}</small>
              </div>
              <div>
                <b>{item.courseId?.title ?? "Course"}</b>
                <small>Rs. {item.courseId?.monthlyFee?.toLocaleString("en-IN") ?? "0"}/month</small>
              </div>
              <em className="status-pending">Pending</em>
              <div>
                <button onClick={() => reviewRequest(item._id, "approve")}>Approve</button>
                <button onClick={() => reviewRequest(item._id, "reject")}>Reject</button>
              </div>
            </article>
          ))}
        {!enrollmentRequests.some((item) => item.status === "pending") && (
          <p className="dashboard-empty">No pending enrollment requests.</p>
        )}
      </section>
      <form className="course-form" onSubmit={submit}>
        <label>
          Student
          <select name="studentId" required>
            <option value="">Select a student</option>
            {students.map((student) => (
              <option key={student._id} value={student._id}>
                {student.fullName} ({student.studentId})
              </option>
            ))}
          </select>
        </label>
        <label>
          Published course
          <select name="courseId" required>
            <option value="">Select a course</option>
            {courses.map((course) => (
              <option key={course._id} value={course._id}>
                {course.title} (Rs. {course.monthlyFee.toLocaleString("en-IN")}/month)
              </option>
            ))}
          </select>
        </label>
        <label>
          Batch
          <input name="batch" minLength={2} required placeholder="Weekday evening batch" />
        </label>
        <label>
          Joining date
          <input name="joiningDate" type="date" required />
        </label>
        <label>
          Agreed monthly fee
          <input name="agreedMonthlyFee" type="number" min="0" required />
        </label>
        <button className="button primary admin-action" disabled={submitting}>
          {submitting ? "Creating..." : "Create enrollment"}
        </button>
      </form>

      <section className="enrollment-table" aria-label="Enrollments">
        <h3>Existing enrollments</h3>
        {enrollments.map((enrollment) => (
          <article key={enrollment._id}>
            <div>
              <b>{enrollment.studentId?.fullName ?? "Student"}</b>
              <small>{enrollment.studentId?.studentId ?? ""}</small>
            </div>
            <div>
              <b>{enrollment.courseTitleSnapshot}</b>
              <small>{enrollment.batch}</small>
            </div>
            <div>
              <b>Rs. {enrollment.agreedMonthlyFee.toLocaleString("en-IN")}</b>
              <small>monthly fee</small>
            </div>
            <em className={`status-${enrollment.status}`}>{enrollment.status}</em>
          </article>
        ))}
        {!enrollments.length && <p className="dashboard-empty">No enrollments have been created yet.</p>}
      </section>
    </main>
  );
}
