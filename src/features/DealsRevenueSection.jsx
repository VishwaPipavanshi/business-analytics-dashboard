import { useMemo } from "react";
import DealsByServiceChart from "../components/charts/DealsByServiceChart.jsx";
import RevenueByCategoryChart from "../components/charts/RevenueByCategoryChart.jsx";
import DealsPriorityChart from "../components/charts/DealsPriorityChart.jsx";
import CollectionsTrendChart from "../components/charts/CollectionsTrendChart.jsx";
import DashboardPanel from "../components/common/DashboardPanel.jsx";
import { formatCurrency } from "../utils/formatUtils.js";

export default function DealsRevenueSection({
  deals = [],
  payments = [],
  onExpand,
  expandedPanel,
  closingPanel,
}) {
  const totals = useMemo(() => ({
    dealValue: deals.reduce((sum, deal) => sum + (deal.value || 0), 0),
    collected: payments.reduce((sum, payment) => sum + (payment.collected || 0), 0),
  }), [deals, payments]);

  return (
    <div className="deals-revenue-section">
      <div className="dashboard-panels dashboard-panels--revenue">
        <DashboardPanel id="deals-by-service" title="Deals Created vs Deal Revenue by Service" onExpand={onExpand} expanded={expandedPanel === "deals-by-service"} closing={closingPanel === "deals-by-service"}>
          <DealsByServiceChart deals={deals} />
        </DashboardPanel>
        <DashboardPanel id="revenue-by-category" title="Revenue by Order / Service Category" onExpand={onExpand} expanded={expandedPanel === "revenue-by-category"} closing={closingPanel === "revenue-by-category"}>
          <RevenueByCategoryChart deals={deals} />
        </DashboardPanel>
        <DashboardPanel id="deal-priority" title="Priority Breakdown" onExpand={onExpand} expanded={expandedPanel === "deal-priority"} closing={closingPanel === "deal-priority"}>
          <DealsPriorityChart deals={deals} />
        </DashboardPanel>
        <DashboardPanel id="daily-revenue" title="Daily Revenue Trend" onExpand={onExpand} expanded={expandedPanel === "daily-revenue"} closing={closingPanel === "daily-revenue"}>
          <CollectionsTrendChart deals={deals} payments={payments} />
        </DashboardPanel>
        <DashboardPanel id="revenue-summary" title="Total vs Collected Revenue" className="dashboard-summary-panel" onExpand={onExpand} expanded={expandedPanel === "revenue-summary"} closing={closingPanel === "revenue-summary"}>
          <h4 className="chart-card-title">Total vs Collected Revenue</h4>
          <div className="revenue-summary-tile revenue-summary-tile--total">
            <span className="revenue-summary-icon" aria-hidden="true">₹</span>
            <div>
              <span>Total Deal Value</span>
              <strong>{formatCurrency(totals.dealValue)}</strong>
            </div>
          </div>
          <div className="revenue-summary-tile revenue-summary-tile--collected">
            <span className="revenue-summary-icon" aria-hidden="true">✓</span>
            <div>
              <span>Net Collected Revenue</span>
              <strong>{formatCurrency(totals.collected)}</strong>
            </div>
          </div>
        </DashboardPanel>
      </div>
    </div>
  );
}
