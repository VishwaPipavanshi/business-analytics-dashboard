import { useState, useRef, useEffect, useCallback } from "react";
import {
  BarChart3,
  Calendar,
  ChevronDown,
  Building2,
  User,
  Download,
  FileSpreadsheet,
  Bell,
  X,
  SlidersHorizontal,
} from "lucide-react";
import { useDashboardContext } from "../../context/DashboardContext.jsx";
import { users, departments } from "../../data/dummyData.js";
import { formatDateRangeDisplay } from "../../utils/dateUtils.js";
import "./DashboardHeader.scss";

const PRESETS = [
  { key: "today",  label: "Today" },
  { key: "7days",  label: "Last 7 Days" },
  { key: "30days", label: "Last 30 Days" },
  { key: "custom", label: "Custom Range" },
];

export default function DashboardHeader({
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
    range,
  } = useDashboardContext();

  const [dateOpen, setDateOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const dateRef = useRef(null);
  const exportRef = useRef(null);
  const filterRef = useRef(null);

  // Close popovers on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dateRef.current && !dateRef.current.contains(e.target)) setDateOpen(false);
      if (exportRef.current && !exportRef.current.contains(e.target)) setExportOpen(false);
      if (filterRef.current && !filterRef.current.contains(e.target)) setMobileFilterOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handlePresetClick = useCallback((key) => {
    setPreset(key);
    if (key !== "custom") setDateOpen(false);
  }, [setPreset]);

  const rangeLabel = range ? formatDateRangeDisplay(range) : "Select Date Range";

  return (
    <header className="dash-header" id="dashboard-header">
      {/* Left: Branding */}
      <div className="dash-header__brand">
        <div className="dash-header__logo">
          <BarChart3 size={20} />
        </div>
        <div className="dash-header__brand-text">
          <h1 className="dash-header__title">Business Performance & Revenue Analytics</h1>
          <span className="dash-header__subtitle">
            Track your leads, conversions, quotations, deals, revenue and operations in real-time
          </span>
        </div>
      </div>

      {/* Right: Controls */}
      <div className="dash-header__controls">
        {/* Date Range Selector Popover */}
        <div className="dash-header__popover-wrap" ref={dateRef}>
          <button
            className="dash-header__control-btn dash-header__date-btn"
            onClick={() => setDateOpen((v) => !v)}
            aria-expanded={dateOpen}
            aria-haspopup="true"
            id="date-range-selector"
          >
            <Calendar size={14} />
            <span className="dash-header__date-label">{rangeLabel}</span>
            <ChevronDown size={12} className={`dash-header__chevron ${dateOpen ? "dash-header__chevron--open" : ""}`} />
          </button>

          {dateOpen && (
            <div className="dash-header__date-popover" role="dialog" aria-label="Date range picker">
              <div className="dash-header__date-popover-header">
                <span className="dash-header__date-popover-title">Select Date Range</span>
                <button className="dash-header__popover-close" onClick={() => setDateOpen(false)} aria-label="Close">
                  <X size={14} />
                </button>
              </div>
              <div className="dash-header__date-presets">
                {PRESETS.map((p) => (
                  <button
                    key={p.key}
                    className={`dash-header__preset-btn ${preset === p.key ? "dash-header__preset-btn--active" : ""}`}
                    onClick={() => handlePresetClick(p.key)}
                    id={`preset-${p.key}`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              {preset === "custom" && (
                <div className="dash-header__custom-dates">
                  <div className="dash-header__date-field">
                    <label className="dash-header__date-field-label">Start Date</label>
                    <input
                      type="date"
                      className="dash-header__date-input"
                      value={customStart}
                      onChange={(e) => setCustomStart(e.target.value)}
                      id="filter-custom-start"
                    />
                  </div>
                  <div className="dash-header__date-field">
                    <label className="dash-header__date-field-label">End Date</label>
                    <input
                      type="date"
                      className="dash-header__date-input"
                      value={customEnd}
                      onChange={(e) => setCustomEnd(e.target.value)}
                      id="filter-custom-end"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Desktop: Inline Department Selector */}
        <div className="dash-header__select-wrap desktop-only-filter">
          <Building2 size={14} />
          <select
            className="dash-header__select"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            id="filter-department"
            aria-label="Filter by department"
          >
            <option value="all">All Departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {/* Desktop: Inline User Selector */}
        <div className="dash-header__select-wrap desktop-only-filter">
          <User size={14} />
          <select
            className="dash-header__select"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            id="filter-user"
            aria-label="Filter by user"
          >
            <option value="all">All Users</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </div>

        {/* Mobile: Filter Popover Button */}
        <div className="dash-header__popover-wrap mobile-only-filter" ref={filterRef}>
          <button
            className={`dash-header__control-btn ${department !== "all" || userId !== "all" ? "dash-header__control-btn--active" : ""}`}
            onClick={() => setMobileFilterOpen((v) => !v)}
            aria-expanded={mobileFilterOpen}
            aria-label="Filter options"
            title="Filter by Department & User"
          >
            <SlidersHorizontal size={14} />
            <span>Filters</span>
          </button>

          {mobileFilterOpen && (
            <div className="dash-header__mobile-filters-popover" role="dialog" aria-label="Filters">
              <div className="dash-header__date-popover-header">
                <span className="dash-header__date-popover-title">Filter Dashboard</span>
                <button
                  className="dash-header__popover-close"
                  onClick={() => setMobileFilterOpen(false)}
                  aria-label="Close"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="dash-header__mobile-filter-group">
                <label className="dash-header__date-field-label">Department</label>
                <div className="dash-header__select-wrap" style={{ width: "100%" }}>
                  <Building2 size={14} />
                  <select
                    className="dash-header__select"
                    style={{ width: "100%" }}
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                  >
                    <option value="all">All Departments</option>
                    {departments.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="dash-header__mobile-filter-group" style={{ marginTop: 10 }}>
                <label className="dash-header__date-field-label">Team Member</label>
                <div className="dash-header__select-wrap" style={{ width: "100%" }}>
                  <User size={14} />
                  <select
                    className="dash-header__select"
                    style={{ width: "100%" }}
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                  >
                    <option value="all">All Users</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {(department !== "all" || userId !== "all") && (
                <button
                  className="btn btn--ghost text-xs"
                  style={{ marginTop: 12, width: "100%", justifyContent: "center" }}
                  onClick={() => {
                    setDepartment("all");
                    setUserId("all");
                  }}
                >
                  Reset Filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Export CSV Button & Menu */}
        <div className="dash-header__popover-wrap" ref={exportRef}>
          <button
            className="btn btn--primary dash-header__export-btn"
            onClick={() => setExportOpen((v) => !v)}
            aria-expanded={exportOpen}
            id="btn-export-csv"
          >
            <Download size={13} />
            <span className="export-text">Export CSV</span>
            <ChevronDown size={12} />
          </button>

          {exportOpen && (
            <div className="dash-header__export-menu" role="menu">
              {[
                { label: "KPI Summary Overview", fn: onExportSummary },
                { label: "Filtered Leads Data", fn: onExportLeads },
                { label: "Deals & Revenue Ledger", fn: onExportDeals },
                { label: "Payments & Invoices", fn: onExportPayments },
              ].map((item) => (
                <button
                  key={item.label}
                  className="dash-header__export-item"
                  role="menuitem"
                  onClick={() => { item.fn && item.fn(); setExportOpen(false); }}
                >
                  <FileSpreadsheet size={13} />
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <button
          className="dash-header__icon-btn desktop-only"
          aria-label="Notifications"
          title="Notifications"
        >
          <Bell size={16} />
          <span className="dash-header__notif-dot" />
        </button>

        {/* Avatar */}
        <div className="dash-header__avatar" aria-label="User menu">VB</div>
      </div>
    </header>
  );
}
