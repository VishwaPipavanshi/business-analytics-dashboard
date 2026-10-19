import { useMemo } from "react";
import OrderProgressMeter from "../components/charts/OrderProgressMeter.jsx";
import DataTable from "../components/common/DataTable.jsx";
import { getPaymentStatusBreakdown } from "../services/paymentService.js";
import { formatCurrency } from "../utils/formatUtils.js";
import { formatDisplayDate } from "../utils/dateUtils.js";

export default function OperationsSection({
  orders = [],
  payments = [],
  onSelectRecord,
}) {
  const paymentStats = useMemo(
    () => getPaymentStatusBreakdown(payments),
    [payments]
  );

  const paymentColumns = [
    { key: "id", label: "Invoice ID", width: "95px" },
    { key: "orderId", label: "Order Ref", width: "95px" },
    {
      key: "amount",
      label: "Billed Total",
      render: (val) => formatCurrency(val),
    },
    {
      key: "collected",
      label: "Collected",
      render: (val) => (
        <span className="text-success font-semibold">{formatCurrency(val)}</span>
      ),
    },
    {
      key: "outstanding",
      label: "Outstanding",
      render: (val) => (
        <span className={val > 0 ? "text-danger font-semibold" : "text-muted"}>
          {formatCurrency(val)}
        </span>
      ),
    },
    {
      key: "dueDate",
      label: "Due Date",
      render: (val) => formatDisplayDate(val),
    },
    {
      key: "status",
      label: "Status",
      render: (val) => {
        const badgeMap = {
          paid: "badge--success",
          partial: "badge--primary",
          pending: "badge--warning",
          overdue: "badge--danger",
        };
        return <span className={`badge ${badgeMap[val] || "badge--neutral"}`}>{val}</span>;
      },
    },
  ];

  const orderColumns = [
    { key: "id", label: "Order ID", width: "95px" },
    { key: "dealId", label: "Deal Ref", width: "95px" },
    { key: "service", label: "Service Fulfillment" },
    {
      key: "amount",
      label: "Value",
      render: (val) => formatCurrency(val),
    },
    {
      key: "dueDate",
      label: "Delivery Due",
      render: (val) => formatDisplayDate(val),
    },
    {
      key: "status",
      label: "Status",
      render: (val) => {
        const badgeMap = {
          completed: "badge--success",
          in_progress: "badge--primary",
          pending: "badge--warning",
          cancelled: "badge--danger",
        };
        return <span className={`badge ${badgeMap[val] || "badge--neutral"}`}>{val}</span>;
      },
    },
  ];

  return (
    <div className="operations-section">
      <div className="analytics-grid mb-4">
        <div className="card col-5">
          <OrderProgressMeter orders={orders} />
        </div>

        {/* Financial Realization Summary Card */}
        <div className="card col-7">
          <div className="chart-card-header">
            <div>
              <h4 className="chart-card-title">Billing & Collections Realization</h4>
              <span className="chart-card-subtitle">
                Cash collection efficiency: <strong>{paymentStats.collectionEfficiency}%</strong>
              </span>
            </div>
          </div>

          <div className="conversion-stats-grid">
            <div className="conversion-stat-box">
              <span className="conversion-stat-label">Total Invoiced</span>
              <strong className="text-base font-semibold">
                {formatCurrency(paymentStats.totalBilled)}
              </strong>
              <span className="conversion-stat-sub">{payments.length} invoices issued</span>
            </div>

            <div className="conversion-stat-box">
              <span className="conversion-stat-label">Total Realized</span>
              <strong className="text-base text-success font-semibold">
                {formatCurrency(paymentStats.totalCollected)}
              </strong>
              <span className="conversion-stat-sub text-success">
                {paymentStats.collectionEfficiency}% realized
              </span>
            </div>

            <div className="conversion-stat-box">
              <span className="conversion-stat-label">Pending Exposure</span>
              <strong className="text-base text-danger font-semibold">
                {formatCurrency(paymentStats.totalOutstanding)}
              </strong>
              <span className="conversion-stat-sub text-danger">Requires follow-up</span>
            </div>
          </div>

          <div className="quotation-status-footer mt-4">
            {paymentStats.list.map((item) => (
              <div key={item.key} className="quotation-status-pill">
                <span
                  className="quotation-status-dot"
                  style={{ backgroundColor: item.color }}
                />
                <span className="capitalize">{item.label}:</span>
                <strong>{item.count}</strong>
                <span className="text-muted">({formatCurrency(item.amount, true)})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="analytics-grid mb-4">
        {/* Orders Table */}
        <div className="card col-6">
          <DataTable
            title="Service Delivery & Orders"
            columns={orderColumns}
            data={orders}
            searchPlaceholder="Filter delivery orders..."
            searchKeys={["id", "service", "status"]}
            pageSize={5}
            onRowClick={(order) => onSelectRecord(order, "order")}
          />
        </div>

        {/* Invoices & Payments Table */}
        <div className="card col-6">
          <DataTable
            title="Payment History & Accounts Receivable"
            columns={paymentColumns}
            data={payments}
            searchPlaceholder="Filter payments & invoices..."
            searchKeys={["id", "orderId", "status"]}
            pageSize={5}
            onRowClick={(pmt) => onSelectRecord(pmt, "payment")}
          />
        </div>
      </div>
    </div>
  );
}
