/**
 * Format a number as Indian Rupees (compact notation for large values).
 */
export function formatCurrency(value, compact = false) {
  if (compact) {
    if (value >= 10_00_000) return `₹${(value / 10_00_000).toFixed(1)}L`;
    if (value >= 1_00_000) return `₹${(value / 1_00_000).toFixed(1)}L`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
    return `₹${value.toLocaleString("en-IN")}`;
  }
  return `₹${value.toLocaleString("en-IN")}`;
}

/**
 * Format a percentage to one decimal place.
 */
export function formatPercent(value) {
  return `${value.toFixed(1)}%`;
}

/**
 * Format a change delta as +N.N% or -N.N%.
 */
export function formatDelta(value) {
  if (value === null || value === undefined) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

/**
 * Return "positive" | "negative" | "neutral" for coloring deltas.
 */
export function deltaDirection(value) {
  if (value === null || value === undefined) return "neutral";
  if (value > 0) return "positive";
  if (value < 0) return "negative";
  return "neutral";
}

const SERVICE_CHART_LABELS = {
  "Company Registration": "Company",
  "GST Registration": "GST Reg",
  "Income Tax Filing": "Income",
  "Trademark Registration": "Trade",
  "Accounting & Bookkeeping": "Accounts",
  "Payroll Management": "Payroll",
  "GST Return Filing": "GST Ret",
  "MSME Registration": "MSME",
  "Import Export Code": "Import",
  "Digital Signature": "Digital",
};

export function formatServiceChartLabel(service = "") {
  if (SERVICE_CHART_LABELS[service]) return SERVICE_CHART_LABELS[service];
  const firstWord = service.split(/\s+/)[0];
  return firstWord.length > 7 ? `${firstWord.slice(0, 6)}…` : firstWord;
}
