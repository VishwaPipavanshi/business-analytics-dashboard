import { useMemo } from "react";
import { formatCurrency } from "../../utils/formatUtils.js";
import "../charts/Charts.scss";

export default function RevenueByCategoryChart({ deals = [] }) {
  const data = useMemo(() => {
    const byService = new Map();
    deals
      .filter((deal) => deal.status === "won")
      .forEach((deal) => {
        const service = deal.service || "Other";
        byService.set(service, (byService.get(service) || 0) + (deal.value || 0));
      });

    const rows = Array.from(byService, ([service, revenue]) => ({ service, revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6);
    const total = rows.reduce((sum, row) => sum + row.revenue, 0);
    const maxRevenue = rows[0]?.revenue || 0;

    return rows.map((row) => ({
      ...row,
      barWidth: maxRevenue ? (row.revenue / maxRevenue) * 100 : 0,
      percentage: total ? (row.revenue / total) * 100 : 0,
    }));
  }, [deals]);

  return (
    <div className="chart-card revenue-category-card">
      <div className="chart-card-header">
        <h4 className="chart-card-title">Revenue by Order / Service Category</h4>
      </div>
      {data.length === 0 ? (
        <div className="chart-empty-state">No won-deal revenue for this selection.</div>
      ) : (
        <div className="revenue-category-list">
          {data.map((row) => (
            <div className="revenue-category-row" key={row.service}>
              <span className="revenue-category-name" title={row.service}>{row.service}</span>
              <span className="revenue-category-track">
                <span style={{ width: `${row.barWidth}%` }} />
              </span>
              <strong className="revenue-category-amount">{formatCurrency(row.revenue, true)}</strong>
              <small className="revenue-category-share">{row.percentage.toFixed(1)}%</small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
