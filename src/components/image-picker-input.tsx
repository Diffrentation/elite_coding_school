"use client";

import { ChangeEvent, useState } from "react";
import { Upload, Link as LinkIcon, X, Check, Image as ImageIcon, Loader2 } from "lucide-react";

interface ImagePickerInputProps {
  label: string;
  name: string;
  defaultValue?: string | null;
  folder?: string;
  helperText?: string;
}

export function ImagePickerInput({
  label,
  name,
  defaultValue = "",
  folder = "general",
  helperText,
}: ImagePickerInputProps) {
  const [value, setValue] = useState(defaultValue || "");
  const [mode, setMode] = useState<"upload" | "url">(defaultValue?.startsWith("http") ? "url" : "upload");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");

  async function handleFileUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"].includes(file.type)) {
      setError("Please choose a valid JPG, PNG, WebP, GIF, or SVG image.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Image size must be under 10 MB.");
      return;
    }

    setError("");
    setUploading(true);
    setFileName(file.name);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to upload image.");
      }

      setValue(data.data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  function handleClear() {
    setValue("");
    setFileName("");
    setError("");
  }

  return (
    <div className="image-picker-input" style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%", minWidth: 0, boxSizing: "border-box" }}>
      {/* Hidden input ensuring the selected URL is submitted with standard FormData */}
      <input type="hidden" name={name} value={value} />

      <div className="image-picker-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", minWidth: 0 }}>
        <span style={{ fontSize: "12.5px", fontWeight: 600, color: "#cbd5e1" }}>{label}</span>
        <div className="image-picker-mode-toggle" style={{ display: "inline-flex", background: "rgba(255, 255, 255, 0.06)", borderRadius: 6, padding: 2, flexShrink: 0 }}>
          <button
            type="button"
            onClick={() => setMode("upload")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              padding: "3px 8px",
              borderRadius: 5,
              fontSize: 11,
              fontWeight: 600,
              cursor: "pointer",
              border: 0,
              background: mode === "upload" ? "#8529f4" : "transparent",
              color: mode === "upload" ? "#ffffff" : "#94a3b8",
            }}
          >
            <Upload size={11} /> Choose file
          </button>
          <button
            type="button"
            onClick={() => setMode("url")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              padding: "3px 8px",
              borderRadius: 5,
              fontSize: 11,
              fontWeight: 600,
              cursor: "pointer",
              border: 0,
              background: mode === "url" ? "#8529f4" : "transparent",
              color: mode === "url" ? "#ffffff" : "#94a3b8",
            }}
          >
            <LinkIcon size={11} /> Image Link
          </button>
        </div>
      </div>

      {/* Input Mode: Local Laptop File Upload */}
      {mode === "upload" && (
        <div
          className="image-picker-upload-box"
          style={{
            border: "1px dashed rgba(255, 255, 255, 0.16)",
            borderRadius: 10,
            padding: "12px",
            background: "#070b24",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            minWidth: 0,
            boxSizing: "border-box",
          }}
        >
          <div className="image-picker-upload-copy" style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, flex: 1 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: "rgba(133, 41, 244, 0.18)",
                color: "#c084fc",
                display: "grid",
                placeItems: "center",
                flexShrink: 0,
              }}
            >
              {uploading ? <Loader2 size={18} className="spin" /> : <Upload size={18} />}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <span style={{ display: "block", fontSize: 12, color: value ? "#34d399" : "#cbd5e1", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {uploading
                  ? `Uploading ${fileName}...`
                  : value
                  ? fileName || "Image ready"
                  : "Choose image from this laptop"}
              </span>
              <span style={{ display: "block", fontSize: 10.5, color: "#64748b" }}>
                PNG, JPG, WebP, GIF up to 10MB
              </span>
            </div>
          </div>

          <label
            className="image-picker-browse-button"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 14px",
              borderRadius: 8,
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.14)",
              color: "#ffffff",
              fontSize: 12,
              fontWeight: 600,
              cursor: uploading ? "wait" : "pointer",
              flexShrink: 0,
            }}
          >
            <span>{value ? "Change file" : "Browse laptop"}</span>
            <input
              type="file"
              accept="image/*"
              disabled={uploading}
              onChange={handleFileUpload}
              style={{ display: "none" }}
            />
          </label>
        </div>
      )}

      {/* Input Mode: Web URL Link */}
      {mode === "url" && (
        <div style={{ position: "relative", width: "100%", minWidth: 0, boxSizing: "border-box" }}>
          <input
            type="text"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setFileName("");
              setError("");
            }}
            placeholder="Paste web image link: https://... or /uploads/..."
            style={{
              width: "100%",
              boxSizing: "border-box",
              height: 42,
              borderRadius: 10,
              background: "#070b24",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              color: "#ffffff",
              padding: "0 36px 0 12px",
              fontSize: 13,
            }}
          />
          {value && (
            <button
              type="button"
              onClick={handleClear}
              style={{
                position: "absolute",
                right: 8,
                top: "50%",
                transform: "translateY(-50%)",
                background: "transparent",
                border: 0,
                color: "#94a3b8",
                cursor: "pointer",
                padding: 4,
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>
      )}

      {error && <span style={{ color: "#f87171", fontSize: 11.5 }}>{error}</span>}
      {helperText && !error && <span style={{ color: "#64748b", fontSize: 11 }}>{helperText}</span>}

      {/* Live Image Preview */}
      {value && (
        <div
          style={{
            marginTop: 4,
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "8px 12px",
            background: "rgba(0, 0, 0, 0.25)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: 8,
            minWidth: 0,
            maxWidth: "100%",
            boxSizing: "border-box",
            overflow: "hidden",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Preview"
            style={{
              width: 52,
              height: 38,
              borderRadius: 6,
              objectFit: "cover",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              background: "#000",
              flexShrink: 0,
            }}
            onError={(e) => {
              (e.target as HTMLElement).style.display = "none";
            }}
          />
          <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
            <span style={{ display: "block", fontSize: 11.5, color: "#e2e8f0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {value}
            </span>
            <span style={{ fontSize: 10.5, color: "#34d399", display: "inline-flex", alignItems: "center", gap: 3 }}>
              <Check size={11} /> Image active
            </span>
          </div>
          <button
            type="button"
            onClick={handleClear}
            style={{
              padding: "4px 8px",
              borderRadius: 6,
              background: "rgba(239, 68, 68, 0.15)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              color: "#f87171",
              fontSize: 11,
              fontWeight: 600,
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            Remove
          </button>
        </div>
      )}
    </div>
  );
}

