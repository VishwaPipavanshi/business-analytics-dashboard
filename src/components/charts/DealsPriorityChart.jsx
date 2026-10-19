import { useMemo } from "react";
import { formatCurrency } from "../../utils/formatUtils.js";
import "./Charts.scss";

const PRIORITIES = [
  { key: "high", color: "#ef4444" },
  { key: "medium", color: "#f59e0b" },
  { key: "low", color: "#10b981" },
];

export default function DealsPriorityChart({ deals = [] }) {
  const data = useMemo(
    () => PRIORITIES.map(({ key, color }) => {
      const priorityDeals = deals.filter((deal) => deal.priority === key);
      const revenue = priorityDeals.reduce((sum, deal) => sum + (deal.value || 0), 0);

      return {
        priority: key,
        color,
        count: priorityDeals.length,
        revenue,
        percentage: deals.length > 0 ? (priorityDeals.length / deals.length) * 100 : 0,
      };
    }),
    [deals]
  );

  return (
    <div className="chart-card">
      <div className="chart-card-header">
        <h4 className="chart-card-title">Priority Breakdown</h4>
      </div>
      <div className="dashboard-table-scroll">
        <table className="dashboard-detail-table dashboard-priority-table">
          <thead>
            <tr>
              <th>Priority</th>
              <th>Deals</th>
              <th>Revenue</th>
              <th>%</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.priority}>
                <td>
                  <span className="dashboard-priority-label">
                    <span style={{ backgroundColor: item.color }} />
                    {item.priority[0].toUpperCase() + item.priority.slice(1)}
                  </span>
                </td>
                <td>{item.count}</td>
                <td>{formatCurrency(item.revenue)}</td>
                <td>{item.percentage.toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
