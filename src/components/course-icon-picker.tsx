"use client";

import { useState } from "react";
import { COURSE_ICON_OPTIONS } from "@/lib/course-icons";

export function CourseIconPicker({ defaultValue = "Code2" }: { defaultValue?: string }) {
  const [selected, setSelected] = useState(defaultValue);
  const [query, setQuery] = useState("");

  const normalizedQuery = query
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
  const matchingIcons = COURSE_ICON_OPTIONS.filter(({ value, label, keywords }) => {
    if (!normalizedQuery) return true;

    const searchableText = [value, label, ...keywords]
      .join(" ")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "");

    return searchableText.includes(normalizedQuery);
  });

  return (
    <div className="course-icon-picker">
      <input type="hidden" name="icon" value={selected} />
      <label className="sr-only" htmlFor="course-icon-search">
        Search technology icons
      </label>
      <input
        id="course-icon-search"
        className="course-icon-search"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search icons: MongoDB, Kafka, React, networking..."
        autoComplete="off"
      />
      <div className="course-icon-options" role="listbox" aria-label="Course icon options">
        {matchingIcons.map(({ value, label, Icon }) => (
          <button
            key={`${value}-${label}`}
            type="button"
            className={`course-icon-option${selected === value ? " selected" : ""}`}
            onClick={() => setSelected(value)}
            role="option"
            aria-selected={selected === value}
            aria-label={`Use ${label} icon`}
            title={`Use ${label} icon`}
          >
            <Icon aria-hidden="true" size={20} strokeWidth={1.9} />
          </button>
        ))}
        {matchingIcons.length === 0 ? (
          <p className="course-icon-empty">No matching icon. Try “database”, “cloud”, or “code”.</p>
        ) : null}
      </div>
    </div>
  );
}
