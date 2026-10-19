import { useMemo } from "react";
import DataTable from "../components/common/DataTable.jsx";
import { users } from "../data/dummyData.js";
import { getRecentCrmActivity } from "../services/activityService.js";
import { formatCurrency, formatPercent } from "../utils/formatUtils.js";
import { Activity, Clock } from "lucide-react";
import "./TeamPerformanceSection.scss";

export default function TeamPerformanceSection({
  leads = [],
  quotations = [],
  deals = [],
  orders = [],
  payments = [],
  onSelectRecord,
}) {
  // 1. Sales Team Aggregation
  const salesTeamData = useMemo(() => {
    const salesUsers = users.filter((u) => u.department === "Sales" || u.department === "Marketing");

    return salesUsers.map((user) => {
      const userLeads = leads.filter((l) => l.ownerId === user.id);
      const userDeals = deals.filter((d) => d.ownerId === user.id);
      const wonDeals = userDeals.filter((d) => d.status === "won");
      const revenue = wonDeals.reduce((sum, d) => sum + (d.value || 0), 0);
      const convRate = userLeads.length > 0 ? (wonDeals.length / userLeads.length) * 100 : 0;

      return {
        id: user.id,
        name: user.name,
        department: user.department,
        role: user.role,
        leadsCount: userLeads.length,
        dealsWon: wonDeals.length,
        revenue,
        conversionRate: convRate,
      };
    });
  }, [leads, deals]);

  // 2. Operations Team Aggregation
  const opsTeamData = useMemo(() => {
    return users.map((user) => {
      const userOrders = orders.filter((o) => o.ownerId === user.id);
      const completed = userOrders.filter((o) => o.status === "completed").length;
      const inProgress = userOrders.filter((o) => o.status === "in_progress").length;
      const pending = userOrders.filter((o) => o.status === "pending").length;
      const completionRate = userOrders.length > 0 ? (completed / userOrders.length) * 100 : 0;

      return {
        id: user.id,
        name: user.name,
        department: user.department,
        role: user.role,
        ordersHandled: userOrders.length,
        completed,
        inProgress,
        pending,
        completionRate,
      };
    }).filter((u) => u.ordersHandled > 0 || u.department === "Operations" || u.department === "Finance");
  }, [orders]);

  // 3. Recent CRM Activity Stream
  const activityStream = useMemo(() => {
    return getRecentCrmActivity({ leads, quotations, deals, payments });
  }, [leads, quotations, deals, payments]);

  const salesColumns = [
    { key: "name", label: "Representative" },
    { key: "department", label: "Dept" },
    { key: "leadsCount", label: "Leads" },
    { key: "dealsWon", label: "Deals Won" },
    {
      key: "revenue",
      label: "Revenue Generated",
      render: (val) => (
        <span className="font-semibold text-primary">{formatCurrency(val)}</span>
      ),
    },
    {
      key: "conversionRate",
      label: "Win Rate",
      render: (val) => (
        <span className="font-semibold text-success">{formatPercent(val)}</span>
      ),
    },
  ];

  const opsColumns = [
    { key: "name", label: "Team Member" },
    { key: "department", label: "Dept" },
    { key: "ordersHandled", label: "Total Handled" },
    {
      key: "completed",
      label: "Completed",
      render: (val) => <span className="text-success font-semibold">{val}</span>,
    },
    {
      key: "pending",
      label: "Active / Pending",
      render: (val) => <span className="text-warning font-semibold">{val}</span>,
    },
    {
      key: "completionRate",
      label: "Completion %",
      render: (val) => `${val.toFixed(0)}%`,
    },
  ];

  return (
    <div className="team-performance-section">
      <div className="analytics-grid mb-4">
        {/* Sales Team Table */}
        <div className="card col-6">
          <DataTable
            title="Sales & Commercial Leaderboard"
            columns={salesColumns}
            data={salesTeamData}
            searchPlaceholder="Search representatives..."
            searchKeys={["name", "department", "role"]}
            pageSize={5}
          />
        </div>

        {/* Operations Team Table */}
        <div className="card col-6">
          <DataTable
            title="Operations & Fulfillment Team"
            columns={opsColumns}
            data={opsTeamData}
            searchPlaceholder="Search operations team..."
            searchKeys={["name", "department", "role"]}
            pageSize={5}
          />
        </div>
      </div>

      {/* Recent CRM Activity Feed */}
      <div className="card">
        <div className="chart-card-header mb-4">
          <div className="flex items-center gap-2">
            <Activity size={18} className="text-primary" />
            <div>
              <h4 className="chart-card-title">Recent CRM & Operational Activity</h4>
              <span className="chart-card-subtitle">Real-time audit log of customer interactions</span>
            </div>
          </div>
          <span className="badge badge--neutral text-xs">
            {activityStream.length} Latest Actions
          </span>
        </div>

        <div className="crm-activity-feed">
          {activityStream.length === 0 ? (
            <div className="text-center py-6 text-muted text-xs">
              No recent CRM activities recorded in current filter period.
            </div>
          ) : (
            activityStream.map((item) => {
              const handleClick = () => {
                if (!onSelectRecord) return;
                const recId = item.id.replace(/^act-[a-z]+-/, "");
                if (item.type === "lead" || item.type === "conversion") {
                  const lead = leads.find((l) => l.id === recId);
                  if (lead) onSelectRecord(lead, "lead");
                } else if (item.type === "quotation") {
                  const quote = quotations.find((q) => q.id === recId);
                  if (quote) onSelectRecord(quote, "quotation");
                } else if (item.type === "deal") {
                  const deal = deals.find((d) => d.id === recId);
                  if (deal) onSelectRecord(deal, "deal");
                } else if (item.type === "payment") {
                  const pmt = payments.find((p) => p.id === recId);
                  if (pmt) onSelectRecord(pmt, "payment");
                }
              };

              return (
                <div
                  key={item.id}
                  className={`crm-activity-item ${onSelectRecord ? "cursor-pointer hover:bg-slate-50" : ""}`}
                  onClick={handleClick}
                  role={onSelectRecord ? "button" : undefined}
                  tabIndex={onSelectRecord ? 0 : undefined}
                >
                  <div className={`crm-activity-dot crm-activity-dot--${item.badgeColor || "primary"}`} />
                  <div className="crm-activity-content">
                    <div className="crm-activity-top">
                      <strong className="crm-activity-title">{item.title}</strong>
                      <span className="crm-activity-time flex items-center gap-1">
                        <Clock size={11} /> {item.formattedDate}
                      </span>
                    </div>
                    <p className="crm-activity-desc">{item.description}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
