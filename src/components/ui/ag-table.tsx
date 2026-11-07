"use client";

import { useMemo, useState, useRef, useEffect, type ReactNode } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronRight as BreadcrumbChevron,
  Download,
  Filter,
  Search,
  SlidersHorizontal,
  Columns3,
  RotateCw,
  X,
  Inbox,
  Check,
} from "lucide-react";
import { CustomSelect, type CustomSelectOption } from "./custom-select";

export type AgColumn<T> = {
  key: string;
  header: string;
  width?: string | number;
  sortable?: boolean;
  align?: "left" | "center" | "right";
  render?: (row: T, index: number) => ReactNode;
  accessor?: (row: T) => any;
};

export type DropdownFilter = {
  key: string;
  options: CustomSelectOption[];
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  icon?: ReactNode;
  width?: number | string;
};

export type StatusTab = {
  key: string;
  label: string;
  count?: number;
};

export type AgTableProps<T> = {
  columns: AgColumn<T>[];
  data: T[];
  title?: string;
  subtitle?: string;
  breadcrumbs?: string[]; // e.g. ["Admin", "Hiring", "Projects"]
  statusTabs?: StatusTab[];
  activeStatusTab?: string;
  onStatusTabChange?: (tabKey: string) => void;
  statusTabHint?: ReactNode;
  searchPlaceholder?: string;
  searchAccessor?: (row: T) => string;
  dropdownFilters?: DropdownFilter[];
  filterOptions?: CustomSelectOption[]; // backwards-compatible single filter
  filterValue?: string;
  onFilterChange?: (val: string) => void;
  filterPlaceholder?: string;
  headerActions?: ReactNode;
  initialPageSize?: number;
  pageSizeOptions?: number[];
  emptyMessage?: string;
  getRowId?: (row: T, index: number) => string;
  onRowClick?: (row: T) => void;
  className?: string;
  onRefresh?: () => void;
  exportFilename?: string;
  showExportCsv?: boolean;
  showColumnVisibility?: boolean;
};

export function AgTable<T>({
  columns,
  data,
  title,
  subtitle,
  breadcrumbs,
  statusTabs,
  activeStatusTab,
  onStatusTabChange,
  statusTabHint,
  searchPlaceholder = "Search title, company or creator...",
  searchAccessor,
  dropdownFilters,
  filterOptions,
  filterValue,
  onFilterChange,
  filterPlaceholder = "Any status",
  headerActions,
  initialPageSize = 10,
  pageSizeOptions = [10, 25, 50, 100],
  emptyMessage = "No records.",
  getRowId,
  onRowClick,
  className = "",
  onRefresh,
  exportFilename = "table-export",
  showExportCsv = true,
  showColumnVisibility = true,
}: AgTableProps<T>) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [jumpPage, setJumpPage] = useState("");
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set());
  const [showColumnsMenu, setShowColumnsMenu] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const columnsMenuRef = useRef<HTMLDivElement>(null);

  // Close column visibility popover on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (columnsMenuRef.current && !columnsMenuRef.current.contains(e.target as Node)) {
        setShowColumnsMenu(false);
      }
    }
    if (showColumnsMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showColumnsMenu]);

  // Combine single filter with multi dropdownFilters
  const allDropdownFilters: DropdownFilter[] = useMemo(() => {
    const list: DropdownFilter[] = [];
    if (dropdownFilters && dropdownFilters.length > 0) {
      list.push(...dropdownFilters);
    } else if (filterOptions && onFilterChange) {
      list.push({
        key: "default-filter",
        options: filterOptions,
        value: filterValue ?? "",
        onChange: onFilterChange,
        placeholder: filterPlaceholder,
      });
    }
    return list;
  }, [dropdownFilters, filterOptions, filterValue, onFilterChange, filterPlaceholder]);

  // Filter & sort data
  const filteredData = useMemo(() => {
    let result = data;

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((row) => {
        if (searchAccessor) {
          return searchAccessor(row).toLowerCase().includes(q);
        }
        return Object.values(row as Record<string, any>).some((val) => {
          if (val === null || val === undefined) return false;
          if (typeof val === "string" || typeof val === "number") {
            return String(val).toLowerCase().includes(q);
          }
          return false;
        });
      });
    }

    // Sorting
    if (sortBy) {
      const col = columns.find((c) => c.key === sortBy);
      if (col) {
        result = [...result].sort((a, b) => {
          const valA = col.accessor ? col.accessor(a) : (a as any)[col.key];
          const valB = col.accessor ? col.accessor(b) : (b as any)[col.key];

          if (valA === valB) return 0;
          if (valA === null || valA === undefined) return 1;
          if (valB === null || valB === undefined) return -1;

          const cmp = valA < valB ? -1 : 1;
          return sortDirection === "asc" ? cmp : -cmp;
        });
      }
    }

    return result;
  }, [data, search, searchAccessor, sortBy, sortDirection, columns]);

  // Pagination calculations
  const totalRows = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalRows);
  const pageData = filteredData.slice(startIndex, endIndex);

  const handleSort = (key: string) => {
    if (sortBy === key) {
      if (sortDirection === "asc") setSortDirection("desc");
      else {
        setSortBy(null);
        setSortDirection("asc");
      }
    } else {
      setSortBy(key);
      setSortDirection("asc");
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const handleJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseInt(jumpPage, 10);
    if (!isNaN(target) && target >= 1 && target <= totalPages) {
      setPage(target);
      setJumpPage("");
    }
  };

  const toggleColumnVisibility = (key: string) => {
    setHiddenColumns((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        // Prevent hiding all columns
        if (next.size < columns.length - 1) {
          next.add(key);
        }
      }
      return next;
    });
  };

  // CSV Export
  const handleExportCsv = () => {
    if (!filteredData.length) return;
    const activeCols = columns.filter((col) => !hiddenColumns.has(col.key));
    const headerRow = activeCols.map((c) => `"${c.header.replace(/"/g, '""')}"`).join(",");
    const dataRows = filteredData.map((row) =>
      activeCols
        .map((c) => {
          const val = c.accessor ? c.accessor(row) : (row as any)[c.key];
          const str = val === null || val === undefined ? "" : String(val);
          return `"${str.replace(/"/g, '""')}"`;
        })
        .join(",")
    );
    const csvContent = [headerRow, ...dataRows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${exportFilename}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Handle Refresh Click with micro animation
  const handleRefreshClick = () => {
    if (onRefresh) {
      setIsRefreshing(true);
      onRefresh();
      setTimeout(() => setIsRefreshing(false), 600);
    }
  };

  const visibleColumns = useMemo(
    () => columns.filter((col) => !hiddenColumns.has(col.key)),
    [columns, hiddenColumns]
  );

  // Render Numbered Page Pills (e.g. 1 2 3 ... 10)
  const renderPageButtons = () => {
    const pageButtons: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pageButtons.push(i);
    } else {
      if (currentPage <= 3) {
        pageButtons.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pageButtons.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pageButtons.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }

    return pageButtons.map((p, idx) => {
      if (p === "...") {
        return (
          <span key={`ellipsis-${idx}`} className="ag-pagination-ellipsis">
            …
          </span>
        );
      }
      const pageNum = p as number;
      const isActive = pageNum === currentPage;
      return (
        <button
          key={pageNum}
          type="button"
          className={`ag-page-number-btn ${isActive ? "is-active" : ""}`}
          onClick={() => handlePageChange(pageNum)}
          aria-label={`Go to page ${pageNum}`}
          aria-current={isActive ? "page" : undefined}
        >
          {pageNum}
        </button>
      );
    });
  };

  return (
    <div className={`ag-enterprise-table-container ${className}`}>
      {/* 1. TOP BREADCRUMB & EXPORT ROW (Matches image top row) */}
      {(breadcrumbs || title || showExportCsv) && (
        <div className="ag-top-bar">
          <div className="ag-top-bar-left">
            {breadcrumbs && breadcrumbs.length > 0 ? (
              <nav className="ag-breadcrumbs-nav" aria-label="Table breadcrumbs">
                {breadcrumbs.map((crumb, idx) => {
                  const isLast = idx === breadcrumbs.length - 1;
                  return (
                    <span key={crumb} className="ag-breadcrumb-item">
                      <span className={isLast ? "ag-breadcrumb-current" : "ag-breadcrumb-parent"}>
                        {crumb}
                      </span>
                      {!isLast && <BreadcrumbChevron size={13} className="ag-breadcrumb-sep" />}
                    </span>
                  );
                })}
              </nav>
            ) : title ? (
              <div className="ag-title-wrap">
                <h3 className="ag-title-heading">{title}</h3>
                {subtitle && <p className="ag-title-sub">{subtitle}</p>}
              </div>
            ) : null}

            {/* Total pill badge */}
            <span className="ag-total-badge">
              <strong>{totalRows}</strong> total
            </span>
          </div>

          <div className="ag-top-bar-right">
            {showExportCsv && (
              <button
                type="button"
                className="ag-export-csv-btn"
                onClick={handleExportCsv}
                title="Download table data as CSV"
                disabled={totalRows === 0}
              >
                <Download size={14} className="ag-export-icon" />
                <span>Export CSV</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 2. QUICK STATUS PILLS / TAB ROW (Matches image filter pills row) */}
      {statusTabs && statusTabs.length > 0 && (
        <div className="ag-status-pills-bar">
          <div className="ag-status-pills-scroll">
            {statusTabs.map((tab) => {
              const isSelected = activeStatusTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  className={`ag-status-pill-btn ${isSelected ? "is-active" : ""}`}
                  onClick={() => onStatusTabChange && onStatusTabChange(tab.key)}
                >
                  <span className="pill-text">{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className="pill-counter">{tab.count}</span>
                  )}
                </button>
              );
            })}
          </div>

          {statusTabHint && <div className="ag-status-tab-hint">{statusTabHint}</div>}
        </div>
      )}

      {/* 3. TOOLBAR CONTROLS BAR (Matches image search + dropdown filters + columns bar) */}
      <div className="ag-controls-toolbar">
        {/* Left Controls: Search + Dropdown Filters + Extra Filters button */}
        <div className="ag-toolbar-left-group">
          {/* Search box with Q icon */}
          <div className="ag-search-field">
            <Search size={15} className="ag-search-magnifier" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder={searchPlaceholder}
              aria-label="Search records"
            />
            {search && (
              <button
                type="button"
                className="ag-search-clear"
                onClick={() => {
                  setSearch("");
                  setPage(1);
                }}
                title="Clear search"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Multiple Dropdown Filters */}
          {allDropdownFilters.map((df) => (
            <div key={df.key} className="ag-filter-dropdown-wrap" style={{ minWidth: df.width ?? 160 }}>
              <CustomSelect
                size="sm"
                options={df.options}
                value={df.value}
                onChange={(val) => {
                  df.onChange(val);
                  setPage(1);
                }}
                placeholder={df.placeholder ?? "Filter..."}
                icon={df.icon}
              />
            </div>
          ))}

          {/* Filters slider toggle button */}
          <button
            type="button"
            className="ag-tool-action-btn ag-filters-btn"
            title="Additional table filters"
          >
            <SlidersHorizontal size={14} />
            <span>Filters</span>
          </button>
        </div>

        {/* Right Controls: Columns Visibility + Refresh + Custom header actions */}
        <div className="ag-toolbar-right-group">
          {headerActions}

          {/* Columns Visibility Toggle Menu */}
          {showColumnVisibility && (
            <div className="ag-columns-popover-anchor" ref={columnsMenuRef}>
              <button
                type="button"
                className={`ag-tool-action-btn ag-columns-btn ${showColumnsMenu ? "is-open" : ""}`}
                onClick={() => setShowColumnsMenu((prev) => !prev)}
                title="Toggle visible columns"
              >
                <Columns3 size={14} />
                <span>Columns</span>
              </button>

              {showColumnsMenu && (
                <div className="ag-columns-dropdown-menu" role="menu">
                  <div className="ag-columns-menu-header">
                    <span>Show / Hide Columns</span>
                  </div>
                  <div className="ag-columns-menu-list">
                    {columns.map((col) => {
                      const isVisible = !hiddenColumns.has(col.key);
                      return (
                        <button
                          key={col.key}
                          type="button"
                          className={`ag-column-toggle-item ${isVisible ? "is-visible" : ""}`}
                          onClick={() => toggleColumnVisibility(col.key)}
                        >
                          <span className={`ag-column-check-box ${isVisible ? "checked" : ""}`}>
                            {isVisible && <Check size={12} />}
                          </span>
                          <span className="ag-column-name">{col.header}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Refresh button with reload icon */}
          {onRefresh && (
            <button
              type="button"
              className={`ag-refresh-btn ${isRefreshing ? "is-spinning" : ""}`}
              onClick={handleRefreshClick}
              title="Refresh table data"
              aria-label="Refresh table data"
            >
              <RotateCw size={14} />
            </button>
          )}
        </div>
      </div>

      {/* 4. MAIN DATA TABLE AREA */}
      <div className="ag-table-frame">
        <div className="ag-table-scroller">
          <table className="ag-data-table">
            <thead>
              <tr>
                {visibleColumns.map((col) => {
                  const isSorted = sortBy === col.key;
                  return (
                    <th
                      key={col.key}
                      style={{
                        width: col.width,
                        textAlign: col.align ?? "left",
                      }}
                      className={col.sortable !== false ? "ag-th-interactive" : ""}
                      onClick={() => col.sortable !== false && handleSort(col.key)}
                    >
                      <div
                        className="ag-th-inner"
                        style={{
                          justifyContent:
                            col.align === "center"
                              ? "center"
                              : col.align === "right"
                                ? "flex-end"
                                : "space-between",
                        }}
                      >
                        <span className="ag-th-label">{col.header}</span>
                        {col.sortable !== false && (
                          <span className="ag-th-sort-indicator">
                            {isSorted ? (
                              sortDirection === "asc" ? (
                                <ArrowUp size={13} className="ag-sort-active" />
                              ) : (
                                <ArrowDown size={13} className="ag-sort-active" />
                              )
                            ) : (
                              <ArrowUpDown size={12} className="ag-sort-idle" />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {pageData.length > 0 ? (
                pageData.map((row, idx) => {
                  const rowKey = getRowId ? getRowId(row, idx) : (row as any)._id ?? idx;
                  return (
                    <tr
                      key={rowKey}
                      onClick={() => onRowClick && onRowClick(row)}
                      className={onRowClick ? "ag-row-interactive" : ""}
                    >
                      {visibleColumns.map((col) => (
                        <td key={col.key} style={{ textAlign: col.align ?? "left" }}>
                          {col.render
                            ? col.render(row, startIndex + idx)
                            : col.accessor
                              ? col.accessor(row)
                              : (row as any)[col.key]}
                        </td>
                      ))}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={visibleColumns.length} className="ag-empty-table-cell">
                    <div className="ag-empty-illustration-box">
                      <div className="ag-empty-icon-circle">
                        <Inbox size={28} className="ag-empty-icon" />
                      </div>
                      <p className="ag-empty-primary-text">{emptyMessage}</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. FOOTER PAGINATION BAR (Exact match: Showing 0-0 of 0, Show: 10, Go to [ ] Go, << < [1] > >>) */}
      <div className="ag-pagination-footer-bar">
        {/* Left Side: Showing Range & Show per page selector */}
        <div className="ag-footer-range-group">
          <span className="ag-showing-text">
            Showing{" "}
            <strong>
              {totalRows === 0 ? "0–0" : `${startIndex + 1}–${endIndex}`}
            </strong>{" "}
            of <strong>{totalRows}</strong>
          </span>

          <div className="ag-show-per-page-wrap">
            <span className="ag-show-label">Show:</span>
            <select
              className="ag-show-select"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              aria-label="Select items per page"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right Side: Page Jump + Numbered Navigation Controls */}
        <div className="ag-footer-nav-group">
          {/* Go to [   ] [ Go ] (Page Jump feature requested) */}
          <form className="ag-page-jump-form" onSubmit={handleJumpSubmit}>
            <label htmlFor="ag-jump-input" className="ag-jump-text">
              Go to
            </label>
            <input
              id="ag-jump-input"
              type="number"
              min={1}
              max={totalPages}
              value={jumpPage}
              onChange={(e) => setJumpPage(e.target.value)}
              className="ag-jump-input"
              aria-label="Page number to jump to"
            />
            <button
              type="submit"
              className="ag-jump-button"
              disabled={!jumpPage || Number(jumpPage) < 1 || Number(jumpPage) > totalPages}
            >
              Go
            </button>
          </form>

          {/* Stepper Navigation: <<, <, [1], >, >> */}
          <div className="ag-stepper-btns">
            <button
              type="button"
              className="ag-stepper-btn"
              title="First Page"
              disabled={currentPage <= 1}
              onClick={() => handlePageChange(1)}
              aria-label="First page"
            >
              <ChevronsLeft size={14} />
            </button>

            <button
              type="button"
              className="ag-stepper-btn"
              title="Previous Page"
              disabled={currentPage <= 1}
              onClick={() => handlePageChange(currentPage - 1)}
              aria-label="Previous page"
            >
              <ChevronLeft size={14} />
            </button>

            {/* Active page number pills */}
            <div className="ag-numbered-pages-row">{renderPageButtons()}</div>

            <button
              type="button"
              className="ag-stepper-btn"
              title="Next Page"
              disabled={currentPage >= totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
              aria-label="Next page"
            >
              <ChevronRight size={14} />
            </button>

            <button
              type="button"
              className="ag-stepper-btn"
              title="Last Page"
              disabled={currentPage >= totalPages}
              onClick={() => handlePageChange(totalPages)}
              aria-label="Last page"
            >
              <ChevronsRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
