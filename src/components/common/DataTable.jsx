import { useState, useMemo } from "react";
import {
  Search,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import "./DataTable.scss";

/**
 * Reusable, accessible, searchable, and sortable data table.
 *
 * @param {object} props
 * @param {Array<object>} props.columns - [{ key, label, sortable, render, width }]
 * @param {Array<object>} props.data - Array of row objects
 * @param {string} props.searchPlaceholder - Placeholder for search input
 * @param {Array<string>} props.searchKeys - Keys to search within
 * @param {number} props.pageSize - Number of rows per page (default 8)
 * @param {function} props.onRowClick - Callback when row clicked with row object
 * @param {string} props.emptyMessage - Text when no records match
 */
export default function DataTable({
  columns = [],
  data = [],
  searchPlaceholder = "Search records...",
  searchKeys = [],
  pageSize = 8,
  onRowClick,
  emptyMessage = "No records found matching your filters.",
  title,
  actions,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc"); // "asc" | "desc"
  const [currentPage, setCurrentPage] = useState(1);

  // 1. Search Filtering
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const term = searchTerm.toLowerCase();

    return data.filter((row) => {
      if (searchKeys.length > 0) {
        return searchKeys.some((k) =>
          String(row[k] || "").toLowerCase().includes(term)
        );
      }
      return Object.values(row).some((val) =>
        String(val || "").toLowerCase().includes(term)
      );
    });
  }, [data, searchTerm, searchKeys]);

  // 2. Sorting
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;

    return [...filteredData].sort((a, b) => {
      let valA = a[sortKey];
      let valB = b[sortKey];

      // Handle nulls/undefined
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      // Number comparison
      if (typeof valA === "number" && typeof valB === "number") {
        return sortOrder === "asc" ? valA - valB : valB - valA;
      }

      // Date comparison
      const dateA = new Date(valA).getTime();
      const dateB = new Date(valB).getTime();
      if (!isNaN(dateA) && !isNaN(dateB) && typeof valA === "string" && valA.includes("-")) {
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      }

      // String comparison
      valA = String(valA).toLowerCase();
      valB = String(valB).toLowerCase();
      return sortOrder === "asc"
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    });
  }, [filteredData, sortKey, sortOrder]);

  // 3. Pagination
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const validPage = Math.min(currentPage, totalPages);
  const pagedData = useMemo(() => {
    const start = (validPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, validPage, pageSize]);

  const handleSort = (key) => {
    if (sortKey === key) {
      if (sortOrder === "asc") setSortOrder("desc");
      else {
        setSortKey(null);
        setSortOrder("asc");
      }
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  return (
    <div className="data-table-container">
      {/* Table Header controls */}
      <div className="data-table-toolbar">
        {title && <h3 className="data-table-title">{title}</h3>}

        <div className="data-table-search-wrap">
          <Search size={14} className="data-table-search-icon" />
          <input
            type="text"
            className="data-table-search-input"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            aria-label="Search records"
          />
          {searchTerm && (
            <button
              className="data-table-search-clear"
              onClick={() => setSearchTerm("")}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        {actions && <div className="data-table-actions">{actions}</div>}
      </div>

      {/* Table grid */}
      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col) => {
                const isSorted = sortKey === col.key;
                const isSortable = col.sortable !== false;

                return (
                  <th
                    key={col.key}
                    className={`data-table-th ${isSortable ? "data-table-th--sortable" : ""}`}
                    style={col.width ? { width: col.width } : undefined}
                    onClick={() => isSortable && handleSort(col.key)}
                    aria-sort={isSorted ? (sortOrder === "asc" ? "ascending" : "descending") : "none"}
                  >
                    <div className="data-table-th-content">
                      <span>{col.label}</span>
                      {isSortable && (
                        <span className="data-table-sort-icon">
                          {isSorted ? (
                            sortOrder === "asc" ? (
                              <ChevronUp size={13} />
                            ) : (
                              <ChevronDown size={13} />
                            )
                          ) : (
                            <ChevronsUpDown size={12} className="data-table-sort-muted" />
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
            {pagedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="data-table-empty">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              pagedData.map((row, idx) => (
                <tr
                  key={row.id || idx}
                  className={`data-table-row ${onRowClick ? "data-table-row--clickable" : ""}`}
                  onClick={() => onRowClick && onRowClick(row)}
                  tabIndex={onRowClick ? 0 : undefined}
                  onKeyDown={(e) => {
                    if (onRowClick && (e.key === "Enter" || e.key === " ")) {
                      e.preventDefault();
                      onRowClick(row);
                    }
                  }}
                >
                  {columns.map((col) => (
                    <td key={col.key} className="data-table-td">
                      {col.render ? col.render(row[col.key], row) : (row[col.key] ?? "—")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="data-table-footer">
        <div className="data-table-count">
          Showing{" "}
          <strong>
            {sortedData.length === 0 ? 0 : (validPage - 1) * pageSize + 1}
          </strong>{" "}
          to{" "}
          <strong>
            {Math.min(validPage * pageSize, sortedData.length)}
          </strong>{" "}
          of <strong>{sortedData.length}</strong> records
        </div>

        {totalPages > 1 && (
          <div className="data-table-pagination" role="navigation" aria-label="Pagination">
            <button
              className="data-table-page-btn"
              disabled={validPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              aria-label="Previous page"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="data-table-page-info">
              Page {validPage} of {totalPages}
            </span>
            <button
              className="data-table-page-btn"
              disabled={validPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              aria-label="Next page"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
