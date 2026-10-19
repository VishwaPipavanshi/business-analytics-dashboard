import { useState, useRef, useEffect } from "react";
import {
  Calendar,
  Download,
  Users,
  Building,
  RotateCcw,
  ChevronDown,
  FileSpreadsheet,
} from "lucide-react";
import { useDashboardContext } from "../../context/DashboardContext.jsx";
import { users, departments } from "../../data/dummyData.js";
import "./FilterBar.scss";

const PRESETS = [
  { key: "today",  label: "Today" },
  { key: "7days",  label: "Last 7 Days" },
  { key: "30days", label: "Last 30 Days" },
  { key: "custom", label: "Custom" },
];

export default function FilterBar({
  onExportSummary,
  onExportLeads,
  onExportDeals,
  onExportPayments,
}) {
  const {
    preset, setPreset,
    customStart, setCustomStart,
    customEnd, setCustomEnd,
    userId, setUserId,
    department, setDepartment,
    resetFilters,
    activeFiltersCount,
  } = useDashboardContext();

  const [exportOpen, setExportOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close export dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setExportOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="filter-bar" id="filter-bar">
      {/* Date Presets */}
      <div className="filter-bar__group">
        <Calendar size={14} className="filter-bar__group-icon" />
        <div className="filter-bar__presets" role="group" aria-label="Date range presets">
          {PRESETS.map((p) => (
            <button
              key={p.key}
              id={`preset-${p.key}`}
              type="button"
              className={`btn btn--ghost filter-bar__preset${preset === p.key ? " btn--active" : ""}`}
              onClick={() => setPreset(p.key)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom date inputs */}
      {preset === "custom" && (
        <div className="filter-bar__custom" id="filter-custom-container">
          <input
            id="filter-custom-start"
            type="date"
            className="filter-bar__date-input"
            value={customStart}
            onChange={(e) => setCustomStart(e.target.value)}
            aria-label="Start date"
          />
          <span className="filter-bar__date-sep">→</span>
          <input
            id="filter-custom-end"
            type="date"
            className="filter-bar__date-input"
            value={customEnd}
            onChange={(e) => setCustomEnd(e.target.value)}
            aria-label="End date"
          />
        </div>
      )}

      <div className="filter-bar__spacer" />

      {/* User Filter */}
      <div className="filter-bar__select-wrap">
        <Users size={13} />
        <select
          id="filter-user"
          className="filter-bar__select"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          aria-label="Filter by user"
        >
          <option value="all">All Users</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>{u.name}</option>
          ))}
        </select>
      </div>

      {/* Department Filter */}
      <div className="filter-bar__select-wrap">
        <Building size={13} />
        <select
          id="filter-department"
          className="filter-bar__select"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          aria-label="Filter by department"
        >
          <option value="all">All Departments</option>
          {departments.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      {/* Reset button (visible when non-default filter active) */}
      {activeFiltersCount > 0 && (
        <button
          id="btn-reset-filters"
          type="button"
          className="btn btn--ghost filter-bar__preset"
          onClick={resetFilters}
          title="Reset to default filters"
          aria-label="Reset filters"
        >
          <RotateCcw size={12} />
          Reset
        </button>
      )}

      {/* Export Dropdown */}
      <div className="filter-bar__export-wrap" ref={dropdownRef}>
        <button
          id="btn-export-csv"
          type="button"
          className="btn btn--primary"
          onClick={() => setExportOpen((prev) => !prev)}
          aria-expanded={exportOpen}
          aria-haspopup="true"
          aria-label="Export data options"
        >
          <Download size={13} />
          Export CSV
          <ChevronDown size={12} />
        </button>

        {exportOpen && (
          <div className="filter-bar__export-menu" role="menu">
            <button
              className="filter-bar__export-item"
              role="menuitem"
              onClick={() => {
                onExportSummary && onExportSummary();
                setExportOpen(false);
              }}
            >
              <FileSpreadsheet size={13} />
              KPI Summary Overview
            </button>
            <button
              className="filter-bar__export-item"
              role="menuitem"
              onClick={() => {
                onExportLeads && onExportLeads();
                setExportOpen(false);
              }}
            >
              <FileSpreadsheet size={13} />
              Filtered Leads Data
            </button>
            <button
              className="filter-bar__export-item"
              role="menuitem"
              onClick={() => {
                onExportDeals && onExportDeals();
                setExportOpen(false);
              }}
            >
              <FileSpreadsheet size={13} />
              Deals & Revenue Ledger
            </button>
            <button
              className="filter-bar__export-item"
              role="menuitem"
              onClick={() => {
                onExportPayments && onExportPayments();
                setExportOpen(false);
              }}
            >
              <FileSpreadsheet size={13} />
              Payments & Invoices Data
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
