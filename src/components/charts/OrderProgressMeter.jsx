import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import "./Charts.scss";

const ORDER_STAGES = [
  { key: "pending", label: "Pending", color: "#f59e0b" },
  { key: "in_progress", label: "In Progress", color: "#2563eb" },
  { key: "completed", label: "Completed", color: "#10b981" },
  { key: "cancelled", label: "Cancelled", color: "#ef4444" },
];

export default function OrderProgressMeter({ orders = [] }) {
  const data = useMemo(() => {
    const services = new Map();
    orders.forEach((order) => {
      const service = order.service || "Other";
      if (!services.has(service)) {
        services.set(service, { service, pending: 0, in_progress: 0, completed: 0, cancelled: 0 });
      }
      if (ORDER_STAGES.some((stage) => stage.key === order.status)) {
        services.get(service)[order.status] += 1;
      }
    });

    return Array.from(services.values())
      .sort((a, b) => {
        const totalA = ORDER_STAGES.reduce((sum, stage) => sum + a[stage.key], 0);
        const totalB = ORDER_STAGES.reduce((sum, stage) => sum + b[stage.key], 0);
        return totalB - totalA || a.service.localeCompare(b.service);
      })
      .slice(0, 6);
  }, [orders]);

  return (
    <div className="order-progress-card">
      <div className="chart-card-header">
        <div>
          <h4 className="chart-card-title">Orders &amp; Stage Progress</h4>
        </div>
      </div>
      {data.length === 0 ? (
        <div className="chart-empty-state">No orders for this selection.</div>
      ) : (
        <div className="chart-container-wrap order-progress-chart">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={data}
              margin={{ top: 4, right: 10, left: 4, bottom: 4 }}
              barSize={16}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" allowDecimals={false} hide />
              <YAxis
                type="category"
                dataKey="service"
                width={94}
                tick={{ fontSize: 9, fill: "#475569" }}
                tickFormatter={(service) => service.length > 14 ? `${service.slice(0, 13)}…` : service}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip formatter={(value, name) => [value, name]} />
              <Legend wrapperStyle={{ fontSize: 9, paddingTop: 4 }} />
              {ORDER_STAGES.map((stage) => (
                <Bar
                  key={stage.key}
                  dataKey={stage.key}
                  name={stage.label}
                  stackId="orders"
                  fill={stage.color}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
