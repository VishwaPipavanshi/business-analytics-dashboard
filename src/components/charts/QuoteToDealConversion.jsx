import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import "./Charts.scss";

export default function QuoteToDealConversion({ quotes = [], deals = [] }) {
  const wonDeals = deals.filter((deal) => deal.status === "won").length;
  const totalQuotes = quotes.length;
  const conversionRate = totalQuotes > 0 ? (wonDeals / totalQuotes) * 100 : 0;
  const chartData = [
    { name: "Converted to deal", value: Math.min(conversionRate, 100), color: "#2563eb" },
    { name: "Remaining", value: Math.max(100 - conversionRate, 0), color: "#edf2f7" },
  ];

  return (
    <div className="quote-conversion-card">
      <div className="chart-card-header">
        <div>
          <h4 className="chart-card-title">Quote to Deal Conversion Rate</h4>
          <span className="chart-card-subtitle">Won deals ÷ quotations created</span>
        </div>
      </div>
      <div className="quote-conversion-chart">
        {totalQuotes === 0 ? (
          <div className="chart-empty-state">No quotations in this period.</div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius="72%"
                  outerRadius="92%"
                  startAngle={90}
                  endAngle={-270}
                  stroke="none"
                >
                  {chartData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${Number(value).toFixed(1)}%`, name]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="quote-conversion-center" aria-label={`${conversionRate.toFixed(1)} percent`}>
              <strong>{conversionRate.toFixed(1)}%</strong>
            </div>
          </>
        )}
      </div>
      <div className="quote-conversion-caption">
        <strong>{wonDeals}</strong> deals / <strong>{totalQuotes}</strong> quotations
      </div>
    </div>
  );
}
