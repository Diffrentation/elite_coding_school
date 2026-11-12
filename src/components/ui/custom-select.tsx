"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";

export type CustomSelectOption = {
  value: string;
  label: string;
  badge?: string;
  color?: string;
  icon?: ReactNode;
};

export type CustomSelectProps = {
  options: CustomSelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: ReactNode;
  disabled?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "status-pill";
  ariaLabel?: string;
};

export function CustomSelect({
  options,
  value,
  onChange,
  placeholder = "Select...",
  icon,
  disabled = false,
  className = "",
  size = "md",
  variant = "default",
  ariaLabel,
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const [coords, setCoords] = useState<{
    top?: number;
    bottom?: number;
    left: number;
    minWidth: number;
    maxHeight: number;
    placement: "bottom" | "top";
  } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  const updatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const itemHeight = 44;
    const requiredHeight = options.length * itemHeight + 16;
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    // Smart direction: open UP if space below cannot fit the menu AND space above has more space,
    // or if space below is under 190px while space above has at least 190px.
    const openUp =
      (spaceBelow < requiredHeight && spaceAbove > spaceBelow) || (spaceBelow < 190 && spaceAbove >= 190);

    const minWidth = Math.max(rect.width, size === "sm" ? 175 : 220);
    let left = rect.left;
    if (left + minWidth > window.innerWidth - 16) {
      left = Math.max(16, window.innerWidth - minWidth - 16);
    }

    const availableSpace = openUp ? spaceAbove - 20 : spaceBelow - 20;
    // Ensure all items fit comfortably when possible
    const maxHeight = Math.min(requiredHeight, Math.max(180, Math.min(360, availableSpace)));

    if (openUp) {
      setCoords({
        bottom: window.innerHeight - rect.top + 6,
        left,
        minWidth,
        maxHeight,
        placement: "top",
      });
    } else {
      setCoords({
        top: rect.bottom + 6,
        left,
        minWidth,
        maxHeight,
        placement: "bottom",
      });
    }
  };

  useEffect(() => {
    if (!open) return;

    updatePosition();

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        triggerRef.current &&
        !triggerRef.current.contains(target) &&
        popoverRef.current &&
        !popoverRef.current.contains(target)
      ) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    function handleReposition() {
      updatePosition();
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, { passive: true, capture: true });

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, { capture: true });
    };
  }, [open, options.length, size]);

  const getStatusColor = (val: string) => {
    switch (val) {
      case "approved":
      case "answered":
      case "contacted":
      case "published":
        return {
          bg: "rgba(16, 185, 129, 0.15)",
          border: "rgba(16, 185, 129, 0.35)",
          text: "#34d399",
          dot: "#10b981",
        };
      case "pending":
      case "new":
        return {
          bg: "rgba(245, 158, 11, 0.15)",
          border: "rgba(245, 158, 11, 0.35)",
          text: "#fbbf24",
          dot: "#f59e0b",
        };
      case "rejected":
      case "archived":
        return {
          bg: "rgba(239, 68, 68, 0.15)",
          border: "rgba(239, 68, 68, 0.35)",
          text: "#f87171",
          dot: "#ef4444",
        };
      default:
        return {
          bg: "rgba(148, 163, 184, 0.12)",
          border: "rgba(148, 163, 184, 0.25)",
          text: "#94a3b8",
          dot: "#64748b",
        };
    }
  };

  const statusColor = variant === "status-pill" ? getStatusColor(value) : null;

  return (
    <div
      className={`custom-select-container size-${size} variant-${variant} ${open ? "is-open" : ""} ${disabled ? "is-disabled" : ""} ${className}`}
      // Custom selects are frequently rendered inside clickable table rows. Keep
      // their interaction local so opening or choosing an option never activates
      // the row's detail view behind it.
      onClick={(event) => event.stopPropagation()}
      onMouseDown={(event) => event.stopPropagation()}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!open) updatePosition();
          setOpen((prev) => !prev);
        }}
        className="custom-select-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel ?? placeholder}
        style={
          statusColor
            ? {
                background: statusColor.bg,
                borderColor: statusColor.border,
                color: statusColor.text,
              }
            : undefined
        }
      >
        <div className="trigger-content">
          {icon && <span className="trigger-icon">{icon}</span>}
          {statusColor && <span className="status-dot" style={{ background: statusColor.dot }} />}
          <span className="trigger-label">{selectedOption ? selectedOption.label : placeholder}</span>
        </div>
        <ChevronDown size={14} className={`trigger-chevron ${open ? "rotate-180" : ""}`} />
      </button>

      {mounted &&
        open &&
        coords &&
        createPortal(
          <div
            ref={popoverRef}
            className={`custom-select-popover placement-${coords.placement}`}
            role="listbox"
            onClick={(event) => event.stopPropagation()}
            onMouseDown={(event) => event.stopPropagation()}
            style={{
              position: "fixed",
              top: coords.top !== undefined ? `${coords.top}px` : undefined,
              bottom: coords.bottom !== undefined ? `${coords.bottom}px` : undefined,
              left: `${coords.left}px`,
              minWidth: `${coords.minWidth}px`,
              maxHeight: `${coords.maxHeight}px`,
              zIndex: 999999,
            }}
          >
            {options.map((opt) => {
              const isSelected = opt.value === value;
              const optStatus = variant === "status-pill" ? getStatusColor(opt.value) : null;

              return (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={`custom-select-item ${isSelected ? "is-selected" : ""}`}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                >
                  <div className="item-label-group">
                    {opt.icon && <span className="item-icon">{opt.icon}</span>}
                    {optStatus && <span className="status-dot" style={{ background: optStatus.dot }} />}
                    <span className="item-label" style={optStatus ? { color: optStatus.text } : undefined}>
                      {opt.label}
                    </span>
                    {opt.badge && <span className="item-badge">{opt.badge}</span>}
                  </div>
                  {isSelected && <Check size={14} className="item-check" />}
                </button>
              );
            })}
          </div>,
          document.body,
        )}
    </div>
  );
}
