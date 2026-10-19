import { useMemo } from "react";
import QuotationsByServiceChart from "../components/charts/QuotationsByServiceChart.jsx";
import QuoteToDealConversion from "../components/charts/QuoteToDealConversion.jsx";
import ServiceWiseQuotationsChart from "../components/charts/ServiceWiseQuotationsChart.jsx";
import DashboardPanel from "../components/common/DashboardPanel.jsx";
import {
  getServiceWiseQuotations,
} from "../services/quotationService.js";
import { formatCurrency } from "../utils/formatUtils.js";

export default function QuotationAnalyticsSection({
  quotations = [],
  deals = [],
  onExpand,
  expandedPanel,
  closingPanel,
}) {
  const serviceWise = useMemo(
    () => getServiceWiseQuotations(quotations),
    [quotations]
  );

  return (
    <div className="quotation-analytics-section">
      <div className="dashboard-panels dashboard-panels--quotations">
        <DashboardPanel
          id="quotation-counts"
          title="Quotations by Service / Order Category"
          onExpand={onExpand}
          expanded={expandedPanel === "quotation-counts"}
          closing={closingPanel === "quotation-counts"}
        >
          <QuotationsByServiceChart quotations={quotations} />
        </DashboardPanel>
        <DashboardPanel
          id="quotation-values"
          title="Quotation Value by Service"
          onExpand={onExpand}
          expanded={expandedPanel === "quotation-values"}
          closing={closingPanel === "quotation-values"}
        >
          <ServiceWiseQuotationsChart quotations={quotations} />
        </DashboardPanel>
        <DashboardPanel
          id="quotation-details"
          title="Service Wise Quotation Details"
          className="dashboard-panel--table dashboard-panel--quotation-table"
          onExpand={onExpand}
          expanded={expandedPanel === "quotation-details"}
          closing={closingPanel === "quotation-details"}
        >
          <h4 className="chart-card-title">Service Wise Quotation Details</h4>
          <div className="dashboard-table-scroll">
            <table className="dashboard-detail-table">
              <thead>
                <tr>
                  <th>Service / Order</th>
                  <th>Quotes</th>
                  <th>Quoted Amount</th>
                  <th>Accepted</th>
                  <th>Pending</th>
                  <th>Rejected</th>
                  <th>Conv. Rate</th>
                </tr>
              </thead>
              <tbody>
                {serviceWise.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="dashboard-table-empty">No service quotations in this period.</td>
                  </tr>
                ) : serviceWise.map((service) => (
                  <tr key={service.service}>
                    <td>{service.service}</td>
                    <td>{service.count}</td>
                    <td>{formatCurrency(service.totalAmount)}</td>
                    <td>{service.acceptedCount}</td>
                    <td>{service.sentCount + service.draftCount}</td>
                    <td>{service.rejectedCount}</td>
                    <td>{service.conversionRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DashboardPanel>
        <DashboardPanel
          id="quote-conversion"
          title="Quote to Deal Conversion Rate"
          onExpand={onExpand}
          expanded={expandedPanel === "quote-conversion"}
          closing={closingPanel === "quote-conversion"}
        >
          <QuoteToDealConversion quotes={quotations} deals={deals} />
        </DashboardPanel>
      </div>
    </div>
  );
}
