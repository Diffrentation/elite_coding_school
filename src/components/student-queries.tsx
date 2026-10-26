"use client";
import { FormEvent, useEffect, useState } from "react";
type Query = {
  _id: string;
  category: string;
  subject: string;
  status: string;
  messages: { authorRole: string; body: string; createdAt: string }[];
};
export function StudentQueries() {
  const [queries, setQueries] = useState<Query[]>([]);
  const [message, setMessage] = useState("");
  const load = () =>
    fetch("/api/queries/my")
      .then((r) => r.json())
      .then((x) => setQueries(x.data?.queries ?? []));
  useEffect(() => {
    void load();
  }, []);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/queries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category: form.get("category"),
        subject: form.get("subject"),
        message: form.get("message"),
      }),
    });
    const body = await response.json();
    setMessage(body.success ? "Your query has been sent." : (body.error?.message ?? "Unable to send query."));
    if (body.success) {
      event.currentTarget.reset();
      load();
    }
  };
  return (
    <div className="queries">
      <div className="portal-intro">
        <div>
          <p className="kicker">STUDENT QUERIES</p>
          <h2>Ask our team.</h2>
          <p>Only you and the institute team can view the questions submitted from your account.</p>
        </div>
      </div>
      {message && <p className="form-success">{message}</p>}
      <form className="course-form" onSubmit={submit}>
        <label>
          Category
          <select name="category" defaultValue="Course">
            <option>Course</option>
            <option>Fees</option>
            <option>Admissions</option>
            <option>Class schedule</option>
            <option>Other</option>
          </select>
        </label>
        <label>
          Subject
          <input name="subject" required />
        </label>
        <label className="form-wide">
          Your question
          <textarea name="message" required />
        </label>
        <button className="button primary admin-action">Send query</button>
      </form>
      <div className="query-list">
        {queries.map((query) => (
          <article key={query._id}>
            <div>
              <span className={`status-${query.status}`}>{query.status}</span>
              <h3>{query.subject}</h3>
              <small>{query.category}</small>
            </div>
            {query.messages.map((item, index) => (
              <p className={item.authorRole} key={index}>
                <b>{item.authorRole === "admin" ? "Institute team" : "You"}</b>
                {item.body}
              </p>
            ))}
          </article>
        ))}
        {!queries.length && (
          <div className="blank-state">
            <b>◌</b>
            <p>You have not submitted a query yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
