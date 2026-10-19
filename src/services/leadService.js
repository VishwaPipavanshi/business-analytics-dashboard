import { countBy } from "../utils/analyticsUtils.js";
import { formatDisplayDate } from "../utils/dateUtils.js";

/**
 * Lead source palette matching professional dashboard aesthetic.
 */
export const SOURCE_COLORS = {
  "Google Ads": "#3b82f6",
  "Website": "#10b981",
  "Referral": "#8b5cf6",
  "LinkedIn": "#0ea5e9",
  "Cold Call": "#f59e0b",
  "Walk-in": "#ec4899",
  "Instagram": "#f97316",
  "Facebook": "#6366f1",
  "Other": "#94a3b8",
};

/**
 * Get funnel progression metrics for given leads.
 */
export function getLeadFunnelMetrics(leads = []) {
  const total = leads.length;
  const qualified = leads.filter((l) => l.status === "qualified" || l.status === "converted").length;
  const converted = leads.filter((l) => l.status === "converted").length;
  const unqualified = leads.filter((l) => l.status === "unqualified").length;

  return [
    {
      stage: "Total Leads",
      count: total,
      percentage: 100,
      color: "#2563eb",
      description: "All incoming leads",
    },
    {
      stage: "Qualified",
      count: qualified,
      percentage: total > 0 ? Math.round((qualified / total) * 100) : 0,
      color: "#0891b2",
      description: "Meeting qualification criteria",
    },
    {
      stage: "Converted",
      count: converted,
      percentage: total > 0 ? Math.round((converted / total) * 100) : 0,
      color: "#16a34a",
      description: "Successfully converted to deals",
    },
    {
      stage: "Unqualified",
      count: unqualified,
      percentage: total > 0 ? Math.round((unqualified / total) * 100) : 0,
      color: "#ef4444",
      description: "Lost or disqualified",
    },
  ];
}

/**
 * Aggregate leads by lead source with counts, percentages, and chart colors.
 */
export function getLeadSourceMetrics(leads = []) {
  const counts = countBy(leads, "source");
  const total = leads.length;

  return Object.entries(counts)
    .map(([source, count]) => ({
      source,
      count,
      percentage: total > 0 ? Number(((count / total) * 100).toFixed(1)) : 0,
      color: SOURCE_COLORS[source] || SOURCE_COLORS.Other,
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Aggregate leads by daily trend for line or area charts.
 */
export function getDailyLeadTrend(leads = []) {
  const dateMap = new Map();

  leads.forEach((l) => {
    const d = l.createdAt;
    if (!d) return;
    if (!dateMap.has(d)) {
      dateMap.set(d, { date: d, count: 0, converted: 0, qualified: 0 });
    }
    const item = dateMap.get(d);
    item.count += 1;
    if (l.status === "converted") item.converted += 1;
    if (l.status === "qualified") item.qualified += 1;
  });

  return Array.from(dateMap.values())
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map((item) => ({
      ...item,
      displayDate: formatDisplayDate(item.date),
    }));
}