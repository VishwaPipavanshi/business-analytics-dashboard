import { useMemo } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import "../charts/Charts.scss";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip__title">{label}</div>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="chart-tooltip__row">
          <span className="chart-tooltip__dot" style={{ background: entry.color }} />
          <span className="chart-tooltip__label">{entry.name}:</span>
          <span className="chart-tooltip__value">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function DailyLeadTrendChart({ data = [] }) {
  const chartData = useMemo(
    () => data.map((item) => ({
      ...item,
      day: item.date
        ? new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", timeZone: "UTC" })
          .format(new Date(`${item.date}T00:00:00Z`))
        : item.label || "",
    })),
    [data]
  );

  if (chartData.length === 0) {
    return (
      <div className="chart-card">
        <div className="chart-card-header">
          <h4 className="chart-card-title">Daily Lead Trend</h4>
        </div>
        <div className="chart-empty-state">No lead data available for selected period.</div>
      </div>
    );
  }

  return (
    <div className="chart-card">
      <div className="chart-card-header">
        <div>
          <h4 className="chart-card-title">Daily Lead Trend</h4>
          <span className="chart-card-subtitle">New, qualified and converted leads by day</span>
        </div>
      </div>
      <div className="chart-container-wrap daily-lead-chart">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 10, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
              minTickGap={20}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11, paddingTop: 4 }} iconType="circle" />
            <Line
              type="monotone"
              dataKey="count"
              name="New Leads"
              stroke="#2563eb"
              strokeWidth={2}
              dot={{ r: 2.5 }}
              activeDot={{ r: 4, fill: "#2563eb", stroke: "#fff", strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="qualified"
              name="Qualified"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ r: 2.5 }}
              activeDot={{ r: 4, fill: "#10b981", stroke: "#fff", strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="converted"
              name="Converted"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={{ r: 2.5 }}
              activeDot={{ r: 4, fill: "#f59e0b", stroke: "#fff", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
