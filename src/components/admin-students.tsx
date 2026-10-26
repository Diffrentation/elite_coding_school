"use client";

import { FormEvent, useEffect, useState } from "react";

type Student = {
  _id: string;
  studentId: string;
  fullName: string;
  phone: string;
  admissionStatus: string;
  registrationDate: string;
  userId?: { email?: string; accountStatus?: string } | null;
};

type Pagination = { page: number; total: number; totalPages: number };

const statuses = ["", "not_enrolled", "pending", "approved", "rejected"];

export function AdminStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchDraft, setSearchDraft] = useState("");
  const [search, setSearch] = useState("");
  const [admissionStatus, setAdmissionStatus] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, total: 0, totalPages: 0 });
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams({
      page: String(page),
      limit: "20",
      sortBy,
      sortDirection,
    });
    if (search) params.set("search", search);
    if (admissionStatus) params.set("admissionStatus", admissionStatus);

    fetch(`/api/admin/students?${params.toString()}`)
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error?.message ?? "Could not load students.");
        setStudents(body.data.students ?? []);
        setPagination(body.data.pagination);
      })
      .catch((reason: Error) => setError(reason.message));
  }, [admissionStatus, page, search, sortBy, sortDirection]);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPage(1);
    setSearch(searchDraft.trim());
  }

  function updateFilter(status: string) {
    setError("");
    setPage(1);
    setAdmissionStatus(status);
  }

  function updateSort(nextSort: string) {
    setPage(1);
    if (sortBy === nextSort) {
      setSortDirection((direction) => (direction === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(nextSort);
      setSortDirection("asc");
    }
  }

  return (
    <main className="portal-content admin-students">
      <div className="portal-intro">
        <div>
          <p className="kicker">STUDENT MANAGEMENT</p>
          <h2>Student records</h2>
          <p>Find verified learners, review their admission status, and keep your records organized.</p>
        </div>
        <span className="status-pill neutral">{pagination.total.toLocaleString("en-IN")} total</span>
      </div>

      <form className="student-tools" onSubmit={submitSearch}>
        <input
          aria-label="Search students"
          placeholder="Search name, student ID, or phone"
          value={searchDraft}
          onChange={(event) => setSearchDraft(event.target.value)}
        />
        <select
          aria-label="Admission status"
          value={admissionStatus}
          onChange={(event) => updateFilter(event.target.value)}
        >
          {statuses.map((status) => (
            <option key={status || "all"} value={status}>
              {status ? status.replaceAll("_", " ") : "All admission statuses"}
            </option>
          ))}
        </select>
        <button className="button primary" type="submit">
          Search
        </button>
      </form>

      {error && <p className="form-error">{error}</p>}

      <section className="student-table" aria-label="Student records">
        <div className="student-table-head">
          <button onClick={() => updateSort("fullName")}>Student</button>
          <span>Contact</span>
          <button onClick={() => updateSort("studentId")}>Student ID</button>
          <button onClick={() => updateSort("admissionStatus")}>Admission</button>
          <button onClick={() => updateSort("registrationDate")}>Registered</button>
        </div>
        {students.map((student) => (
          <article key={student._id}>
            <div>
              <b>{student.fullName}</b>
              <small>{student.userId?.accountStatus ?? "pending"} account</small>
            </div>
            <div>
              <b>{student.userId?.email ?? "No email"}</b>
              <small>{student.phone}</small>
            </div>
            <code>{student.studentId}</code>
            <em className={`status-${student.admissionStatus}`}>
              {student.admissionStatus.replaceAll("_", " ")}
            </em>
            <time dateTime={student.registrationDate}>
              {new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(
                new Date(student.registrationDate),
              )}
            </time>
          </article>
        ))}
        {!students.length && <p className="dashboard-empty">No student records match the current filters.</p>}
      </section>

      {pagination.totalPages > 1 && (
        <nav className="pagination" aria-label="Student table pagination">
          <button disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>
            Previous
          </button>
          <span>
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button disabled={page >= pagination.totalPages} onClick={() => setPage((current) => current + 1)}>
            Next
          </button>
        </nav>
      )}
    </main>
  );
}
