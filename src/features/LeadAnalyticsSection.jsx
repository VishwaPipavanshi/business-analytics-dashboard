import { useMemo } from "react";
import { differenceInCalendarDays } from "date-fns";
import LeadTargetAchievement from "../components/charts/LeadTargetAchievement.jsx";
import LeadFunnelChart from "../components/charts/LeadFunnelChart.jsx";
import DailyLeadTrendChart from "../components/charts/DailyLeadTrendChart.jsx";
import LeadSourcePieChart from "../components/charts/LeadSourcePieChart.jsx";
import DashboardPanel from "../components/common/DashboardPanel.jsx";
import { useDashboardContext } from "../context/DashboardContext.jsx";
import {
  getLeadFunnelMetrics,
  getLeadSourceMetrics,
  getDailyLeadTrend,
} from "../services/leadService.js";

function getProratedRevenueTarget(range, monthlyTarget) {
  if (!range?.start || !range?.end) return monthlyTarget;

  const cursor = new Date(range.start.getFullYear(), range.start.getMonth(), 1);
  const finalMonth = new Date(range.end.getFullYear(), range.end.getMonth(), 1);
  let target = 0;

  while (cursor <= finalMonth) {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0, 23, 59, 59, 999);
    const selectedStart = Math.max(range.start.getTime(), monthStart.getTime());
    const selectedEnd = Math.min(range.end.getTime(), monthEnd.getTime());
    const selectedDays = Math.max(
      0,
      differenceInCalendarDays(new Date(selectedEnd), new Date(selectedStart)) + 1
    );

    target += monthlyTarget * selectedDays / daysInMonth;
    cursor.setMonth(cursor.getMonth() + 1);
  }

  return Math.round(target);
}

export default function LeadAnalyticsSection({
  leads = [],
  deals = [],
  onExpand,
  expandedPanel,
  closingPanel,
}) {
  const { range } = useDashboardContext();
  const funnelData = useMemo(() => getLeadFunnelMetrics(leads), [leads]);
  const sourceData = useMemo(() => getLeadSourceMetrics(leads), [leads]);
  const trendData = useMemo(() => getDailyLeadTrend(leads), [leads]);
  const achievedRevenue = useMemo(
    () => deals
      .filter((deal) => deal.status === "won")
      .reduce((total, deal) => total + (deal.value || 0), 0),
    [deals]
  );
  const revenueTarget = useMemo(
    () => getProratedRevenueTarget(range, 8500000),
    [range]
  );

  return (
    <div className="lead-analytics-section">
      <div className="dashboard-panels dashboard-panels--leads">
        <DashboardPanel
          id="revenue-target"
          title="Target Achievement"
          onExpand={onExpand}
          expanded={expandedPanel === "revenue-target"}
          closing={closingPanel === "revenue-target"}
        >
          <LeadTargetAchievement revenue={achievedRevenue} target={revenueTarget} />
        </DashboardPanel>
        <DashboardPanel
          id="lead-funnel"
          title="Lead Funnel"
          onExpand={onExpand}
          expanded={expandedPanel === "lead-funnel"}
          closing={closingPanel === "lead-funnel"}
        >
          <LeadFunnelChart funnelData={funnelData} />
        </DashboardPanel>
        <DashboardPanel
          id="lead-trend"
          title="Daily Lead Trend"
          onExpand={onExpand}
          expanded={expandedPanel === "lead-trend"}
          closing={closingPanel === "lead-trend"}
        >
          <DailyLeadTrendChart data={trendData} />
        </DashboardPanel>
        <DashboardPanel
          id="lead-sources"
          title="Lead Sources"
          onExpand={onExpand}
          expanded={expandedPanel === "lead-sources"}
          closing={closingPanel === "lead-sources"}
        >
          <LeadSourcePieChart data={sourceData} />
        </DashboardPanel>
      </div>
    </div>
  );
}
