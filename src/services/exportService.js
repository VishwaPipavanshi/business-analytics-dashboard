import { formatDateRangeDisplay, formatDisplayDate } from "../utils/dateUtils.js";

/**
 * Trigger download of CSV data in the browser.
 */
export function exportToCsv(filename, headers, rows) {
  const escapeCsv = (str) => {
    if (str === null || str === undefined) return '""';
    const s = String(str).replace(/"/g, '""');
    return `"${s}"`;
  };

  const headerRow = headers.map(escapeCsv).join(",");
  const dataRows = rows.map((row) => row.map(escapeCsv).join(",")).join("\n");
  const csvContent = "\uFEFF" + headerRow + "\n" + dataRows;

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export current dashboard KPI metrics to CSV.
 */
export function exportDashboardSummary({ kpis, range, preset, userId, department }) {
  const headers = [
    "Metric",
    "Current Value",
    "Previous Value",
    "Change (%)",
    "Date Range",
    "Preset",
    "User Filter",
    "Department Filter",
    "Exported At",
  ];

  const rangeStr = formatDateRangeDisplay(range);
  const exportedAt = formatDisplayDate(new Date());

  const rows = [
    [
      "Total Leads",
      kpis.leads.value,
      kpis.leads.previousValue,
      kpis.leads.change?.label || "0%",
      rangeStr,
      preset,
      userId,
      department,
      exportedAt,
    ],
    [
      "Conversion Rate (%)",
      kpis.conversionRate.value.toFixed(1) + "%",
      kpis.conversionRate.previousValue?.toFixed(1) + "%",
      kpis.conversionRate.change?.label || "0%",
      rangeStr,
      preset,
      userId,
      department,
      exportedAt,
    ],
    [
      "Quotations",
      kpis.quotations.value,
      kpis.quotations.previousValue,
      kpis.quotations.change?.label || "0%",
      rangeStr,
      preset,
      userId,
      department,
      exportedAt,
    ],
    [
      "Quote Value (₹)",
      kpis.quoteValue.value,
      kpis.quoteValue.previousValue,
      kpis.quoteValue.change?.label || "0%",
      rangeStr,
      preset,
      userId,
      department,
      exportedAt,
    ],
    [
      "Deals Won",
      kpis.deals.value,
      kpis.deals.previousValue,
      kpis.deals.change?.label || "0%",
      rangeStr,
      preset,
      userId,
      department,
      exportedAt,
    ],
    [
      "Revenue (₹)",
      kpis.revenue.value,
      kpis.revenue.previousValue,
      kpis.revenue.change?.label || "0%",
      rangeStr,
      preset,
      userId,
      department,
      exportedAt,
    ],
    [
      "Collections (₹)",
      kpis.collections.value,
      kpis.collections.previousValue,
      kpis.collections.change?.label || "0%",
      rangeStr,
      preset,
      userId,
      department,
      exportedAt,
    ],
    [
      "Outstanding (₹)",
      kpis.outstanding.value,
      kpis.outstanding.previousValue,
      kpis.outstanding.change?.label || "0%",
      rangeStr,
      preset,
      userId,
      department,
      exportedAt,
    ],
  ];

  const filename = `dashboard-analytics-${preset}-${new Date().toISOString().slice(0, 10)}`;
  exportToCsv(filename, headers, rows);
}

/**
 * Export filtered leads to CSV.
 */
export function exportLeadsToCsv(leads = []) {
  const headers = ["Lead ID", "Contact Name", "Source", "Status", "Owner ID", "Department", "Created Date"];
  const rows = leads.map((l) => [l.id, l.name, l.source, l.status, l.ownerId, l.department, l.createdAt]);
  exportToCsv(`leads-export-${new Date().toISOString().slice(0, 10)}`, headers, rows);
}

/**
 * Export filtered deals to CSV.
 */
export function exportDealsToCsv(deals = []) {
  const headers = ["Deal ID", "Quotation ID", "Lead ID", "Service", "Value (INR)", "Status", "Priority", "Owner ID", "Department", "Closed Date"];
  const rows = deals.map((d) => [d.id, d.quotationId, d.leadId, d.service, d.value, d.status, d.priority, d.ownerId, d.department, d.closedAt || d.createdAt]);
  exportToCsv(`deals-export-${new Date().toISOString().slice(0, 10)}`, headers, rows);
}

/**
 * Export filtered payments to CSV.
 */
export function exportPaymentsToCsv(payments = []) {
  const headers = ["Invoice ID", "Order ID", "Total Amount (INR)", "Collected (INR)", "Outstanding (INR)", "Status", "Owner ID", "Department", "Paid Date", "Due Date"];
  const rows = payments.map((p) => [p.id, p.orderId, p.amount, p.collected, p.outstanding, p.status, p.ownerId, p.department, p.paidAt || "", p.dueDate || ""]);
  exportToCsv(`payments-export-${new Date().toISOString().slice(0, 10)}`, headers, rows);
}
