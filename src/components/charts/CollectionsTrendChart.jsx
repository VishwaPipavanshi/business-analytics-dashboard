import { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { formatCurrency } from "../../utils/formatUtils.js";
import "./Charts.scss";

const formatDateLabel = (date) => new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
}).format(new Date(`${date}T00:00:00Z`)).replace("Sept", "Sep");

const CustomTooltip = ({ active, payload, label }) => {
  const populatedPayload = payload?.filter((entry) => entry.value != null) || [];
  if (!active || populatedPayload.length === 0) return null;
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip__title">{formatDateLabel(label)}</div>
      {populatedPayload.map((entry, i) => (
        <div key={i} className="chart-tooltip__row">
          <span className="chart-tooltip__dot" style={{ background: entry.color }} />
          <span className="chart-tooltip__label">{entry.name}:</span>
          <span className="chart-tooltip__value">{formatCurrency(entry.value)}</span>
        </div>
      ))}
    </div>
  );
};

export default function CollectionsTrendChart({ deals = [], payments = [] }) {
  const data = useMemo(() => {
    const dateMap = new Map();
    const addDate = (date) => {
      if (date && !dateMap.has(date)) {
        dateMap.set(date, { date, revenue: 0, collected: 0 });
      }
      return date ? dateMap.get(date) : null;
    };

    deals.forEach((deal) => {
      if (deal.status !== "won") return;
      const date = deal.closedAt || deal.createdAt;
      const day = addDate(date);
      if (day) day.revenue += deal.value || 0;
    });

    payments.forEach((p) => {
      const date = p.paidAt || p.createdAt;
      const day = addDate(date);
      if (day) day.collected += p.collected || 0;
    });

    return Array.from(dateMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [deals, payments]);

  return (
    <div className="collections-trend-card">
      <div className="chart-card-header">
        <div>
          <h4 className="chart-card-title">Daily Revenue Trend</h4>
        </div>
      </div>

      <div className="chart-container-wrap daily-revenue-chart">
        {data.length === 0 ? (
          <div className="chart-empty-state">No revenue or collection records for this selection.</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 8, right: 6, left: -10, bottom: 0 }}
              barCategoryGap="12%"
              barGap={1}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="date"
                interval={Math.max(0, Math.ceil(data.length / 7) - 1)}
                tick={{ fontSize: 9, fill: "#94a3b8" }}
                tickFormatter={formatDateLabel}
                axisLine={{ stroke: "#e2e8f0" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                tickFormatter={(val) => formatCurrency(val, true)}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: 11, paddingTop: 6 }}
                iconType="circle"
              />
              <Bar
                dataKey="revenue"
                name="Revenue"
                fill="#2563eb"
                radius={[2, 2, 0, 0]}
                barSize={Math.min(8, 36 / data.length)}
              />
              <Bar
                dataKey="collected"
                name="Collected"
                fill="#10b981"
                radius={[2, 2, 0, 0]}
                barSize={Math.min(8, 36 / data.length)}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
