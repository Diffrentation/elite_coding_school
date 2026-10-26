"use client";

import { FormEvent, useEffect, useState } from "react";

type QueryStatus = "new" | "answered" | "closed";

type StudentQuery = {
  _id: string;
  category: string;
  subject: string;
  status: QueryStatus;
  messages: { authorRole: "student" | "admin"; body: string; createdAt: string }[];
  userId?: { email?: string; pendingName?: string } | null;
};

export function AdminQueries() {
  const [queries, setQueries] = useState<StudentQuery[]>([]);
  const [status, setStatus] = useState<"all" | QueryStatus>("all");
  const [error, setError] = useState("");
  const [sendingId, setSendingId] = useState("");

  useEffect(() => {
    const url = status === "all" ? "/api/admin/queries" : `/api/admin/queries?status=${status}`;
    fetch(url)
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error?.message ?? "Could not load queries.");
        setQueries(body.data.queries ?? []);
      })
      .catch((reason: Error) => setError(reason.message));
  }, [status]);

  async function reply(event: FormEvent<HTMLFormElement>, queryId: string) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const message = String(form.get("message") ?? "");
    const nextStatus = String(form.get("status") ?? "answered") as QueryStatus;
    setError("");
    setSendingId(queryId);
    try {
      const response = await fetch(`/api/admin/queries/${queryId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, status: nextStatus }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error?.message ?? "Could not save the reply.");
      setQueries((current) => current.map((query) => (query._id === queryId ? body.data.query : query)));
      event.currentTarget.reset();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not save the reply.");
    } finally {
      setSendingId("");
    }
  }

  return (
    <main className="portal-content admin-queries">
      <div className="portal-intro">
        <div>
          <p className="kicker">STUDENT SUPPORT</p>
          <h2>Query queue</h2>
          <p>Reply to questions from verified students and close a conversation only when it is resolved.</p>
        </div>
      </div>

      <div className="filter-row" aria-label="Query status filter">
        {(["all", "new", "answered", "closed"] as const).map((item) => (
          <button
            className={status === item ? "selected" : ""}
            key={item}
            onClick={() => {
              setError("");
              setStatus(item);
            }}
          >
            {item}
          </button>
        ))}
      </div>
      {error && <p className="form-error">{error}</p>}

      <section className="admin-query-list">
        {queries.map((query) => (
          <article key={query._id}>
            <header>
              <div>
                <span className={`status-${query.status}`}>{query.status}</span>
                <h3>{query.subject}</h3>
                <small>
                  {query.userId?.pendingName ?? "Student"} · {query.userId?.email ?? "No email"} ·{" "}
                  {query.category}
                </small>
              </div>
            </header>
            <div className="query-thread">
              {query.messages.map((message, index) => (
                <p className={message.authorRole} key={`${message.createdAt}-${index}`}>
                  <b>{message.authorRole === "admin" ? "Institute team" : "Student"}</b>
                  {message.body}
                </p>
              ))}
            </div>
            {query.status !== "closed" && (
              <form onSubmit={(event) => reply(event, query._id)}>
                <textarea name="message" minLength={1} required placeholder="Write a clear response..." />
                <select aria-label="New query status" name="status" defaultValue="answered">
                  <option value="answered">Reply and mark answered</option>
                  <option value="closed">Reply and close</option>
                  <option value="new">Keep as new</option>
                </select>
                <button className="button primary" disabled={sendingId === query._id}>
                  {sendingId === query._id ? "Sending..." : "Send reply"}
                </button>
              </form>
            )}
          </article>
        ))}
        {!queries.length && (
          <p className="dashboard-empty">No {status === "all" ? "" : status} queries found.</p>
        )}
      </section>
    </main>
  );
}
