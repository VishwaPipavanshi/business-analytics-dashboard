import { useMemo } from "react";
import OrderProgressMeter from "../components/charts/OrderProgressMeter.jsx";
import DashboardPanel from "../components/common/DashboardPanel.jsx";
import { users } from "../data/dummyData.js";
import { getRecentCrmActivity } from "../services/activityService.js";
import { formatCurrency, formatPercent } from "../utils/formatUtils.js";
import "./TeamPerformanceSection.scss";

function CompactTable({ columns, rows, onRowClick, emptyMessage }) {
  return (
    <div className="dashboard-table-scroll">
      <table className="dashboard-detail-table dashboard-team-table">
        <thead>
          <tr>{columns.map((column) => <th key={column.key}>{column.label}</th>)}</tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td className="dashboard-table-empty" colSpan={columns.length}>{emptyMessage}</td>
            </tr>
          ) : rows.map((row) => (
            <tr
              key={row.id}
              className={onRowClick ? "dashboard-table-row--clickable" : ""}
              onClick={onRowClick ? (event) => {
                event.stopPropagation();
                onRowClick(row);
              } : undefined}
              onKeyDown={onRowClick ? (event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  event.stopPropagation();
                  onRowClick(row);
                }
              } : undefined}
              role={onRowClick ? "button" : undefined}
              tabIndex={onRowClick ? 0 : undefined}
            >
              {columns.map((column) => (
                <td key={column.key}>{column.render ? column.render(row) : row[column.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function OperationsTeamSection({
  leads = [],
  quotations = [],
  deals = [],
  orders = [],
  payments = [],
  onSelectRecord,
  onExpand,
  expandedPanel,
  closingPanel,
}) {
  const salesTeamData = useMemo(() => users
    .filter((user) => user.department === "Sales" || user.department === "Marketing")
    .map((user) => {
      const userLeads = leads.filter((lead) => lead.ownerId === user.id);
      const userDeals = deals.filter((deal) => deal.ownerId === user.id);
      const userQuotations = quotations.filter((quote) => quote.ownerId === user.id);
      const wonDeals = userDeals.filter((deal) => deal.status === "won");

      return {
        id: user.id,
        name: user.name,
        leadsHandled: userLeads.length,
        qualified: userLeads.filter((lead) => lead.status === "qualified").length,
        converted: userLeads.filter((lead) => lead.status === "converted").length,
        conversionRate: userLeads.length
          ? (userLeads.filter((lead) => lead.status === "converted").length / userLeads.length) * 100
          : 0,
        quotations: userQuotations.length,
        deals: userDeals.length,
        dealValue: userDeals.reduce((sum, deal) => sum + (deal.value || 0), 0),
        revenue: wonDeals.reduce((sum, deal) => sum + (deal.value || 0), 0),
      };
    })
    .sort((a, b) => b.revenue - a.revenue), [leads, quotations, deals]);

  const operationsTeamData = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);

    return users
      .filter((user) => user.department === "Operations" || user.department === "Finance")
      .map((user) => {
        const userOrders = orders.filter((order) => order.ownerId === user.id);
        return {
          id: user.id,
          name: user.name,
          ordersUpdated: userOrders.length,
          stagesCompleted: userOrders.filter((order) => order.status === "completed").length,
          pendingStages: userOrders.filter((order) => order.status === "pending" || order.status === "in_progress").length,
          overdueOrders: userOrders.filter((order) =>
            order.dueDate < today && order.status !== "completed" && order.status !== "cancelled"
          ).length,
        };
      });
  }, [orders]);

  const activityStream = useMemo(
    () => getRecentCrmActivity({ leads, quotations, deals, payments }),
    [leads, quotations, deals, payments]
  );
  const userNames = useMemo(() => new Map(users.map((user) => [user.id, user.name])), []);

  const salesColumns = [
    { key: "name", label: "User" },
    { key: "leadsHandled", label: "Leads Handled" },
    { key: "qualified", label: "Qualified" },
    { key: "converted", label: "Converted" },
    { key: "conversionRate", label: "Conversion %", render: (row) => formatPercent(row.conversionRate) },
    { key: "quotations", label: "Quotes" },
    { key: "deals", label: "Deals" },
    { key: "dealValue", label: "Deal Value", render: (row) => formatCurrency(row.dealValue) },
    { key: "revenue", label: "Revenue", render: (row) => <strong>{formatCurrency(row.revenue)}</strong> },
  ];
  const operationsColumns = [
    { key: "name", label: "User" },
    { key: "ordersUpdated", label: "Orders Updated" },
    { key: "stagesCompleted", label: "Stages Completed" },
    { key: "pendingStages", label: "Pending Stages" },
    { key: "overdueOrders", label: "Overdue Orders" },
  ];
  const activityColumns = [
    { key: "formattedDate", label: "Time" },
    { key: "employee", label: "Employee" },
    { key: "action", label: "Action" },
    { key: "record", label: "Record" },
  ];
  const activityRows = activityStream.map((item) => ({
    ...item,
    employee: userNames.get(item.ownerId) || "Unassigned",
    action: item.title,
    record: item.id.replace(/^act-[a-z]+-/, ""),
  }));

  const handleActivityClick = (item) => {
    if (!onSelectRecord) return;
    const id = item.id.replace(/^act-[a-z]+-/, "");
    if (item.type === "lead" || item.type === "conversion") {
      const record = leads.find((lead) => lead.id === id);
      if (record) onSelectRecord(record, "lead");
    } else if (item.type === "quotation") {
      const record = quotations.find((quote) => quote.id === id);
      if (record) onSelectRecord(record, "quotation");
    } else if (item.type === "deal") {
      const record = deals.find((deal) => deal.id === id);
      if (record) onSelectRecord(record, "deal");
    } else if (item.type === "payment") {
      const record = payments.find((payment) => payment.id === id);
      if (record) onSelectRecord(record, "payment");
    }
  };

  return (
    <div className="operations-team-section">
      <div className="dashboard-panels dashboard-panels--operations">
        <DashboardPanel id="sales-team-activity" title="Sales Team Activity" className="dashboard-panel--table" onExpand={onExpand} expanded={expandedPanel === "sales-team-activity"} closing={closingPanel === "sales-team-activity"}>
          <h4 className="chart-card-title">Sales Team Activity</h4>
          <CompactTable
            columns={salesColumns}
            rows={salesTeamData}
            emptyMessage="No sales team records for this selection."
          />
        </DashboardPanel>
        <DashboardPanel id="operations-team-activity" title="Operations Team Activity" className="dashboard-panel--table" onExpand={onExpand} expanded={expandedPanel === "operations-team-activity"} closing={closingPanel === "operations-team-activity"}>
          <h4 className="chart-card-title">Operations Team Activity</h4>
          <CompactTable
            columns={operationsColumns}
            rows={operationsTeamData}
            emptyMessage="No operations team members found."
          />
        </DashboardPanel>
        <DashboardPanel id="order-stage-progress" title="Orders & Stage Progress" onExpand={onExpand} expanded={expandedPanel === "order-stage-progress"} closing={closingPanel === "order-stage-progress"}>
          <OrderProgressMeter orders={orders} />
        </DashboardPanel>
        <DashboardPanel id="recent-crm-activity" title="Recent CRM Activity" className="dashboard-panel--table dashboard-panel--activity-table" onExpand={onExpand} expanded={expandedPanel === "recent-crm-activity"} closing={closingPanel === "recent-crm-activity"}>
          <h4 className="chart-card-title">Recent CRM Activity</h4>
          <CompactTable
            columns={activityColumns}
            rows={activityRows}
            onRowClick={onSelectRecord ? handleActivityClick : undefined}
            emptyMessage="No recent CRM activity for this selection."
          />
        </DashboardPanel>
      </div>
    </div>
  );
}
