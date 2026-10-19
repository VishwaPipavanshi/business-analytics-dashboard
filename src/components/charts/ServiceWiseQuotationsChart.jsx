import { useMemo } from "react";
import { formatCurrency } from "../../utils/formatUtils.js";
import "./Charts.scss";

const COLORS = ["#2563eb", "#06b6d4", "#10b981", "#f59e0b", "#f97316", "#8b5cf6"];

export default function ServiceWiseQuotationsChart({ quotations = [] }) {
  const data = useMemo(() => {
    const byService = new Map();
    quotations.forEach((quotation) => {
      const service = quotation.service || "Other";
      byService.set(service, (byService.get(service) || 0) + (quotation.amount || 0));
    });
    const rows = Array.from(byService, ([service, amount]) => ({ service, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 6);
    const totalAmount = rows.reduce((sum, row) => sum + row.amount, 0);
    const maxAmount = rows[0]?.amount || 0;

    return rows.map((row, index) => ({
      ...row,
      color: COLORS[index % COLORS.length],
      width: maxAmount ? (row.amount / maxAmount) * 100 : 0,
      percentage: totalAmount ? (row.amount / totalAmount) * 100 : 0,
    }));
  }, [quotations]);

  return (
    <div className="service-quotations-card">
      <div className="chart-card-header">
        <div>
          <h4 className="chart-card-title">Quotation Value by Service</h4>
        </div>
      </div>
      {data.length === 0 ? (
        <div className="chart-empty-state">No quotation data recorded in this period.</div>
      ) : (
        <div className="quotation-funnel">
          {data.map((row) => (
            <div className="quotation-funnel__row" key={row.service}>
              <div className="quotation-funnel__shape-wrap">
                <span
                  className="quotation-funnel__shape"
                  style={{ width: `${Math.max(row.width, 16)}%`, backgroundColor: row.color }}
                  title={`${row.service}: ${formatCurrency(row.amount)}`}
                />
              </div>
              <span className="quotation-funnel__service" title={row.service}>{row.service}</span>
              <strong className="quotation-funnel__amount">{formatCurrency(row.amount)}</strong>
              <small className="quotation-funnel__share">{row.percentage.toFixed(0)}%</small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
