"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  Plus,
  X,
  Edit3,
  Globe,
  Archive,
  BookOpen,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  Tag,
  Check,
  Search,
  Filter,
} from "lucide-react";
import { ImagePickerInput } from "@/components/image-picker-input";
import { CustomSelect, type CustomSelectOption } from "./ui/custom-select";
import { AgTable, type AgColumn } from "./ui/ag-table";

const COURSE_STATUS_FILTER_OPTIONS: CustomSelectOption[] = [
  { value: "all", label: "All Program Statuses" },
  { value: "published", label: "Published Programs" },
  { value: "draft", label: "Draft Programs" },
  { value: "archived", label: "Archived Programs" },
];

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
  track?: "web" | "dsa" | "systems" | "core";
  trackLabel?: string;
  labHours?: string;
  perks?: string[];
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
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [editing, setEditing] = useState<Course | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [searchFilter, setSearchFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const inputClass = (name: string) => (fieldErrors[name]?.length ? "input-invalid" : undefined);
  const fieldError = (name: string) =>
    fieldErrors[name]?.[0] ? <small className="field-error">{fieldErrors[name][0]}</small> : null;

  const load = () =>
    api("/api/admin/courses")
      .then((data) => setCourses(data.courses))
      .catch((error) => setToast({ type: "error", text: error.message }));

  useEffect(() => {
    void load();
  }, []);

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setToast(null);
    setFieldErrors({});

    try {
      const payload = {
        title: form.get("title"),
        icon: form.get("icon"),
        slug: form.get("slug"),
        category: form.get("category"),
        track: form.get("track") || "web",
        trackLabel: form.get("trackLabel") || "",
        labHours: form.get("labHours") || "90+ Class Hours",
        perks: splitLines(form.get("perks")),
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
      setToast({
        type: "success",
        text: editing ? "Course updated successfully." : "Course draft created successfully.",
      });
      load();
    } catch (error) {
      if (error instanceof ApiError) setFieldErrors(error.fields);
      setToast({
        type: "error",
        text: error instanceof Error ? error.message : "Unable to save course.",
      });
    }
  };

  const openCreate = () => {
    setEditing(null);
    setFieldErrors({});
    setToast(null);
    setShowForm((open) => !open);
  };

  const openEdit = (course: Course) => {
    setToast(null);
    setFieldErrors({});
    setEditing(course);
    setShowForm(true);
  };

  const changeStatus = async (id: string, action: "publish" | "archive") => {
    try {
      await api(`/api/admin/courses/${id}/${action}`, { method: "POST" });
      setToast({
        type: "success",
        text: `Course ${action === "publish" ? "published" : "archived"} successfully.`,
      });
      load();
    } catch (error) {
      setToast({
        type: "error",
        text: error instanceof Error ? error.message : "Unable to update course.",
      });
    }
  };

  const courseColumns: AgColumn<Course>[] = [
    {
      key: "title",
      header: "Course Program",
      sortable: true,
      render: (course) => (
        <div>
          <b style={{ color: "#ffffff", fontSize: 14, display: "block" }}>{course.title}</b>
          <small style={{ fontFamily: "var(--font-mono)", color: "#a855f7" }}>/{course.slug}</small>
        </div>
      ),
    },
    {
      key: "category",
      header: "Track & Category",
      sortable: true,
      render: (course) => (
        <div>
          <span
            style={{
              display: "inline-block",
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              padding: "2px 7px",
              borderRadius: 4,
              background: "rgba(56, 189, 248, 0.12)",
              color: "#38bdf8",
              marginRight: 6,
            }}
          >
            {course.track?.toUpperCase() || "WEB"}
          </span>
          <span style={{ color: "#cbd5e1", fontSize: 12.5 }}>{course.category}</span>
        </div>
      ),
    },
    {
      key: "monthlyFee",
      header: "Fee / Duration",
      sortable: true,
      render: (course) => (
        <div>
          <b style={{ color: "#34d399", fontFamily: "var(--font-mono)", fontSize: 13.5, display: "block" }}>
            ₹{course.monthlyFee.toLocaleString("en-IN")}/mo
          </b>
          <small style={{ color: "#94a3b8" }}>
            {course.durationMonths} mo &bull; {course.labHours || "90+ hrs"}
          </small>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (course) => (
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            textTransform: "uppercase",
            padding: "3px 8px",
            borderRadius: 5,
            background:
              course.status === "published"
                ? "rgba(16, 185, 129, 0.15)"
                : course.status === "archived"
                  ? "rgba(239, 68, 68, 0.15)"
                  : "rgba(245, 158, 11, 0.15)",
            color:
              course.status === "published"
                ? "#34d399"
                : course.status === "archived"
                  ? "#f87171"
                  : "#fbbf24",
            border: `1px solid ${
              course.status === "published"
                ? "rgba(16, 185, 129, 0.3)"
                : course.status === "archived"
                  ? "rgba(239, 68, 68, 0.3)"
                  : "rgba(245, 158, 11, 0.3)"
            }`,
          }}
        >
          {course.status}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      sortable: false,
      render: (course) => (
        <div style={{ display: "flex", gap: 6 }}>
          <button
            onClick={() => openEdit(course)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              padding: "5px 10px",
              borderRadius: 6,
              background: "rgba(255, 255, 255, 0.06)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              color: "#cbd5e1",
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            <Edit3 size={12} /> Edit
          </button>
          {course.status !== "published" && (
            <button
              onClick={() => changeStatus(course._id, "publish")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                padding: "5px 10px",
                borderRadius: 6,
                background: "rgba(16, 185, 129, 0.15)",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                color: "#34d399",
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              <Globe size={12} /> Publish
            </button>
          )}
          {course.status !== "archived" && (
            <button
              onClick={() => changeStatus(course._id, "archive")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                padding: "5px 10px",
                borderRadius: 6,
                background: "rgba(239, 68, 68, 0.12)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                color: "#f87171",
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              <Archive size={12} /> Archive
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <main className="portal-content admin-courses-page" style={{ maxWidth: 1300, margin: "0 auto", padding: "28px" }}>
      <div className="portal-intro" style={{ marginBottom: 28 }}>
        <div>
          <p className="kicker" style={{ color: "#38bdf8", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", fontSize: 11, margin: "0 0 6px" }}>
            CURRICULUM MANAGEMENT
          </p>
          <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "28px", color: "#ffffff", margin: "0 0 8px" }}>
            Course Programs
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "14px", margin: 0 }}>
            Create drafts, configure frontend card details, manage syllabus topics, and upload images.
          </p>
        </div>
        <button
          className="button primary admin-action-btn"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            padding: "10px 18px",
            borderRadius: 10,
            background: "linear-gradient(135deg, #7c3aed, #9333ea)",
            color: "#ffffff",
            fontWeight: 700,
            fontSize: 13,
            cursor: "pointer",
            border: "1px solid rgba(255, 255, 255, 0.2)",
          }}
          onClick={openCreate}
        >
          {showForm && !editing ? <X size={16} /> : <Plus size={16} />}
          <span>{showForm && !editing ? "Close Form" : "Add Course"}</span>
        </button>
      </div>

      {toast && (
        <div
          role="alert"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            padding: "13px 20px",
            borderRadius: 12,
            marginBottom: 24,
            fontSize: "13.5px",
            fontWeight: 600,
            background: toast.type === "success" ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
            border: `1px solid ${toast.type === "success" ? "rgba(16, 185, 129, 0.4)" : "rgba(239, 68, 68, 0.4)"}`,
            color: toast.type === "success" ? "#34d399" : "#fca5a5",
            boxShadow:
              toast.type === "success"
                ? "0 4px 18px rgba(16, 185, 129, 0.2)"
                : "0 4px 18px rgba(239, 68, 68, 0.2)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {toast.type === "success" ? (
              <CheckCircle2 size={18} color="#34d399" style={{ flexShrink: 0 }} />
            ) : (
              <AlertCircle size={18} color="#f87171" style={{ flexShrink: 0 }} />
            )}
            <span>{toast.text}</span>
          </div>

          <button
            type="button"
            onClick={() => setToast(null)}
            style={{
              background: "transparent",
              border: 0,
              color: toast.type === "success" ? "#34d399" : "#fca5a5",
              cursor: "pointer",
              padding: 4,
              display: "grid",
              placeItems: "center",
              opacity: 0.8,
            }}
            title="Dismiss notification"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {showForm && (
        <form
          className="course-form"
          key={editing?._id ?? "new"}
          noValidate
          onSubmit={save}
          style={{
            background: "#0a0f32",
            border: "1px solid rgba(133, 41, 244, 0.35)",
            borderRadius: 18,
            padding: "26px 30px 36px",
            boxShadow: "0 18px 45px rgba(0, 0, 0, 0.45)",
            marginBottom: 32,
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 18,
            maxWidth: "100%",
            boxSizing: "border-box",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              gridColumn: "1 / -1",
              borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
              paddingBottom: 16,
              marginBottom: 8,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 14,
            }}
          >
            <div>
              <h3 style={{ margin: 0, fontSize: 18, color: "#ffffff", fontFamily: "var(--font-heading)" }}>
                {editing ? `Editing: ${editing.title}` : "Create New Course Program"}
              </h3>
              <span style={{ fontSize: 12.5, color: "#94a3b8" }}>
                Configure all fields that appear on the homepage course card, catalog, and detailed syllabus page.
              </span>
            </div>

            {/* Quick Top Save Button */}
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={{
                  padding: "8px 16px",
                  borderRadius: 8,
                  background: "rgba(255, 255, 255, 0.06)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  color: "#cbd5e1",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                className="button primary admin-action"
                type="submit"
                style={{
                  padding: "9px 20px",
                  borderRadius: 9,
                  background: "linear-gradient(135deg, #7c3aed, #9333ea)",
                  color: "#ffffff",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  boxShadow: "0 6px 18px rgba(124, 58, 237, 0.4)",
                  fontSize: 13.5,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Check size={15} />
                {editing ? "Save Changes" : "Save Course"}
              </button>
            </div>
          </div>

          {/* 1. Title */}
          <label className={fieldErrors.title?.length ? "has-field-error" : undefined}>
            Course Title
            <input
              className={inputClass("title")}
              name="title"
              defaultValue={editing?.title}
              required
              placeholder="e.g. MERN Stack & Next.js Web Development"
            />
            {fieldError("title")}
          </label>

          {/* 2. Slug */}
          <label className={fieldErrors.slug?.length ? "has-field-error" : undefined}>
            URL Slug
            <input
              className={inputClass("slug")}
              name="slug"
              required
              pattern="[a-z0-9]+(-[a-z0-9]+)*"
              defaultValue={editing?.slug}
              placeholder="e.g. mern-stack-nextjs"
            />
            {fieldError("slug")}
          </label>

          {/* 3. Track Category (Filter Pill on Homepage) */}
          <label>
            Frontend Track Category
            <select name="track" defaultValue={editing?.track ?? "web"}>
              <option value="web">Full-Stack Web (MERN / Next.js)</option>
              <option value="dsa">DSA, Logic & System Design</option>
              <option value="systems">Computer Networks & Linux OS</option>
              <option value="core">Core Coding (C, C++, Java, Python)</option>
            </select>
          </label>

          {/* 4. Track Label Badge (Shown on top-left of Card) */}
          <label>
            Card Track Label Badge
            <input
              name="trackLabel"
              defaultValue={editing?.trackLabel ?? ""}
              placeholder="e.g. MERN Stack, DSA & Logic, Networking, OS & Linux"
            />
            <small style={{ color: "#64748b", fontSize: 11 }}>Badge text displayed on the top of the course card.</small>
          </label>

          {/* 5. Course Icon */}
          <label>
            Course Icon
            <select name="icon" defaultValue={editing?.icon ?? "Code2"}>
              <option value="Code2">Code &lt;/&gt;</option>
              <option value="Braces">Frontend / React</option>
              <option value="Server">Backend / Node.js</option>
              <option value="Database">Database / MongoDB</option>
              <option value="BrainCircuit">DSA / Algorithms</option>
              <option value="BarChart3">System Design</option>
              <option value="TerminalSquare">Linux / Terminal</option>
            </select>
          </label>

          {/* 6. Category */}
          <label className={fieldErrors.category?.length ? "has-field-error" : undefined}>
            Category Name
            <input
              className={inputClass("category")}
              name="category"
              defaultValue={editing?.category ?? "Web Development"}
              required
              placeholder="e.g. Web Development, Foundations"
            />
            {fieldError("category")}
          </label>

          {/* 7. Level */}
          <label className={fieldErrors.level?.length ? "has-field-error" : undefined}>
            Difficulty Level
            <select className={inputClass("level")} name="level" defaultValue={editing?.level ?? "beginner"}>
              <option value="beginner">Beginner (Zero Experience)</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
            {fieldError("level")}
          </label>

          {/* 8. Duration Months */}
          <label className={fieldErrors.durationMonths?.length ? "has-field-error" : undefined}>
            Duration (Months)
            <input
              className={inputClass("durationMonths")}
              name="durationMonths"
              type="number"
              min="1"
              max="60"
              defaultValue={editing?.durationMonths ?? 3}
              required
            />
            {fieldError("durationMonths")}
          </label>

          {/* 9. Lab Hours (Card Meta) */}
          <label>
            Lab / Class Hours
            <input
              name="labHours"
              defaultValue={editing?.labHours ?? "90+ Class Hours"}
              placeholder="e.g. 90+ Class Hours"
            />
            <small style={{ color: "#64748b", fontSize: 11 }}>Appears beside duration on card (e.g. 3 Months &bull; 90+ Class Hours)</small>
          </label>

          {/* 10. Monthly Fee */}
          <label>
            Monthly Fee (₹)
            <input
              className={inputClass("monthlyFee")}
              name="monthlyFee"
              type="number"
              min="0"
              max="1999"
              defaultValue={editing?.monthlyFee ?? 1900}
              required
              placeholder="e.g. 1900"
            />
            <small style={{ color: "#64748b", fontSize: 11 }}>Monthly fee cap: under ₹2,000.</small>
            {fieldError("monthlyFee")}
          </label>

          {/* 11. Short Description (Card Body) */}
          <label className="form-wide">
            Short Description (Displayed on Course Card)
            <textarea
              className={inputClass("shortDescription")}
              name="shortDescription"
              defaultValue={editing?.shortDescription}
              minLength={10}
              required
              placeholder="A brief 1-2 sentence overview shown directly on the homepage course card..."
              style={{ minHeight: 65 }}
            />
            {fieldError("shortDescription")}
          </label>

          {/* 12. In-Person Perks Checklist (Card Bullet Points!) */}
          <label className="form-wide">
            In-Person Perks / Highlights (The 3 Checkmark Bullet Points on Card)
            <textarea
              name="perks"
              defaultValue={editing?.perks?.join("\n") ?? ""}
              placeholder="Taught from absolute zero with whiteboard diagrams&#10;Hands-on coding on your laptop every class&#10;Teacher reviews your code line-by-line"
              style={{ minHeight: 80 }}
            />
            <small style={{ color: "#38bdf8", fontSize: 11 }}>
              Enter each perk on a new line. These appear as the green checkmarked items on the frontend course card!
            </small>
          </label>

          {/* 13. Detailed Description */}
          <label className={`form-wide ${fieldErrors.description?.length ? "has-field-error" : ""}`}>
            Detailed Course Description (For Course Detail Page)
            <textarea
              className={inputClass("description")}
              name="description"
              defaultValue={editing?.description}
              minLength={20}
              required
              placeholder="Comprehensive explanation of what students will learn, project outcomes, and lab expectations..."
              style={{ minHeight: 90 }}
            />
            {fieldError("description")}
          </label>

          {/* 14. Skills / Tech Tags */}
          <label>
            Skills / Tech Tags (Comma Separated)
            <input
              className={inputClass("skills")}
              name="skills"
              defaultValue={editing?.skills?.join(", ")}
              placeholder="React, Next.js, Tailwind, Node.js, MongoDB"
            />
            <small style={{ color: "#64748b", fontSize: 11 }}>Tags shown on the course detail syllabus page.</small>
            {fieldError("skills")}
          </label>

          {/* 15. Prerequisites */}
          <label>
            Prerequisites (Comma Separated)
            <input
              className={inputClass("prerequisites")}
              name="prerequisites"
              defaultValue={editing?.prerequisites?.join(", ")}
              placeholder="Basic laptop usage, curiosity to learn"
            />
            {fieldError("prerequisites")}
          </label>

          {/* 16. Image Picker: Course Thumbnail */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <ImagePickerInput
              label="Course Card Thumbnail Image"
              name="thumbnailUrl"
              defaultValue={editing?.thumbnailUrl}
              folder="courses"
              helperText="Choose from your laptop or paste web link (400x260 px recommended)"
            />
          </div>

          {/* 17. Image Picker: Hero Image */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <ImagePickerInput
              label="Course Detail Hero Banner"
              name="heroImageUrl"
              defaultValue={editing?.heroImageUrl}
              folder="courses"
              helperText="Choose from your laptop or paste web link (1200x500 px recommended)"
            />
          </div>

          {/* 18. Syllabus Modules */}
          <label className={`form-wide ${fieldErrors.syllabus?.length ? "has-field-error" : ""}`}>
            Syllabus Modules Breakdown
            <textarea
              className={inputClass("syllabus")}
              name="syllabus"
              defaultValue={formatSyllabus(editing?.syllabus ?? [])}
              placeholder="HTML and CSS: Semantic markup, flexbox, grid, responsive layouts&#10;JavaScript: ES6+, closures, async/await, fetch API&#10;React and Next.js: Components, hooks, SSR, routing"
              style={{ minHeight: 90 }}
            />
            <small style={{ color: "#94a3b8", fontSize: 11 }}>One module per line: module title followed by comma-separated topics after a colon.</small>
            {fieldError("syllabus")}
          </label>

          {/* 19. Order & Feature */}
          <label>
            Display Order
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

          <label className="terms" style={{ alignSelf: "center", paddingTop: 16 }}>
            <input name="isFeatured" type="checkbox" defaultChecked={editing?.isFeatured ?? true} />
            <span style={{ fontWeight: 600, color: "#ffffff" }}>Feature on public catalogue & homepage</span>
          </label>

          {/* Sticky Bottom Action Bar: Always visible on screen! */}
          <div
            style={{
              gridColumn: "1 / -1",
              position: "sticky",
              bottom: "16px",
              zIndex: 50,
              background: "#080d2c",
              border: "1px solid #a855f7",
              borderRadius: 14,
              padding: "14px 22px",
              boxShadow: "0 12px 35px rgba(0, 0, 0, 0.8), 0 0 25px rgba(133, 41, 244, 0.35)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 14,
              marginTop: 18,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 0 3px rgba(16, 185, 129, 0.35)" }} />
              <span style={{ fontSize: 13.5, color: "#ffffff", fontWeight: 700 }}>
                {editing ? `Editing "${editing.title}"` : "New Course Draft"}
              </span>
              <span style={{ fontSize: 12, color: "#94a3b8" }}>— Changes ready to save</span>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={{
                  padding: "10px 18px",
                  borderRadius: 8,
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(255, 255, 255, 0.14)",
                  color: "#cbd5e1",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                className="button primary admin-action"
                type="submit"
                style={{
                  padding: "10px 26px",
                  borderRadius: 8,
                  background: "linear-gradient(135deg, #7c3aed, #9333ea)",
                  color: "#ffffff",
                  border: "1px solid rgba(255, 255, 255, 0.25)",
                  boxShadow: "0 6px 20px rgba(124, 58, 237, 0.5)",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                }}
              >
                <Check size={16} />
                {editing ? "Save Changes" : "Create & Save Course"}
              </button>
            </div>
          </div>
        </form>
      )}

      <AgTable<Course>
        breadcrumbs={["Admin", "Curriculum", "Courses"]}
        statusTabs={[
          { key: "all", label: "All Programs", count: courses.length },
          { key: "published", label: "Published", count: courses.filter((c) => c.status === "published").length },
          { key: "draft", label: "Drafts", count: courses.filter((c) => c.status === "draft").length },
          { key: "archived", label: "Archived", count: courses.filter((c) => c.status === "archived").length },
        ]}
        activeStatusTab={statusFilter}
        onStatusTabChange={(tabKey) => setStatusFilter(tabKey)}
        columns={courseColumns}
        data={courses.filter((c) => statusFilter === "all" || c.status === statusFilter)}
        title="Curriculum Programs"
        subtitle="Manage course drafts, configure card details, syllabus topics, and published status"
        searchPlaceholder="Search programs by title, slug, track, or category..."
        searchAccessor={(c) => `${c.title} ${c.slug} ${c.category} ${c.track ?? ""}`}
        filterOptions={COURSE_STATUS_FILTER_OPTIONS}
        filterValue={statusFilter}
        onFilterChange={(val) => setStatusFilter(val)}
        filterPlaceholder="Any status"
        initialPageSize={10}
        emptyMessage="No course programs found."
        getRowId={(c) => c._id}
        onRefresh={load}
        exportFilename="curriculum-courses"
      />
    </main>
  );
}

function splitList(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function splitLines(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .split("\n")
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
