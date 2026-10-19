import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import { formatCurrency } from "../../utils/formatUtils.js";
import "./Charts.scss";

const STATUS_COLORS = {
  accepted: "#16a34a",
  sent: "#2563eb",
  draft: "#f59e0b",
  rejected: "#ef4444",
  expired: "#94a3b8",
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  const color = STATUS_COLORS[item.payload.status] || "#64748b";
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip__title capitalize">{item.payload.status} Quotes</div>
      <div className="chart-tooltip__row">
        <span className="chart-tooltip__dot" style={{ background: color }} />
        <span className="chart-tooltip__label">Quotations:</span>
        <span className="chart-tooltip__value">{item.value}</span>
      </div>
      <div className="chart-tooltip__row">
        <span className="chart-tooltip__label">Total Value:</span>
        <span className="chart-tooltip__value">{formatCurrency(item.payload.amount)}</span>
      </div>
    </div>
  );
};

export default function QuotationStatusChart({ statusData = [] }) {
  return (
    <div className="quotation-status-card">
      <div className="chart-card-header">
        <div>
          <h4 className="chart-card-title">Quotations by Pipeline Status</h4>
          <span className="chart-card-subtitle">Volume and monetary value</span>
        </div>
      </div>

      <div className="chart-container-wrap" style={{ height: 260, width: "100%" }}>
        {statusData.length === 0 ? (
          <div className="chart-empty-state">No quotation data for current filter.</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={statusData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="status"
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                tickFormatter={(val) => val.toUpperCase()}
                axisLine={{ stroke: "#e2e8f0" }}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" radius={[10, 10, 0, 0]} maxBarSize={45}>
                {statusData.map((entry) => (
                  <Cell
                    key={`bar-${entry.status}`}
                    fill={STATUS_COLORS[entry.status] || "#64748b"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="quotation-status-footer">
        {statusData.map((item) => (
          <div key={item.status} className="quotation-status-pill">
            <span
              className="quotation-status-dot"
              style={{ backgroundColor: STATUS_COLORS[item.status] || "#64748b" }}
            />
            <span className="capitalize">{item.status}:</span>
            <strong>{item.count}</strong>
            <span className="text-muted">({formatCurrency(item.amount, true)})</span>
          </div>
        ))}
      </div>
    </div>
  );
}
