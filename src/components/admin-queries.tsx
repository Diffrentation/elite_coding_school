"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  MessageSquare,
  Search,
  Filter,
  Send,
  User,
  ShieldAlert,
  CheckCircle2,
  Clock,
  X,
  Inbox,
  Sparkles,
  Table as TableIcon,
  LayoutGrid,
  Eye,
  CornerDownRight,
} from "lucide-react";
import { CustomSelect, type CustomSelectOption } from "./ui/custom-select";
import { AgTable, type AgColumn } from "./ui/ag-table";

type QueryStatus = "new" | "answered" | "closed";

type StudentQuery = {
  _id: string;
  category: string;
  subject: string;
  status: QueryStatus;
  messages: { authorRole: "student" | "admin"; body: string; createdAt: string }[];
  userId?: { email?: string; pendingName?: string } | null;
  createdAt?: string;
};

const QUERY_STATUS_REPLY_OPTIONS: CustomSelectOption[] = [
  { value: "answered", label: "Reply & mark Answered" },
  { value: "closed", label: "Reply & Close inquiry" },
  { value: "new", label: "Keep status as New" },
];

const CATEGORY_FILTER_OPTIONS: CustomSelectOption[] = [
  { value: "all", label: "All Categories" },
  { value: "Fees", label: "Fees & Payment" },
  { value: "Admissions", label: "Admissions & Batches" },
  { value: "Course Syllabus", label: "Course Syllabus" },
  { value: "Lab Timings", label: "Lab Timings & Schedule" },
  { value: "General", label: "General Questions" },
];

const QUERY_STATUS_FILTER_OPTIONS: CustomSelectOption[] = [
  { value: "all", label: "All Statuses" },
  { value: "new", label: "New (Needs Reply)" },
  { value: "answered", label: "Answered" },
  { value: "closed", label: "Resolved / Closed" },
];

export function AdminQueries() {
  const [queries, setQueries] = useState<StudentQuery[]>([]);
  const [status, setStatus] = useState<"all" | QueryStatus>("all");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [activeQueryModal, setActiveQueryModal] = useState<StudentQuery | null>(null);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [sendingId, setSendingId] = useState("");
  const [replyStatuses, setReplyStatuses] = useState<Record<string, QueryStatus>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = status === "all" ? "/api/admin/queries" : `/api/admin/queries?status=${status}`;
    fetch(url)
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error?.message ?? "Could not load queries.");
        setQueries(body.data.queries ?? []);
      })
      .catch((reason: Error) => setError(reason.message))
      .finally(() => setLoading(false));
  }, [status]);

  async function reply(event: FormEvent<HTMLFormElement>, queryId: string) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const message = String(form.get("message") ?? "").trim();
    const nextStatus = (replyStatuses[queryId] ?? "answered") as QueryStatus;

    if (!message) return;

    setError("");
    setSuccessMsg("");
    setSendingId(queryId);

    try {
      const response = await fetch(`/api/admin/queries/${queryId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, status: nextStatus }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error?.message ?? "Could not save the reply.");

      const updatedQuery = body.data.query as StudentQuery;
      setQueries((current) =>
        current.map((q) => (q._id === queryId ? updatedQuery : q)),
      );
      if (activeQueryModal && activeQueryModal._id === queryId) {
        setActiveQueryModal(updatedQuery);
      }
      setSuccessMsg("✓ Reply sent successfully.");
      setTimeout(() => setSuccessMsg(""), 3500);
      event.currentTarget.reset();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not save the reply.");
    } finally {
      setSendingId("");
    }
  }

  const counts = {
    all: queries.length,
    new: queries.filter((q) => q.status === "new").length,
    answered: queries.filter((q) => q.status === "answered").length,
    closed: queries.filter((q) => q.status === "closed").length,
  };

  const filteredQueries = queries.filter((q) => {
    const matchesCategory = categoryFilter === "all" || q.category === categoryFilter;
    const s = search.toLowerCase();
    const matchesSearch =
      !s ||
      q.subject.toLowerCase().includes(s) ||
      (q.userId?.pendingName ?? "").toLowerCase().includes(s) ||
      (q.userId?.email ?? "").toLowerCase().includes(s) ||
      q.category.toLowerCase().includes(s) ||
      q.messages.some((m) => m.body.toLowerCase().includes(s));
    return matchesCategory && matchesSearch;
  });

  const queryColumns: AgColumn<StudentQuery>[] = [
    {
      key: "student",
      header: "Student Profile",
      sortable: true,
      accessor: (q) => q.userId?.pendingName ?? "Student",
      render: (q) => {
        const initials = (q.userId?.pendingName ?? "Student")
          .split(" ")
          .map((p) => p[0])
          .join("")
          .slice(0, 2)
          .toUpperCase();
        return (
          <div className="student-profile-cell">
            <span className="profile-avatar">{initials}</span>
            <div className="profile-text">
              <strong className="profile-name">{q.userId?.pendingName ?? "Student"}</strong>
              <small className="profile-email">{q.userId?.email ?? "No student email"}</small>
            </div>
          </div>
        );
      },
    },
    {
      key: "category",
      header: "Category",
      sortable: true,
      render: (q) => (
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            textTransform: "uppercase",
            padding: "2px 8px",
            borderRadius: 4,
            background: "rgba(168, 85, 247, 0.12)",
            color: "#c084fc",
            border: "1px solid rgba(168, 85, 247, 0.25)",
            fontFamily: "var(--font-mono, monospace)",
          }}
        >
          {q.category}
        </span>
      ),
    },
    {
      key: "subject",
      header: "Subject & Last Message",
      sortable: true,
      render: (q) => {
        const lastMsg = q.messages[q.messages.length - 1];
        return (
          <div style={{ maxWidth: 360 }}>
            <b style={{ color: "#ffffff", fontSize: 13.5, display: "block" }}>{q.subject}</b>
            <p
              style={{
                margin: "2px 0 0",
                color: "#94a3b8",
                fontSize: 12,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
              title={lastMsg?.body ?? ""}
            >
              <CornerDownRight size={11} style={{ display: "inline", marginRight: 4, opacity: 0.7 }} />
              {lastMsg?.body ?? "No messages"}
            </p>
          </div>
        );
      },
    },
    {
      key: "updatedAt",
      header: "Last Activity",
      sortable: true,
      accessor: (q) => q.messages[q.messages.length - 1]?.createdAt ?? q.createdAt ?? "",
      render: (q) => {
        const lastTime = q.messages[q.messages.length - 1]?.createdAt ?? q.createdAt;
        return (
          <time className="date-cell">
            {lastTime
              ? new Intl.DateTimeFormat("en-IN", {
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                }).format(new Date(lastTime))
              : "—"}
          </time>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (q) => (
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            textTransform: "uppercase",
            padding: "3px 8px",
            borderRadius: 5,
            background:
              q.status === "answered"
                ? "rgba(16, 185, 129, 0.15)"
                : q.status === "closed"
                  ? "rgba(148, 163, 184, 0.15)"
                  : "rgba(245, 158, 11, 0.15)",
            color:
              q.status === "answered"
                ? "#34d399"
                : q.status === "closed"
                  ? "#94a3b8"
                  : "#fbbf24",
            border: `1px solid ${
              q.status === "answered"
                ? "rgba(16, 185, 129, 0.3)"
                : q.status === "closed"
                  ? "rgba(148, 163, 184, 0.3)"
                  : "rgba(245, 158, 11, 0.3)"
            }`,
          }}
        >
          {q.status}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      sortable: false,
      render: (q) => (
        <button
          type="button"
          onClick={() => setActiveQueryModal(q)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            padding: "6px 12px",
            borderRadius: 8,
            background: "rgba(124, 58, 237, 0.18)",
            border: "1px solid rgba(168, 85, 247, 0.35)",
            color: "#c084fc",
            fontSize: 12.5,
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
        >
          <MessageSquare size={13} />
          <span>Reply / View</span>
        </button>
      ),
    },
  ];

  return (
    <main className="portal-content admin-queries">
      {/* Intro Header */}
      <div className="portal-intro" style={{ marginBottom: 20 }}>
        <div>
          <p className="kicker" style={{ color: "#38bdf8", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", fontSize: 11, margin: "0 0 6px" }}>
            STUDENT SUPPORT &amp; HELPDESK
          </p>
          <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "28px", color: "#ffffff", margin: "0 0 8px" }}>
            Student Query Queue
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "14px", margin: 0 }}>
            Respond directly to inquiries from registered students, give mentor guidance, and resolve support tickets.
          </p>
        </div>

        {/* View Mode Switcher */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#06091e", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: 10, padding: 3 }}>
          <button
            type="button"
            onClick={() => setViewMode("table")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 12px",
              borderRadius: 7,
              fontSize: 12.5,
              fontWeight: 600,
              background: viewMode === "table" ? "linear-gradient(135deg, #7c3aed, #9333ea)" : "transparent",
              color: viewMode === "table" ? "#ffffff" : "#94a3b8",
              border: 0,
              cursor: "pointer",
            }}
          >
            <TableIcon size={14} />
            <span>Table View</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("cards")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 12px",
              borderRadius: 7,
              fontSize: 12.5,
              fontWeight: 600,
              background: viewMode === "cards" ? "linear-gradient(135deg, #7c3aed, #9333ea)" : "transparent",
              color: viewMode === "cards" ? "#ffffff" : "#94a3b8",
              border: 0,
              cursor: "pointer",
            }}
          >
            <LayoutGrid size={14} />
            <span>Thread Cards</span>
          </button>
        </div>
      </div>

      {error && <p className="form-error">{error}</p>}
      {successMsg && <p className="form-success">{successMsg}</p>}

      {/* Status Filter Tabs with High Contrast Dark Glass Styling */}
      <div className="filter-row" aria-label="Query status filter" style={{ marginBottom: 20 }}>
        {(["all", "new", "answered", "closed"] as const).map((item) => (
          <button
            className={status === item ? "selected" : ""}
            key={item}
            onClick={() => {
              setError("");
              setStatus(item);
            }}
          >
            <span>{item.toUpperCase()}</span>
            <span
              style={{
                marginLeft: 6,
                fontSize: 11,
                padding: "2px 7px",
                borderRadius: 99,
                background: status === item ? "rgba(255, 255, 255, 0.28)" : "rgba(255, 255, 255, 0.08)",
                color: "#ffffff",
                fontWeight: 700,
              }}
            >
              {counts[item]}
            </span>
          </button>
        ))}
      </div>

      {/* VIEW 1: AG-GRID TABLE VIEW */}
      {viewMode === "table" ? (
        <AgTable<StudentQuery>
          loading={loading}
          breadcrumbs={["Admin", "Support", "Student Queries"]}
          statusTabs={[
            { key: "all", label: "All", count: queries.length },
            { key: "new", label: "New", count: queries.filter((q) => q.status === "new").length },
            { key: "answered", label: "Answered", count: queries.filter((q) => q.status === "answered").length },
            { key: "closed", label: "Resolved", count: queries.filter((q) => q.status === "closed").length },
          ]}
          activeStatusTab={status}
          onStatusTabChange={(tabKey) => setStatus(tabKey as any)}
          columns={queryColumns}
          data={filteredQueries}
          title="Inquiry Tickets"
          subtitle="All tickets sorted by submission and latest response activity"
          searchPlaceholder="Search by student, email, subject, or message keyword..."
          searchAccessor={(q) => `${q.userId?.pendingName ?? ""} ${q.userId?.email ?? ""} ${q.subject} ${q.category} ${q.messages.map((m) => m.body).join(" ")}`}
          filterOptions={CATEGORY_FILTER_OPTIONS}
          filterValue={categoryFilter}
          onFilterChange={(val) => setCategoryFilter(val)}
          filterPlaceholder="Any category"
          initialPageSize={10}
          emptyMessage="No student queries found."
          getRowId={(q) => q._id}
          onRowClick={(q) => setActiveQueryModal(q)}
          exportFilename="student-queries-tickets"
        />
      ) : (
        /* VIEW 2: THREAD CARDS VIEW */
        <section className="admin-query-list">
          {/* Quick Search & Filter bar for card view */}
          <div className="student-tools-bar" style={{ marginBottom: 20 }}>
            <div className="search-input-wrap">
              <Search size={16} className="search-icon" />
              <input
                placeholder="Search queries by student name, email, subject, or message keyword..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button type="button" className="clear-btn" onClick={() => setSearch("")}>
                  <X size={15} />
                </button>
              )}
            </div>

            <div className="filter-select-wrap">
              <CustomSelect
                options={CATEGORY_FILTER_OPTIONS}
                value={categoryFilter}
                onChange={(val) => setCategoryFilter(val)}
                icon={<Filter size={15} />}
              />
            </div>
          </div>

          {filteredQueries.map((query) => {
            const studentInitials = (query.userId?.pendingName ?? "Student")
              .split(" ")
              .map((p) => p[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();

            const activeReplyStatus = replyStatuses[query._id] ?? "answered";

            return (
              <article key={query._id} className={`query-card status-${query.status}`} style={{ marginBottom: 20 }}>
                <header className="query-card-header">
                  <div className="query-student-info">
                    <span className="profile-avatar">{studentInitials}</span>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                        <strong className="profile-name">
                          {query.userId?.pendingName ?? "Student"}
                        </strong>
                        <span className="item-badge">{query.category}</span>
                        <em className={`status-${query.status}`}>{query.status}</em>
                      </div>
                      <small className="profile-email">
                        {query.userId?.email ?? "No student email"}
                      </small>
                    </div>
                  </div>

                  <div className="query-meta-right">
                    <h3 className="query-subject">{query.subject}</h3>
                  </div>
                </header>

                {/* Message Thread */}
                <div className="query-thread">
                  {query.messages.map((message, index) => {
                    const isAdmin = message.authorRole === "admin";
                    return (
                      <div
                        key={`${message.createdAt}-${index}`}
                        className={`query-bubble ${isAdmin ? "admin-bubble" : "student-bubble"}`}
                      >
                        <div className="bubble-header">
                          <span className="bubble-role">
                            {isAdmin ? "INSTITUTE MENTOR / TEAM" : "STUDENT QUESTION"}
                          </span>
                          {message.createdAt && (
                            <span className="bubble-time">
                              {new Intl.DateTimeFormat("en-IN", {
                                day: "2-digit",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              }).format(new Date(message.createdAt))}
                            </span>
                          )}
                        </div>
                        <p className="bubble-text">{message.body}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Reply Form */}
                {query.status !== "closed" ? (
                  <form
                    className="query-reply-form"
                    onSubmit={(event) => reply(event, query._id)}
                  >
                    <textarea
                      name="message"
                      minLength={1}
                      required
                      placeholder="Write a clear, helpful response to the student..."
                    />

                    <div className="query-reply-footer">
                      <div style={{ minWidth: 220 }}>
                        <CustomSelect
                          size="md"
                          variant="status-pill"
                          options={QUERY_STATUS_REPLY_OPTIONS}
                          value={activeReplyStatus}
                          onChange={(val) =>
                            setReplyStatuses((prev) => ({ ...prev, [query._id]: val as QueryStatus }))
                          }
                        />
                      </div>

                      <button
                        className="button primary query-send-btn"
                        type="submit"
                        disabled={sendingId === query._id}
                      >
                        <Send size={15} />
                        <span>{sendingId === query._id ? "Sending..." : "Send Reply"}</span>
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="query-resolved-banner">
                    <CheckCircle2 size={16} color="#34d399" />
                    <span>This inquiry is resolved and closed.</span>
                  </div>
                )}
              </article>
            );
          })}

          {!filteredQueries.length && (
            <div className="dashboard-empty-card" style={{ padding: "48px 24px" }}>
              <Inbox size={42} style={{ color: "#7c3aed", opacity: 0.8 }} />
              <p style={{ marginTop: 12, fontSize: 14, color: "#cbd5e1", fontWeight: 600 }}>
                No queries found
              </p>
              <small style={{ color: "#717894" }}>
                {search || categoryFilter !== "all"
                  ? "Try clearing your search or category filter."
                  : `There are currently no ${status === "all" ? "" : status} queries in the queue.`}
              </small>
            </div>
          )}
        </section>
      )}

      {/* QUICK REPLY / THREAD MODAL */}
      {activeQueryModal && (
        <div className="modal-backdrop" onClick={() => setActiveQueryModal(null)}>
          <div
            className="student-dossier-modal"
            style={{ maxWidth: 680, width: "100%", maxHeight: "90vh", display: "flex", flexDirection: "column" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="modal-header">
              <div className="modal-title-row">
                <MessageSquare size={20} className="text-purple-400" />
                <div>
                  <h3 style={{ margin: 0, fontSize: 17, color: "#ffffff" }}>
                    {activeQueryModal.subject}
                  </h3>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                    <span style={{ fontSize: 12, color: "#94a3b8" }}>
                      From {activeQueryModal.userId?.pendingName ?? "Student"}
                    </span>
                    <span className="item-badge">{activeQueryModal.category}</span>
                    <em className={`status-${activeQueryModal.status}`}>{activeQueryModal.status}</em>
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="close-modal-btn"
                onClick={() => setActiveQueryModal(null)}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body / Scrollable Conversation Thread */}
            <div className="modal-body" style={{ overflowY: "auto", flex: 1, padding: "20px 24px" }}>
              <div className="query-thread" style={{ margin: 0 }}>
                {activeQueryModal.messages.map((message, index) => {
                  const isAdmin = message.authorRole === "admin";
                  return (
                    <div
                      key={`${message.createdAt}-${index}`}
                      className={`query-bubble ${isAdmin ? "admin-bubble" : "student-bubble"}`}
                    >
                      <div className="bubble-header">
                        <span className="bubble-role">
                          {isAdmin ? "INSTITUTE MENTOR / TEAM" : "STUDENT QUESTION"}
                        </span>
                        {message.createdAt && (
                          <span className="bubble-time">
                            {new Intl.DateTimeFormat("en-IN", {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            }).format(new Date(message.createdAt))}
                          </span>
                        )}
                      </div>
                      <p className="bubble-text">{message.body}</p>
                    </div>
                  );
                })}
              </div>

              {/* Reply Form inside Modal */}
              {activeQueryModal.status !== "closed" ? (
                <form
                  className="query-reply-form"
                  style={{ marginTop: 20 }}
                  onSubmit={(event) => reply(event, activeQueryModal._id)}
                >
                  <textarea
                    name="message"
                    minLength={1}
                    required
                    placeholder="Write a clear, helpful response to the student..."
                    style={{ minHeight: 90 }}
                  />

                  <div className="query-reply-footer" style={{ marginTop: 12 }}>
                    <div style={{ minWidth: 220 }}>
                      <CustomSelect
                        size="md"
                        variant="status-pill"
                        options={QUERY_STATUS_REPLY_OPTIONS}
                        value={replyStatuses[activeQueryModal._id] ?? "answered"}
                        onChange={(val) =>
                          setReplyStatuses((prev) => ({
                            ...prev,
                            [activeQueryModal._id]: val as QueryStatus,
                          }))
                        }
                      />
                    </div>

                    <button
                      className="button primary query-send-btn"
                      type="submit"
                      disabled={sendingId === activeQueryModal._id}
                    >
                      <Send size={15} />
                      <span>{sendingId === activeQueryModal._id ? "Sending..." : "Send Reply"}</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="query-resolved-banner" style={{ marginTop: 20 }}>
                  <CheckCircle2 size={16} color="#34d399" />
                  <span>This inquiry is resolved and closed.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

