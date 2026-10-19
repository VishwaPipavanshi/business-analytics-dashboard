import { useMemo } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { formatCurrency, formatServiceChartLabel } from "../../utils/formatUtils.js";
import "./Charts.scss";

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip__title">{payload[0].payload.service}</div>
      {payload.map((item) => (
        <div key={item.dataKey} className="chart-tooltip__row">
          <span className="chart-tooltip__dot" style={{ background: item.color }} />
          <span className="chart-tooltip__label">{item.name}:</span>
          <span className="chart-tooltip__value">
            {item.dataKey === "revenue" ? formatCurrency(item.value) : item.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function DealsByServiceChart({ deals = [] }) {
  const data = useMemo(() => {
    const map = new Map();
    deals.forEach((deal) => {
      const service = deal.service || "Other";
      if (!map.has(service)) {
        map.set(service, { service, count: 0, revenue: 0 });
      }
      const item = map.get(service);
      item.count += 1;
      if (deal.status === "won") item.revenue += deal.value || 0;
    });

    return Array.from(map.values())
      .sort((a, b) => b.revenue - a.revenue || b.count - a.count)
      .slice(0, 6);
  }, [deals]);

  return (
    <div className="deals-service-card">
      <div className="chart-card-header">
        <div>
          <h4 className="chart-card-title">Deals Created vs Deal Revenue (by Service)</h4>
        </div>
      </div>

      <div className="chart-container-wrap deals-service-chart">
        {data.length === 0 ? (
          <div className="chart-empty-state">No won deals recorded in this period.</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={data}
              margin={{ top: 8, right: 0, left: -18, bottom: 2 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="service"
                tick={{ fontSize: 9, fill: "#64748b" }}
                tickFormatter={formatServiceChartLabel}
                axisLine={false}
                tickLine={false}
                interval={0}
                angle={-25}
                textAnchor="end"
                height={46}
                tickMargin={5}
              />
              <YAxis
                yAxisId="deals"
                allowDecimals={false}
                tick={{ fontSize: 9, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                yAxisId="revenue"
                orientation="right"
                tick={{ fontSize: 9, fill: "#94a3b8" }}
                tickFormatter={(value) => formatCurrency(value, true)}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar yAxisId="deals" dataKey="count" name="Deals Created" fill="#2563eb" radius={[3, 3, 0, 0]} maxBarSize={24} />
              <Bar yAxisId="revenue" dataKey="revenue" name="Deal Revenue (won)" fill="#f59e0b" radius={[3, 3, 0, 0]} maxBarSize={24} />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
