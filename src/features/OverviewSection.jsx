import { useMemo } from "react";
import DailyLeadTrendChart from "../components/charts/DailyLeadTrendChart.jsx";
import RevenueByCategoryChart from "../components/charts/RevenueByCategoryChart.jsx";
import LeadFunnelChart from "../components/charts/LeadFunnelChart.jsx";
import QuoteToDealConversion from "../components/charts/QuoteToDealConversion.jsx";
import CollectionsTrendChart from "../components/charts/CollectionsTrendChart.jsx";
import DataTable from "../components/common/DataTable.jsx";
import { getLeadFunnelMetrics, getDailyLeadTrend } from "../services/leadService.js";
import { getRecentCrmActivity } from "../services/activityService.js";
import { formatCurrency } from "../utils/formatUtils.js";
import { formatDisplayDate } from "../utils/dateUtils.js";
import { Activity, Clock } from "lucide-react";

export default function OverviewSection({
  leads = [],
  quotations = [],
  deals = [],
  orders = [],
  payments = [],
  onSelectRecord,
}) {
  const funnelData = useMemo(() => getLeadFunnelMetrics(leads), [leads]);
  const trendData = useMemo(() => getDailyLeadTrend(leads), [leads]);
  const activityStream = useMemo(
    () => getRecentCrmActivity({ leads, quotations, deals, payments }).slice(0, 5),
    [leads, quotations, deals, payments]
  );

  const topDealsColumns = [
    { key: "id", label: "Deal ID", width: "90px" },
    { key: "service", label: "Service Sold" },
    {
      key: "value",
      label: "Value",
      render: (val) => formatCurrency(val),
    },
    {
      key: "priority",
      label: "Priority",
      render: (val) => {
        const colorMap = {
          high: "badge--danger",
          medium: "badge--warning",
          low: "badge--primary",
        };
        return (
          <span className={`badge ${colorMap[val] || "badge--neutral"} uppercase font-semibold`}>
            {val}
          </span>
        );
      },
    },
    {
      key: "status",
      label: "Status",
      render: (val) => {
        const badgeMap = {
          won: "badge--success",
          open: "badge--warning",
          lost: "badge--danger",
        };
        return <span className={`badge ${badgeMap[val] || "badge--neutral"}`}>{val}</span>;
      },
    },
    {
      key: "createdAt",
      label: "Date",
      render: (val) => formatDisplayDate(val),
    },
  ];

  return (
    <div className="overview-section">
      {/* Top Charts Row: Velocity & Revenue */}
      <div className="analytics-grid mb-4">
        <div className="card col-6">
          <DailyLeadTrendChart data={trendData} />
        </div>
        <div className="card col-6">
          <RevenueByCategoryChart deals={deals} />
        </div>
      </div>

      {/* Middle Charts Row: Funnel, Conversion, Collections */}
      <div className="analytics-grid mb-4">
        <div className="card col-4">
          <LeadFunnelChart funnelData={funnelData} />
        </div>
        <div className="card col-4">
          <QuoteToDealConversion quotes={quotations} deals={deals} />
        </div>
        <div className="card col-4">
          <CollectionsTrendChart deals={deals} payments={payments} />
        </div>
      </div>

      {/* Bottom Row: Active Deals Ledger & CRM Live Feed */}
      <div className="analytics-grid mb-4">
        <div className="card col-7">
          <DataTable
            title="Recent Pipeline & Won Deals"
            columns={topDealsColumns}
            data={deals}
            searchPlaceholder="Search pipeline deals..."
            searchKeys={["id", "service", "status", "priority"]}
            pageSize={4}
            onRowClick={(deal) => onSelectRecord && onSelectRecord(deal, "deal")}
          />
        </div>

        <div className="card col-5">
          <div className="chart-card-header mb-3">
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-primary" />
              <div>
                <h4 className="chart-card-title">Live CRM Activity</h4>
                <span className="chart-card-subtitle">Real-time audit log</span>
              </div>
            </div>
            <span className="badge badge--neutral text-xs">{activityStream.length} Events</span>
          </div>

          <div className="crm-activity-feed" style={{ maxHeight: 270, overflowY: "auto" }}>
            {activityStream.length === 0 ? (
              <div className="text-center py-6 text-muted text-xs">
                No recent activity recorded.
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
    </div>
  );
}
