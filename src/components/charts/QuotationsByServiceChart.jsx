import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatServiceChartLabel } from "../../utils/formatUtils.js";
import "./Charts.scss";

export default function QuotationsByServiceChart({ quotations = [] }) {
  const data = useMemo(() => {
    const serviceCounts = new Map();

    quotations.forEach((quotation) => {
      const service = quotation.service || "Other";
      serviceCounts.set(service, (serviceCounts.get(service) || 0) + 1);
    });

    return Array.from(serviceCounts, ([service, count]) => ({ service, count }))
      .sort((a, b) => b.count - a.count || a.service.localeCompare(b.service))
      .slice(0, 7);
  }, [quotations]);

  return (
    <div className="chart-card">
      <div className="chart-card-header">
        <h4 className="chart-card-title">Quotations by Service / Order Category</h4>
      </div>
      {data.length === 0 ? (
        <div className="chart-empty-state">No quotation data for this selection.</div>
      ) : (
        <div className="chart-container-wrap quotation-count-chart">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 12, right: 8, left: -18, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="service"
                tickFormatter={formatServiceChartLabel}
                tick={{ fontSize: 9, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
                interval={0}
                angle={-25}
                textAnchor="end"
                height={46}
                tickMargin={5}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(value) => [value, "Quotations"]}
                labelFormatter={(label) => label}
              />
              <Bar dataKey="count" name="Quotations" fill="#2563eb" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
