"use client";

import { FormEvent, useEffect, useState } from "react";

type Course = {
  _id: string;
  title: string;
  icon: string;
  slug: string;
  shortDescription: string;
  description: string;
  category: string;
  level: "beginner" | "intermediate" | "advanced";
  monthlyFee: number;
  durationMonths: number;
  prerequisites: string[];
  skills: string[];
  syllabus: { id: string; title: string; order: number; topics: string[] }[];
  thumbnailUrl: string | null;
  heroImageUrl: string | null;
  isFeatured: boolean;
  order: number;
  version: number;
  status: "draft" | "published" | "archived";
};

type FieldErrors = Record<string, string[]>;

class ApiError extends Error {
  constructor(
    message: string,
    readonly fields: FieldErrors = {},
  ) {
    super(message);
  }
}

const api = async (url: string, init?: RequestInit) => {
  const response = await fetch(url, init);
  const body = await response.json();
  if (!response.ok || !body.success) {
    throw new ApiError(body.error?.message ?? "Request failed.", body.error?.details?.fields ?? {});
  }
  return body.data;
};

export function AdminCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");
  const [editing, setEditing] = useState<Course | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [hasFormError, setHasFormError] = useState(false);

  const inputClass = (name: string) => (fieldErrors[name]?.length ? "input-invalid" : undefined);
  const fieldError = (name: string) =>
    fieldErrors[name]?.[0] ? <small className="field-error">{fieldErrors[name][0]}</small> : null;

  const load = () =>
    api("/api/admin/courses")
      .then((data) => setCourses(data.courses))
      .catch((error) => setMessage(error.message));
  useEffect(() => {
    void load();
  }, []);

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setMessage("");
    setFieldErrors({});
    setHasFormError(false);
    try {
      const payload = {
        title: form.get("title"),
        icon: form.get("icon"),
        slug: form.get("slug"),
        category: form.get("category"),
        shortDescription: form.get("shortDescription"),
        description: form.get("description"),
        level: form.get("level"),
        durationMonths: Number(form.get("durationMonths")),
        monthlyFee: Number(form.get("monthlyFee")),
        prerequisites: splitList(form.get("prerequisites")),
        skills: splitList(form.get("skills")),
        syllabus: parseSyllabus(form.get("syllabus")),
        thumbnailUrl: String(form.get("thumbnailUrl") ?? "") || null,
        heroImageUrl: String(form.get("heroImageUrl") ?? "") || null,
        isFeatured: form.get("isFeatured") === "on",
        order: Number(form.get("order")),
      };
      await api(editing ? `/api/admin/courses/${editing._id}` : "/api/admin/courses", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing ? { ...payload, version: editing.version } : payload),
      });
      setShowForm(false);
      setEditing(null);
      setMessage(editing ? "Course updated." : "Course draft created.");
      load();
    } catch (error) {
      if (error instanceof ApiError) setFieldErrors(error.fields);
      setHasFormError(true);
      setMessage(error instanceof Error ? error.message : "Unable to create course.");
    }
  };

  const openCreate = () => {
    setEditing(null);
    setFieldErrors({});
    setHasFormError(false);
    setShowForm((open) => !open);
  };

  const openEdit = (course: Course) => {
    setMessage("");
    setFieldErrors({});
    setHasFormError(false);
    setEditing(course);
    setShowForm(true);
  };

  const changeStatus = async (id: string, action: "publish" | "archive") => {
    try {
      await api(`/api/admin/courses/${id}/${action}`, { method: "POST" });
      setMessage(`Course ${action === "publish" ? "published" : "archived"}.`);
      load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to update course.");
    }
  };

  return (
    <div className="admin-courses">
      <div className="portal-intro">
        <div>
          <p className="kicker">COURSE MANAGEMENT</p>
          <h2>Programs your institute controls.</h2>
          <p>Create drafts, review details, and publish only when a program is ready for public discovery.</p>
        </div>
        <button className="button primary admin-action" onClick={openCreate}>
          {showForm && !editing ? "Close form" : "Add course"}
        </button>
      </div>

      {message && <p className={hasFormError ? "form-error" : "form-success"}>{message}</p>}

      {showForm && (
        <form className="course-form" key={editing?._id ?? "new"} noValidate onSubmit={save}>
          <label className={fieldErrors.title?.length ? "has-field-error" : undefined}>
            Course title
            <input className={inputClass("title")} name="title" defaultValue={editing?.title} required />
            {fieldError("title")}
          </label>
          <label>
            Course icon
            <select name="icon" defaultValue={editing?.icon ?? "Code2"}>
              <option value="Code2">Code</option>
              <option value="Braces">Frontend</option>
              <option value="Server">Backend</option>
              <option value="Database">Database</option>
              <option value="BrainCircuit">DSA</option>
              <option value="BarChart3">System design</option>
              <option value="TerminalSquare">Programming</option>
            </select>
          </label>
          <label className={fieldErrors.slug?.length ? "has-field-error" : undefined}>
            Slug
            <input
              className={inputClass("slug")}
              name="slug"
              required
              pattern="[a-z0-9]+(-[a-z0-9]+)*"
              defaultValue={editing?.slug}
              placeholder="full-stack-development"
            />
            {fieldError("slug")}
          </label>
          <label className={fieldErrors.category?.length ? "has-field-error" : undefined}>
            Category
            <input
              className={inputClass("category")}
              name="category"
              defaultValue={editing?.category}
              required
              placeholder="Web development"
            />
            {fieldError("category")}
          </label>
          <label className={fieldErrors.level?.length ? "has-field-error" : undefined}>
            Level
            <select className={inputClass("level")} name="level" defaultValue={editing?.level ?? "beginner"}>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
            {fieldError("level")}
          </label>
          <label className={fieldErrors.durationMonths?.length ? "has-field-error" : undefined}>
            Duration (months)
            <input
              className={inputClass("durationMonths")}
              name="durationMonths"
              type="number"
              min="1"
              defaultValue={editing?.durationMonths}
              required
            />
            {fieldError("durationMonths")}
          </label>
          <label>
            Monthly fee (₹)
            <input
              className={inputClass("monthlyFee")}
              name="monthlyFee"
              type="number"
              min="0"
              max="1999"
              defaultValue={editing?.monthlyFee}
              required
            />
            {fieldError("monthlyFee")}
          </label>
          <label className="form-wide">
            Short description
            <textarea
              className={inputClass("shortDescription")}
              name="shortDescription"
              defaultValue={editing?.shortDescription}
              minLength={10}
              required
            />
            {fieldError("shortDescription")}
          </label>
          <label className={`form-wide ${fieldErrors.description?.length ? "has-field-error" : ""}`}>
            Detailed description
            <textarea
              className={inputClass("description")}
              name="description"
              defaultValue={editing?.description}
              minLength={20}
              required
            />
            {fieldError("description")}
          </label>
          <label className={`form-wide ${fieldErrors.syllabus?.length ? "has-field-error" : ""}`}>
            Syllabus modules
            <textarea
              className={inputClass("syllabus")}
              name="syllabus"
              defaultValue={formatSyllabus(editing?.syllabus ?? [])}
              placeholder="HTML and CSS: Semantic markup, responsive layouts&#10;JavaScript: Variables, functions, asynchronous programming"
            />
            <small>One module per line: module title followed by comma-separated topics after a colon.</small>
            {fieldError("syllabus")}
          </label>
          <label>
            Skills (comma separated)
            <input className={inputClass("skills")} name="skills" defaultValue={editing?.skills.join(", ")} />
            {fieldError("skills")}
          </label>
          <label>
            Prerequisites (comma separated)
            <input
              className={inputClass("prerequisites")}
              name="prerequisites"
              defaultValue={editing?.prerequisites.join(", ")}
            />
            {fieldError("prerequisites")}
          </label>
          <label>
            Thumbnail image URL
            <input
              className={inputClass("thumbnailUrl")}
              name="thumbnailUrl"
              type="url"
              defaultValue={editing?.thumbnailUrl ?? ""}
            />
            {fieldError("thumbnailUrl")}
          </label>
          <label>
            Hero image URL
            <input
              className={inputClass("heroImageUrl")}
              name="heroImageUrl"
              type="url"
              defaultValue={editing?.heroImageUrl ?? ""}
            />
            {fieldError("heroImageUrl")}
          </label>
          <label>
            Display order
            <input
              className={inputClass("order")}
              name="order"
              type="number"
              min="0"
              defaultValue={editing?.order ?? 0}
              required
            />
            {fieldError("order")}
          </label>
          <label className="terms">
            <input name="isFeatured" type="checkbox" defaultChecked={editing?.isFeatured ?? false} />
            Feature on public catalogue
          </label>
          <button className="button primary admin-action" type="submit">
            {editing ? "Save changes" : "Save as draft"}
          </button>
        </form>
      )}

      <div className="course-table" role="region" aria-label="Courses">
        <div className="course-table-head">
          <span>Course</span>
          <span>Category</span>
          <span>Fee / duration</span>
          <span>Status</span>
          <span>Actions</span>
        </div>
        {courses.map((course) => (
          <div className="course-table-row" key={course._id}>
            <b>
              {course.title}
              <small>/{course.slug}</small>
            </b>
            <span>{course.category}</span>
            <span>
              ₹{course.monthlyFee.toLocaleString("en-IN")} · {course.durationMonths} mo
            </span>
            <em className={`status-${course.status}`}>{course.status}</em>
            <div>
              <button onClick={() => openEdit(course)}>Edit</button>
              {course.status !== "published" && (
                <button onClick={() => changeStatus(course._id, "publish")}>Publish</button>
              )}
              {course.status !== "archived" && (
                <button onClick={() => changeStatus(course._id, "archive")}>Archive</button>
              )}
            </div>
          </div>
        ))}
        {!courses.length && (
          <div className="blank-state">
            <b>◇</b>
            <p>Create your first course draft to begin.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function splitList(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatSyllabus(syllabus: Course["syllabus"]) {
  return syllabus.map((module) => `${module.title}: ${module.topics.join(", ")}`).join("\n");
}

function parseSyllabus(value: FormDataEntryValue | null): Course["syllabus"] {
  return String(value ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, order) => {
      const [rawTitle, ...rawTopics] = line.split(":");
      const title = rawTitle.trim();
      const topics = rawTopics
        .join(":")
        .split(",")
        .map((topic) => topic.trim())
        .filter(Boolean);
      return {
        id: `module-${order + 1}-${title.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-")}`,
        title,
        order,
        topics,
      };
    });
}
