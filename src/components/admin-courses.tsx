"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import {
  Plus,
  ExternalLink,
  Eye,
  RefreshCw,
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
  ChevronRight,
  Code2,
  Cpu,
  Terminal,
  Network,
  Server,
  Database,
  Smartphone,
  Flame,
} from "lucide-react";
import { ImagePickerInput } from "@/components/image-picker-input";
import { CourseIconPicker } from "@/components/course-icon-picker";
import { getCourseIcon } from "@/lib/course-icons";
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

type CategoryItem = {
  _id?: string;
  name: string;
  slug?: string;
  icon?: string;
  description?: string;
  techTags?: string[];
  ctaLabel?: string;
  color?: string;
};

const PRESET_ICONS = [
  { name: "Sparkles", label: "Frontend / UI", Icon: Sparkles },
  { name: "Code2", label: "Full-Stack / Web", Icon: Code2 },
  { name: "Layers", label: "DSA / Logic", Icon: Layers },
  { name: "Cpu", label: "Core / Systems", Icon: Cpu },
  { name: "Server", label: "Backend / APIs", Icon: Server },
  { name: "Database", label: "Database / SQL", Icon: Database },
  { name: "Network", label: "Networking", Icon: Network },
  { name: "Terminal", label: "Linux / DevOps", Icon: Terminal },
  { name: "Globe", label: "Web / Cloud", Icon: Globe },
  { name: "Smartphone", label: "Mobile Apps", Icon: Smartphone },
  { name: "BookOpen", label: "Foundations", Icon: BookOpen },
  { name: "Flame", label: "Popular / Trends", Icon: Flame },
];

const COLOR_PRESETS = [
  { hex: "#10b981", label: "Emerald" },
  { hex: "#a855f7", label: "Purple" },
  { hex: "#38bdf8", label: "Sky Blue" },
  { hex: "#f59e0b", label: "Amber" },
  { hex: "#ec4899", label: "Pink" },
];

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
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("Full-Stack Web Development");
  const [selectedTrack, setSelectedTrack] = useState<"web" | "dsa" | "systems" | "core">("web");
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatIcon, setNewCatIcon] = useState("Sparkles");
  const [newCatDesc, setNewCatDesc] = useState("");
  const [newCatTags, setNewCatTags] = useState("");
  const [newCatCta, setNewCatCta] = useState("");
  const [newCatColor, setNewCatColor] = useState("#10b981");
  const [catSaving, setCatSaving] = useState(false);
  const [catError, setCatError] = useState<string | null>(null);
  const [categoryModalTab, setCategoryModalTab] = useState<"create" | "browse">("create");
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [editing, setEditing] = useState<Course | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [searchFilter, setSearchFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const editorRef = useRef<HTMLFormElement>(null);

  const inputClass = (name: string) => (fieldErrors[name]?.length ? "input-invalid" : undefined);
  const fieldError = (name: string) =>
    fieldErrors[name]?.[0] ? <small className="field-error">{fieldErrors[name][0]}</small> : null;

  const loadCategories = () => {
    return api("/api/categories")
      .then((data) => {
        if (data.categories?.length) {
          setCategories(data.categories);
        }
      })
      .catch(() => {});
  };

  const load = () => {
    setLoading(true);
    void loadCategories();
    return api("/api/admin/courses")
      .then((data) => setCourses(data.courses))
      .catch((error) => setToast({ type: "error", text: error.message }))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    if (!showForm || !editing) return;

    const frame = requestAnimationFrame(() => {
      editorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      editorRef.current?.querySelector<HTMLInputElement>('input[name="title"]')?.focus();
    });

    return () => cancelAnimationFrame(frame);
  }, [editing, showForm]);

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

  const handleCategorySelect = (catName: string) => {
    setSelectedCategory(catName);
    const lower = catName.toLowerCase();
    if (lower.includes("dsa") || lower.includes("algo") || lower.includes("logic")) {
      setSelectedTrack("dsa");
    } else if (
      lower.includes("network") ||
      lower.includes("linux") ||
      lower.includes("system") ||
      lower.includes("os")
    ) {
      setSelectedTrack("systems");
    } else if (
      lower.includes("c++") ||
      lower.includes("java") ||
      lower.includes("python") ||
      lower.includes("language") ||
      lower.includes("core")
    ) {
      setSelectedTrack("core");
    } else {
      setSelectedTrack("web");
    }
  };

  const openCreate = () => {
    setEditing(null);
    setFieldErrors({});
    setToast(null);
    const defaultCat = categories[0]?.name || "Full-Stack Web Development";
    handleCategorySelect(defaultCat);
    setShowForm((open) => !open);
  };

  const openEdit = (course: Course) => {
    setToast(null);
    setFieldErrors({});
    setSelectedCourse(null);
    setEditing(course);
    const cat = course.category || categories[0]?.name || "Full-Stack Web Development";
    setSelectedCategory(cat);
    setSelectedTrack(course.track ?? "web");
    setShowForm(true);
  };

  const handleCreateCategory = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!newCatName.trim()) {
      setCatError("Please enter a category heading / title.");
      return;
    }
    setCatSaving(true);
    setCatError(null);
    try {
      const techTagsArray = newCatTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const res = await api("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCatName.trim(),
          icon: newCatIcon || "Sparkles",
          description: newCatDesc.trim(),
          techTags: techTagsArray,
          ctaLabel: newCatCta.trim() || `View ${newCatName.trim()} Courses`,
          color: newCatColor || "#10b981",
        }),
      });
      const created: CategoryItem = res.category;
      setCategories((prev) => [
        created,
        ...prev.filter((c) => c.name.toLowerCase() !== created.name.toLowerCase()),
      ]);
      handleCategorySelect(created.name);
      setNewCatName("");
      setNewCatDesc("");
      setNewCatTags("");
      setNewCatCta("");
      setShowCategoryModal(false);
      setToast({ type: "success", text: `Category "${created.name}" created and selected!` });
    } catch (err: any) {
      setCatError(err.message || "Failed to create category");
    } finally {
      setCatSaving(false);
    }
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
      render: (course) => {
        const CourseIcon = getCourseIcon(course.icon);
        return (
          <div className="course-profile-cell">
            <div className="course-profile-title-row">
              <span className="course-icon-badge" title={`${course.icon || "Code2"} course icon`}>
                <CourseIcon size={14} />
              </span>
              <strong className="course-profile-title">{course.title}</strong>
            </div>
            <div className="course-profile-slug-row">
              <code className="course-slug-code">/{course.slug}</code>
              <a
                href={`/courses/${course._id}`}
                target="_blank"
                rel="noreferrer"
                className="course-live-link"
                onClick={(e) => e.stopPropagation()}
                title="Open public course page in new tab"
              >
                <ExternalLink size={11} />
                <span>Live Page</span>
              </a>
            </div>
          </div>
        );
      },
    },
    {
      key: "category",
      header: "Track & Category",
      sortable: true,
      render: (course) => (
        <div className="course-track-cell">
          <span className="course-track-badge">{course.track?.toUpperCase() || "WEB"}</span>
          <span className="course-category-label">{course.category}</span>
        </div>
      ),
    },
    {
      key: "monthlyFee",
      header: "Fee / Duration",
      sortable: true,
      render: (course) => (
        <div className="course-fee-cell">
          <b className="course-fee-amount">₹{course.monthlyFee.toLocaleString("en-IN")}/mo</b>
          <small className="course-duration-sub">
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
        <span className={`status-badge course-status-${course.status}`}>
          <span className="course-status-dot" aria-hidden="true" />
          {course.status}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      sortable: false,
      render: (course) => (
        <div className="course-actions-group">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              openEdit(course);
            }}
            className="course-action-btn edit"
            title="Edit course details & syllabus"
          >
            <Edit3 size={13} />
            <span>Edit</span>
          </button>
          {course.status !== "published" && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                void changeStatus(course._id, "publish");
              }}
              className="course-action-btn publish"
              title="Publish to live website"
            >
              <Globe size={13} />
              <span>Publish</span>
            </button>
          )}
          {course.status !== "archived" && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                void changeStatus(course._id, "archive");
              }}
              className="course-action-btn archive"
              title="Archive program"
            >
              <Archive size={13} />
              <span>Archive</span>
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <main className="portal-content admin-courses-page">
      <div className="portal-intro" style={{ marginBottom: 28 }}>
        <div>
          <p
            className="kicker"
            style={{
              color: "#38bdf8",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              fontSize: 11,
              margin: "0 0 6px",
            }}
          >
            CURRICULUM MANAGEMENT
          </p>
          <h1
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "28px",
              color: "#ffffff",
              margin: "0 0 8px",
            }}
          >
            Course Programs
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "14px", margin: 0 }}>
            Create drafts, configure frontend card details, manage syllabus topics, and upload images.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button
            type="button"
            className="button secondary admin-action-btn"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              padding: "10px 16px",
              borderRadius: 10,
              background: "rgba(168, 85, 247, 0.15)",
              border: "1px solid rgba(168, 85, 247, 0.4)",
              color: "#d8b4fe",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
            }}
            onClick={() => {
              setCatError(null);
              setShowCategoryModal(true);
            }}
          >
            <Tag size={15} />
            <span>Manage Categories</span>
          </button>

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
      </div>

      {/* 2. KPI Metrics Grid */}
      <div
        className="kpi-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
          gap: 16,
          marginBottom: 28,
        }}
      >
        <div className="kpi-card">
          <div className="kpi-icon-wrap icon-purple">
            <BookOpen size={20} />
          </div>
          <div className="kpi-meta">
            <span className="kpi-title">Total Programs</span>
            <strong className="kpi-val">{courses.length}</strong>
            <small className="kpi-sub">Curriculum offerings</small>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap icon-emerald">
            <CheckCircle2 size={20} />
          </div>
          <div className="kpi-meta">
            <span className="kpi-title">Published Live</span>
            <strong className="kpi-val">{courses.filter((c) => c.status === "published").length}</strong>
            <small className="kpi-sub">Active on public website</small>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap icon-amber">
            <Clock size={20} />
          </div>
          <div className="kpi-meta">
            <span className="kpi-title">Draft Courses</span>
            <strong className="kpi-val">{courses.filter((c) => c.status === "draft").length}</strong>
            <small className="kpi-sub">Unpublished work-in-progress</small>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap icon-cyan">
            <Sparkles size={20} />
          </div>
          <div className="kpi-meta">
            <span className="kpi-title">Featured on Home</span>
            <strong className="kpi-val">{courses.filter((c) => c.isFeatured).length}</strong>
            <small className="kpi-sub">Highlighted homepage cards</small>
          </div>
        </div>
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
          ref={editorRef}
          id="course-editor"
          className="course-form admin-course-editor-form"
          key={editing?._id ?? "new"}
          noValidate
          onSubmit={save}
        >
          {/* Top Form Header with Title & Action Controls */}
          <div className="course-editor-top-bar">
            <div className="course-editor-heading-wrap">
              <div className="course-editor-title-row">
                <span className="course-editor-mode-indicator" />
                <h3 className="course-editor-title">
                  {editing ? `Editing: ${editing.title}` : "Create New Course Program"}
                </h3>
              </div>
              <p className="course-editor-subtitle">
                Configure all fields that appear on the homepage course card, catalog, and detailed syllabus
                page.
              </p>
            </div>

            {/* Quick Top Save & Cancel Actions */}
            <div className="course-editor-actions-group">
              <button type="button" onClick={() => setShowForm(false)} className="course-editor-btn-cancel">
                Cancel
              </button>
              <button className="button primary course-editor-btn-save" type="submit">
                <Check size={15} />
                <span>{editing ? "Save Changes" : "Save Course"}</span>
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

          {/* 3. Course Category Selector (Primary Category) */}
          <div className="course-category-picker-block form-wide">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 6,
                flexWrap: "wrap",
                gap: 6,
              }}
            >
              <label style={{ margin: 0, fontWeight: 700, fontSize: 13, color: "#e2e8f0" }}>
                Course Category <span style={{ color: "#f87171" }}>*</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  setCatError(null);
                  setShowCategoryModal(true);
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "5px 12px",
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  background: "rgba(168, 85, 247, 0.2)",
                  border: "1px solid rgba(168, 85, 247, 0.45)",
                  color: "#d8b4fe",
                  cursor: "pointer",
                }}
              >
                <Plus size={13} />
                <span>+ Create New Category</span>
              </button>
            </div>

            <select
              className={inputClass("category")}
              name="category"
              value={selectedCategory}
              onChange={(e) => handleCategorySelect(e.target.value)}
              required
              style={{
                width: "100%",
                height: 42,
                background: "#0d1330",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                borderRadius: 8,
                color: "#ffffff",
                padding: "0 12px",
                fontSize: 14,
              }}
            >
              {categories.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
              {selectedCategory &&
                !categories.some((c) => c.name.toLowerCase() === selectedCategory.toLowerCase()) && (
                  <option value={selectedCategory}>{selectedCategory}</option>
                )}
            </select>
            {fieldError("category")}
            <small style={{ color: "#94a3b8", fontSize: 11.5, marginTop: 4, display: "block" }}>
              Main category grouping this program across the public catalog, filters, and student tracks.
            </small>
          </div>

          {/* 4. Homepage Track Filter Section */}
          <label>
            Homepage Track Filter Section
            <select
              name="track"
              value={selectedTrack}
              onChange={(e) => setSelectedTrack(e.target.value as any)}
            >
              <option value="web">Full-Stack Web (MERN / Next.js)</option>
              <option value="dsa">DSA, Logic &amp; System Design</option>
              <option value="systems">Computer Networks &amp; Linux OS</option>
              <option value="core">Core Coding (C, C++, Java, Python)</option>
            </select>
            <small style={{ color: "#64748b", fontSize: 11 }}>
              Homepage tab where this course appears (auto-selected from category).
            </small>
          </label>

          {/* 5. Track Label Badge (Shown on top-left of Card) */}
          <label>
            Card Track Label Badge
            <input
              name="trackLabel"
              defaultValue={editing?.trackLabel ?? ""}
              placeholder="e.g. MERN Stack, DSA & Logic, Networking, OS & Linux"
            />
            <small style={{ color: "#64748b", fontSize: 11 }}>
              Badge text displayed on the top of the course card.
            </small>
          </label>

          {/* 6. Course Icon */}
          <div className="course-icon-field">
            <span className="course-icon-field-label">Course Icon</span>
            <CourseIconPicker key={editing?._id ?? "new"} defaultValue={editing?.icon ?? "Code2"} />
          </div>

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
            <small style={{ color: "#64748b", fontSize: 11 }}>
              Appears beside duration on card (e.g. 3 Months &bull; 90+ Class Hours)
            </small>
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
              Enter each perk on a new line. These appear as the green checkmarked items on the frontend
              course card!
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
            <small style={{ color: "#64748b", fontSize: 11 }}>
              Tags shown on the course detail syllabus page.
            </small>
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
            <small style={{ color: "#94a3b8", fontSize: 11 }}>
              One module per line: module title followed by comma-separated topics after a colon.
            </small>
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
          <div className="course-editor-bottom-bar">
            <div className="course-editor-bottom-status">
              <span className="save-status-dot" />
              <strong className="save-status-title">
                {editing ? `Editing "${editing.title}"` : "New Course Draft"}
              </strong>
              <span className="save-status-sub">— Changes ready to save</span>
            </div>

            <div className="course-editor-actions-group">
              <button type="button" onClick={() => setShowForm(false)} className="course-editor-btn-cancel">
                Cancel
              </button>
              <button className="button primary course-editor-btn-save" type="submit">
                <Check size={16} />
                <span>{editing ? "Save Changes" : "Create & Save Course"}</span>
              </button>
            </div>
          </div>
        </form>
      )}

      <AgTable<Course>
        loading={loading}
        onRowClick={(c) => setSelectedCourse(c)}
        statusTabs={[
          { key: "all", label: "All Programs", count: courses.length },
          {
            key: "published",
            label: "Published",
            count: courses.filter((c) => c.status === "published").length,
          },
          { key: "draft", label: "Drafts", count: courses.filter((c) => c.status === "draft").length },
          {
            key: "archived",
            label: "Archived",
            count: courses.filter((c) => c.status === "archived").length,
          },
        ]}
        activeStatusTab={statusFilter}
        onStatusTabChange={(tabKey) => setStatusFilter(tabKey)}
        columns={courseColumns}
        data={courses.filter((c) => statusFilter === "all" || c.status === statusFilter)}
        searchPlaceholder="Search programs by title, slug, track, or category..."
        searchAccessor={(c) => `${c.title} ${c.slug} ${c.category} ${c.track ?? ""}`}
        initialPageSize={10}
        emptyMessage="No course programs found."
        getRowId={(c) => c._id}
        onRefresh={load}
        exportFilename="curriculum-courses"
      />

      {/* COURSE CURRICULUM PREVIEW MODAL */}
      {selectedCourse && (
        <div className="modal-backdrop" onClick={() => setSelectedCourse(null)}>
          <div
            className="student-dossier-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 760, maxHeight: "90vh", overflowY: "auto" }}
          >
            <div className="modal-header">
              <div className="modal-title-row" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <BookOpen size={20} className="text-purple-400" />
                <h3 style={{ margin: 0, fontSize: 17, color: "#ffffff" }}>Course Program &amp; Curriculum</h3>
              </div>
              <button
                type="button"
                className="close-modal-btn"
                onClick={() => setSelectedCourse(null)}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ padding: 24 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 16,
                  marginBottom: 20,
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <h4 style={{ margin: 0, fontSize: 20, color: "#ffffff" }}>{selectedCourse.title}</h4>
                  <div
                    style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap", alignItems: "center" }}
                  >
                    <code style={{ color: "#a855f7", fontSize: 12 }}>/{selectedCourse.slug}</code>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: "2px 8px",
                        borderRadius: 4,
                        background: "rgba(56, 189, 248, 0.15)",
                        color: "#38bdf8",
                        textTransform: "capitalize",
                      }}
                    >
                      {selectedCourse.category}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: "2px 8px",
                        borderRadius: 4,
                        background: "rgba(168, 85, 247, 0.15)",
                        color: "#c084fc",
                        textTransform: "capitalize",
                      }}
                    >
                      {selectedCourse.level} Level
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: "2px 8px",
                        borderRadius: 4,
                        background:
                          selectedCourse.status === "published"
                            ? "rgba(16, 185, 129, 0.15)"
                            : "rgba(245, 158, 11, 0.15)",
                        color: selectedCourse.status === "published" ? "#34d399" : "#fbbf24",
                      }}
                    >
                      {selectedCourse.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "#38bdf8" }}>
                    ₹{selectedCourse.monthlyFee.toLocaleString("en-IN")}{" "}
                    <span style={{ fontSize: 13, color: "#94a3b8", fontWeight: 400 }}>/ month</span>
                  </div>
                  <small style={{ color: "#94a3b8" }}>
                    {selectedCourse.durationMonths} Months Duration &bull; {selectedCourse.labHours}
                  </small>
                </div>
              </div>

              {/* Description */}
              <div
                style={{
                  background: "#070b24",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 18,
                }}
              >
                <p style={{ margin: 0, color: "#cbd5e1", fontSize: 13.5, lineHeight: 1.6 }}>
                  {selectedCourse.description}
                </p>
              </div>

              {/* Skills and Prerequisites */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
                <div
                  style={{
                    background: "#070b24",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: 12,
                    padding: 14,
                  }}
                >
                  <h6
                    style={{
                      margin: "0 0 8px",
                      fontSize: 11.5,
                      color: "#38bdf8",
                      textTransform: "uppercase",
                    }}
                  >
                    Core Skills Taught
                  </h6>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {selectedCourse.skills.map((s) => (
                      <span
                        key={s}
                        style={{
                          fontSize: 11,
                          background: "rgba(56, 189, 248, 0.1)",
                          color: "#38bdf8",
                          padding: "2px 8px",
                          borderRadius: 4,
                          border: "1px solid rgba(56, 189, 248, 0.2)",
                        }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div
                  style={{
                    background: "#070b24",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: 12,
                    padding: 14,
                  }}
                >
                  <h6
                    style={{
                      margin: "0 0 8px",
                      fontSize: 11.5,
                      color: "#a855f7",
                      textTransform: "uppercase",
                    }}
                  >
                    Prerequisites
                  </h6>
                  <p style={{ margin: 0, fontSize: 12.5, color: "#cbd5e1" }}>
                    {selectedCourse.prerequisites.join(", ") || "None (Beginner friendly)"}
                  </p>
                </div>
              </div>

              {/* Syllabus Breakdown */}
              <div style={{ marginBottom: 24 }}>
                <h5
                  style={{
                    margin: "0 0 12px",
                    fontSize: 14,
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <BookOpen size={16} color="#a855f7" /> Syllabus Curriculum Modules (
                  {selectedCourse.syllabus.length})
                </h5>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {selectedCourse.syllabus.map((mod, mIdx) => (
                    <div
                      key={mod.id || mIdx}
                      style={{
                        background: "#070b24",
                        border: "1px solid rgba(255, 255, 255, 0.06)",
                        borderRadius: 10,
                        padding: 14,
                      }}
                    >
                      <b style={{ color: "#ffffff", fontSize: 13.5, display: "block", marginBottom: 6 }}>
                        {mod.title}
                      </b>
                      <ul
                        style={{
                          margin: 0,
                          paddingLeft: 18,
                          color: "#94a3b8",
                          fontSize: 12.5,
                          lineHeight: 1.6,
                        }}
                      >
                        {mod.topics.map((t, tIdx) => (
                          <li key={tIdx}>{t}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  justifyContent: "flex-end",
                  flexWrap: "wrap",
                  borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                  paddingTop: 18,
                }}
              >
                <a
                  href={`/courses/${selectedCourse.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "9px 16px",
                    borderRadius: 8,
                    background: "rgba(255, 255, 255, 0.06)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    color: "#cbd5e1",
                    fontSize: 13,
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  <ExternalLink size={14} /> View Live Page
                </a>
                <button
                  type="button"
                  onClick={() => {
                    const c = selectedCourse;
                    setSelectedCourse(null);
                    openEdit(c);
                  }}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "9px 18px",
                    borderRadius: 8,
                    background: "linear-gradient(135deg, #7c3aed, #9333ea)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    color: "#ffffff",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Edit This Program
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Management Modal */}
      {showCategoryModal &&
        (() => {
          const CurrentIcon = PRESET_ICONS.find((p) => p.name === newCatIcon)?.Icon || Sparkles;
          const previewTags = newCatTags.trim()
            ? newCatTags
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean)
            : ["Tailwind CSS", "GSAP Animations", "React Components", "UI Libraries", "Responsive UI"];

          return (
            <div
              role="dialog"
              aria-modal="true"
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0, 0, 0, 0.8)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "12px",
                zIndex: 9999,
                boxSizing: "border-box",
              }}
              onClick={(e) => {
                if (e.target === e.currentTarget) setShowCategoryModal(false);
              }}
            >
              <div
                style={{
                  background: "#0a0f28",
                  border: "1px solid rgba(168, 85, 247, 0.35)",
                  borderRadius: 16,
                  padding: "18px 16px 14px",
                  width: "100%",
                  maxWidth: 620,
                  minHeight: "min(560px, calc(100dvh - 30px))",
                  maxHeight: "min(680px, calc(100dvh - 30px))",
                  display: "flex",
                  flexDirection: "column",
                  boxShadow: "0 20px 60px rgba(0, 0, 0, 0.85), 0 0 40px rgba(168, 85, 247, 0.15)",
                  boxSizing: "border-box",
                  overflow: "hidden",
                }}
              >
                {/* Header */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 10,
                    paddingBottom: 10,
                    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                    flexShrink: 0,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: "rgba(168, 85, 247, 0.18)",
                        border: "1px solid rgba(168, 85, 247, 0.4)",
                        display: "grid",
                        placeItems: "center",
                        color: "#d8b4fe",
                        flexShrink: 0,
                      }}
                    >
                      <Tag size={15} />
                    </div>
                    <div>
                      <h3
                        style={{
                          margin: 0,
                          fontSize: 16,
                          fontWeight: 700,
                          color: "#ffffff",
                          lineHeight: 1.2,
                        }}
                      >
                        Manage Course Categories
                      </h3>
                      <small style={{ color: "#94a3b8", fontSize: 11 }}>
                        Configure heading, icon, description, tech keywords &amp; CTA
                      </small>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowCategoryModal(false)}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: "rgba(255, 255, 255, 0.07)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      color: "#94a3b8",
                      cursor: "pointer",
                      display: "grid",
                      placeItems: "center",
                      padding: 0,
                    }}
                  >
                    <X size={15} />
                  </button>
                </div>

                {/* Navigation Tabs */}
                <div
                  style={{
                    display: "flex",
                    gap: 6,
                    padding: "4px",
                    background: "rgba(255, 255, 255, 0.04)",
                    borderRadius: 8,
                    marginBottom: 12,
                    flexShrink: 0,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setCategoryModalTab("create")}
                    style={{
                      flex: 1,
                      padding: "7px 12px",
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                      border: 0,
                      background: categoryModalTab === "create" ? "rgba(168, 85, 247, 0.3)" : "transparent",
                      color: categoryModalTab === "create" ? "#ffffff" : "#94a3b8",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      transition: "all 0.15s ease",
                    }}
                  >
                    <Plus size={13} />
                    <span>Create Category</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategoryModalTab("browse")}
                    style={{
                      flex: 1,
                      padding: "7px 12px",
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                      border: 0,
                      background: categoryModalTab === "browse" ? "rgba(168, 85, 247, 0.3)" : "transparent",
                      color: categoryModalTab === "browse" ? "#ffffff" : "#94a3b8",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      transition: "all 0.15s ease",
                    }}
                  >
                    <Tag size={13} />
                    <span>Available Categories ({categories.length})</span>
                  </button>
                </div>

                {/* Scrollable Body */}
                <div
                  style={{
                    flex: 1,
                    minHeight: 0,
                    overflowY: "auto",
                    display: "flex",
                    flexDirection: "column",
                    gap: 14,
                    paddingRight: 3,
                  }}
                >
                  {catError && (
                    <div
                      style={{
                        background: "rgba(239, 68, 68, 0.15)",
                        border: "1px solid rgba(239, 68, 68, 0.4)",
                        color: "#fca5a5",
                        padding: "8px 12px",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    >
                      {catError}
                    </div>
                  )}

                  {categoryModalTab === "create" ? (
                    <form
                      onSubmit={handleCreateCategory}
                      style={{ margin: 0, display: "flex", flexDirection: "column", gap: 12 }}
                    >
                      {/* 1. Category Heading */}
                      <div>
                        <label
                          style={{
                            display: "block",
                            fontSize: 11,
                            fontWeight: 700,
                            color: "#cbd5e1",
                            marginBottom: 5,
                            textTransform: "uppercase",
                            letterSpacing: "0.04em",
                          }}
                        >
                          Category Heading / Title <span style={{ color: "#f87171" }}>*</span>
                        </label>
                        <input
                          type="text"
                          value={newCatName}
                          onChange={(e) => setNewCatName(e.target.value)}
                          placeholder="e.g. Frontend, Tailwind & GSAP"
                          required
                          style={{
                            width: "100%",
                            height: 38,
                            background: "#06091e",
                            border: "1px solid rgba(255, 255, 255, 0.16)",
                            borderRadius: 8,
                            padding: "0 12px",
                            color: "#ffffff",
                            fontSize: 13,
                            boxSizing: "border-box",
                          }}
                        />
                      </div>

                      {/* 2. Icon Picker & Color Theme */}
                      <div>
                        <label
                          style={{
                            display: "block",
                            fontSize: 11,
                            fontWeight: 700,
                            color: "#cbd5e1",
                            marginBottom: 6,
                            textTransform: "uppercase",
                            letterSpacing: "0.04em",
                          }}
                        >
                          Category Technical Icon
                        </label>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(78px, 1fr))",
                            gap: 6,
                            maxHeight: 110,
                            overflowY: "auto",
                            padding: "2px",
                            marginBottom: 8,
                          }}
                        >
                          {PRESET_ICONS.map(({ name, label, Icon }) => {
                            const isSel = newCatIcon === name;
                            return (
                              <button
                                type="button"
                                key={name}
                                onClick={() => setNewCatIcon(name)}
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                  gap: 3,
                                  padding: "6px 4px",
                                  borderRadius: 7,
                                  background: isSel ? `${newCatColor}28` : "rgba(255, 255, 255, 0.04)",
                                  border: isSel
                                    ? `1px solid ${newCatColor}`
                                    : "1px solid rgba(255, 255, 255, 0.08)",
                                  color: isSel ? "#ffffff" : "#94a3b8",
                                  cursor: "pointer",
                                  transition: "all 0.15s ease",
                                }}
                              >
                                <Icon size={16} color={isSel ? newCatColor : undefined} />
                                <span
                                  style={{
                                    fontSize: 9.5,
                                    textAlign: "center",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    maxWidth: "100%",
                                  }}
                                >
                                  {label}
                                </span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Color Theme Row */}
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                          <span style={{ fontSize: 10.5, color: "#94a3b8", fontWeight: 600 }}>
                            Color Glow:
                          </span>
                          <div style={{ display: "flex", gap: 6 }}>
                            {COLOR_PRESETS.map((cp) => (
                              <button
                                type="button"
                                key={cp.hex}
                                title={cp.label}
                                onClick={() => setNewCatColor(cp.hex)}
                                style={{
                                  width: 20,
                                  height: 20,
                                  borderRadius: "50%",
                                  background: cp.hex,
                                  border:
                                    newCatColor === cp.hex ? "2px solid #ffffff" : "2px solid transparent",
                                  cursor: "pointer",
                                  padding: 0,
                                  boxShadow: newCatColor === cp.hex ? `0 0 8px ${cp.hex}` : "none",
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* 3. Description */}
                      <div>
                        <label
                          style={{
                            display: "block",
                            fontSize: 11,
                            fontWeight: 700,
                            color: "#cbd5e1",
                            marginBottom: 5,
                            textTransform: "uppercase",
                            letterSpacing: "0.04em",
                          }}
                        >
                          Track Description
                        </label>
                        <textarea
                          value={newCatDesc}
                          onChange={(e) => setNewCatDesc(e.target.value)}
                          placeholder="Build stunning, interactive websites with modern CSS, Tailwind utility styling, UI component libraries, and buttery-smooth GSAP animations."
                          rows={2}
                          style={{
                            width: "100%",
                            minHeight: 58,
                            background: "#06091e",
                            border: "1px solid rgba(255, 255, 255, 0.16)",
                            borderRadius: 8,
                            padding: "8px 12px",
                            color: "#ffffff",
                            fontSize: 12.5,
                            lineHeight: 1.45,
                            boxSizing: "border-box",
                            resize: "vertical",
                          }}
                        />
                      </div>

                      {/* 4. Tech Keywords / Tags */}
                      <div>
                        <label
                          style={{
                            display: "block",
                            fontSize: 11,
                            fontWeight: 700,
                            color: "#cbd5e1",
                            marginBottom: 5,
                            textTransform: "uppercase",
                            letterSpacing: "0.04em",
                          }}
                        >
                          Tech Keywords &amp; Tags (Comma-separated)
                        </label>
                        <input
                          type="text"
                          value={newCatTags}
                          onChange={(e) => setNewCatTags(e.target.value)}
                          placeholder="Tailwind CSS, GSAP Animations, React Components, UI Libraries"
                          style={{
                            width: "100%",
                            height: 38,
                            background: "#06091e",
                            border: "1px solid rgba(255, 255, 255, 0.16)",
                            borderRadius: 8,
                            padding: "0 12px",
                            color: "#ffffff",
                            fontSize: 12.5,
                            boxSizing: "border-box",
                          }}
                        />
                        <small style={{ color: "#64748b", fontSize: 10.5, marginTop: 3, display: "block" }}>
                          Separated by commas. These appear as pills on the homepage card.
                        </small>
                      </div>

                      {/* 5. Action Link Label */}
                      <div>
                        <label
                          style={{
                            display: "block",
                            fontSize: 11,
                            fontWeight: 700,
                            color: "#cbd5e1",
                            marginBottom: 5,
                            textTransform: "uppercase",
                            letterSpacing: "0.04em",
                          }}
                        >
                          Action Link Label (Optional)
                        </label>
                        <input
                          type="text"
                          value={newCatCta}
                          onChange={(e) => setNewCatCta(e.target.value)}
                          placeholder={
                            newCatName.trim() ? `View ${newCatName.trim()} Courses` : "View Frontend Courses"
                          }
                          style={{
                            width: "100%",
                            height: 38,
                            background: "#06091e",
                            border: "1px solid rgba(255, 255, 255, 0.16)",
                            borderRadius: 8,
                            padding: "0 12px",
                            color: "#ffffff",
                            fontSize: 12.5,
                            boxSizing: "border-box",
                          }}
                        />
                      </div>

                      {/* Live Card Preview matching media_1794753273071_f9122456.png */}
                      <div style={{ marginTop: 4 }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 6,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 10.5,
                              fontWeight: 700,
                              color: "#94a3b8",
                              textTransform: "uppercase",
                              letterSpacing: "0.05em",
                            }}
                          >
                            Live Pillar Card Preview
                          </span>
                          <span
                            style={{
                              fontSize: 10,
                              color: "#38bdf8",
                              background: "rgba(56, 189, 248, 0.12)",
                              padding: "2px 7px",
                              borderRadius: 9999,
                            }}
                          >
                            Homepage Card Appearance
                          </span>
                        </div>

                        <div
                          style={{
                            background:
                              "linear-gradient(135deg, rgba(13, 20, 50, 0.9), rgba(7, 11, 36, 0.95))",
                            border: "1px solid rgba(168, 85, 247, 0.35)",
                            borderRadius: 14,
                            padding: "16px",
                            display: "flex",
                            flexDirection: "column",
                            gap: 10,
                            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.4)",
                          }}
                        >
                          {/* Icon Box */}
                          <div
                            style={{
                              width: 44,
                              height: 44,
                              borderRadius: 12,
                              background: `${newCatColor}20`,
                              border: `1px solid ${newCatColor}55`,
                              display: "grid",
                              placeItems: "center",
                              color: newCatColor,
                              boxShadow: `0 0 14px ${newCatColor}30`,
                            }}
                          >
                            <CurrentIcon size={22} />
                          </div>

                          {/* Title */}
                          <h4
                            style={{
                              margin: 0,
                              fontSize: 16,
                              fontWeight: 700,
                              color: "#ffffff",
                              lineHeight: 1.3,
                            }}
                          >
                            {newCatName.trim() || "Frontend, Tailwind & GSAP"}
                          </h4>

                          {/* Description */}
                          <p style={{ margin: 0, fontSize: 12, lineHeight: 1.45, color: "#94a3b8" }}>
                            {newCatDesc.trim() ||
                              "Build stunning, interactive websites with modern CSS, Tailwind utility styling, UI component libraries, and buttery-smooth GSAP animations."}
                          </p>

                          {/* Tech Tag Pills */}
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                            {previewTags.map((tag, idx) => (
                              <span
                                key={idx}
                                style={{
                                  background: "rgba(255, 255, 255, 0.05)",
                                  border: "1px solid rgba(255, 255, 255, 0.12)",
                                  borderRadius: 6,
                                  padding: "2px 8px",
                                  fontSize: 11,
                                  color: "#cbd5e1",
                                  fontWeight: 500,
                                }}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>

                          {/* Action Link */}
                          <div
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 5,
                              color: "#c084fc",
                              fontSize: 12,
                              fontWeight: 600,
                              marginTop: 2,
                            }}
                          >
                            <span>
                              {newCatCta.trim() ||
                                (newCatName.trim()
                                  ? `View ${newCatName.trim()} Courses`
                                  : "View Frontend Courses")}
                            </span>
                            <ChevronRight size={13} />
                          </div>
                        </div>
                      </div>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={catSaving || !newCatName.trim()}
                        style={{
                          marginTop: 4,
                          height: 40,
                          background: "linear-gradient(135deg, #7c3aed, #9333ea)",
                          border: 0,
                          borderRadius: 8,
                          color: "#ffffff",
                          fontWeight: 700,
                          fontSize: 13,
                          cursor: catSaving ? "wait" : "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                          boxShadow: "0 4px 16px rgba(124, 58, 237, 0.4)",
                        }}
                      >
                        <Plus size={15} />
                        <span>{catSaving ? "Saving Category..." : "+ Save Category & Use"}</span>
                      </button>
                    </form>
                  ) : (
                    /* Browse Existing Categories Tab */
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: "#94a3b8",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                          }}
                        >
                          Curriculum Tracks ({categories.length})
                        </span>
                        <small style={{ color: "#64748b", fontSize: 10.5 }}>Tap category to select</small>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {categories.map((c) => {
                          const isSelected = selectedCategory.toLowerCase() === c.name.toLowerCase();
                          const courseCount = courses.filter(
                            (x) => x.category?.toLowerCase() === c.name.toLowerCase(),
                          ).length;
                          const CatIconComp = PRESET_ICONS.find((p) => p.name === c.icon)?.Icon || Code2;

                          return (
                            <div
                              key={c.name}
                              onClick={() => {
                                handleCategorySelect(c.name);
                                setToast({ type: "success", text: `Selected category: "${c.name}"` });
                              }}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: 10,
                                background: isSelected
                                  ? "rgba(168, 85, 247, 0.2)"
                                  : "rgba(255, 255, 255, 0.04)",
                                border: isSelected
                                  ? "1px solid rgba(168, 85, 247, 0.6)"
                                  : "1px solid rgba(255, 255, 255, 0.08)",
                                borderRadius: 10,
                                padding: "10px 14px",
                                cursor: "pointer",
                                transition: "all 0.15s ease",
                              }}
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                                <div
                                  style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: 8,
                                    background: `${c.color || "#a855f7"}20`,
                                    border: `1px solid ${c.color || "#a855f7"}50`,
                                    display: "grid",
                                    placeItems: "center",
                                    color: c.color || "#c084fc",
                                    flexShrink: 0,
                                  }}
                                >
                                  <CatIconComp size={16} />
                                </div>
                                <div style={{ minWidth: 0 }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                    <span
                                      style={{
                                        fontSize: 13,
                                        fontWeight: 700,
                                        color: isSelected ? "#ffffff" : "#e2e8f0",
                                      }}
                                    >
                                      {c.name}
                                    </span>
                                    {isSelected && (
                                      <span
                                        style={{
                                          fontSize: 9.5,
                                          background: "rgba(168, 85, 247, 0.4)",
                                          color: "#ffffff",
                                          padding: "1px 6px",
                                          borderRadius: 9999,
                                          fontWeight: 700,
                                        }}
                                      >
                                        Active
                                      </span>
                                    )}
                                  </div>
                                  {c.description && (
                                    <p
                                      style={{
                                        margin: "2px 0 0",
                                        fontSize: 11,
                                        color: "#94a3b8",
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        maxWidth: 300,
                                      }}
                                    >
                                      {c.description}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <span
                                style={{
                                  fontSize: 11,
                                  background: isSelected
                                    ? "rgba(168, 85, 247, 0.45)"
                                    : "rgba(255, 255, 255, 0.08)",
                                  color: isSelected ? "#ffffff" : "#94a3b8",
                                  padding: "3px 9px",
                                  borderRadius: 9999,
                                  fontWeight: 700,
                                  flexShrink: 0,
                                }}
                              >
                                {courseCount} {courseCount === 1 ? "course" : "courses"}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Docked Footer with Always-Visible Button */}
                <div
                  style={{
                    marginTop: 10,
                    paddingTop: 10,
                    borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      fontSize: 11.5,
                      color: "#94a3b8",
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      maxWidth: "60%",
                    }}
                  >
                    <span>Selected:</span>
                    <strong style={{ color: "#c084fc" }}>{selectedCategory}</strong>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowCategoryModal(false)}
                    style={{
                      height: 34,
                      background: "rgba(168, 85, 247, 0.22)",
                      border: "1px solid rgba(168, 85, 247, 0.5)",
                      color: "#ffffff",
                      borderRadius: 7,
                      padding: "0 20px",
                      fontSize: 12.5,
                      fontWeight: 600,
                      cursor: "pointer",
                      flexShrink: 0,
                    }}
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
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
