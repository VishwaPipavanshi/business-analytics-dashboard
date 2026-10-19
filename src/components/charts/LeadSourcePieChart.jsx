import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "../charts/Charts.scss";

const COLORS = [
  "#2563eb",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#06b6d4",
  "#f97316",
  "#ef4444",
  "#6366f1",
];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip__title">{d.name}</div>
      <div className="chart-tooltip__row">
        <span className="chart-tooltip__dot" style={{ background: d.payload.color }} />
        <span className="chart-tooltip__label">Leads Count:</span>
        <span className="chart-tooltip__value">{d.value}</span>
      </div>
      {d.payload.percentage !== undefined && (
        <div className="chart-tooltip__row">
          <span className="chart-tooltip__label">Share:</span>
          <span className="chart-tooltip__value">{d.payload.percentage}%</span>
        </div>
      )}
    </div>
  );
};

export default function LeadSourcePieChart({ data = [] }) {
  const total = useMemo(() => data.reduce((s, d) => s + d.count, 0), [data]);

  const chartData = useMemo(() => {
    return data.map((d, i) => ({
      ...d,
      name: d.source || d.name || "Unknown",
      value: d.count,
      percentage: total > 0 ? ((d.count / total) * 100).toFixed(1) : 0,
      color: d.color || COLORS[i % COLORS.length],
    }));
  }, [data, total]);

  if (chartData.length === 0) {
    return (
      <div className="chart-card">
        <div className="chart-card-header">
          <h4 className="chart-card-title">Lead Sources</h4>
        </div>
        <div className="chart-empty-state">No lead source data available.</div>
      </div>
    );
  }

  return (
    <div className="chart-card lead-source-card">
      <div className="chart-card-header">
        <div>
          <h4 className="chart-card-title">Lead Sources</h4>
          <span className="chart-card-subtitle">{total} total leads by origin</span>
        </div>
      </div>

      <div className="lead-source-donut">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius="70%"
              outerRadius="92%"
              dataKey="value"
              paddingAngle={3}
              stroke="none"
            >
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="lead-source-donut__center">
          <strong>{total}</strong>
          <span>Total Leads</span>
        </div>
      </div>

      {/* Multi-Tiered Legend Layout */}
      <div className="multi-tier-legend-grid">
        {chartData.map((d) => (
          <div key={d.name} className="multi-tier-legend-row">
            <div className="multi-tier-left">
              <span
                className="multi-tier-swatch"
                style={{ backgroundColor: d.color }}
              />
              <span className="multi-tier-name">{d.name}</span>
            </div>
            <div className="multi-tier-right">
              <span className="multi-tier-pct">{d.percentage}%</span>
              <strong className="multi-tier-val">{d.value} leads</strong>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
