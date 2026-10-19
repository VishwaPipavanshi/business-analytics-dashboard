import { useState, useCallback, useEffect, useRef } from "react";
import { FileText, TrendingUp, PackageCheck } from "lucide-react";
import DashboardHeader from "./DashboardHeader.jsx";
import KpiSection from "../../features/KpiSection.jsx";
import LeadAnalyticsSection from "../../features/LeadAnalyticsSection.jsx";
import QuotationAnalyticsSection from "../../features/QuotationAnalyticsSection.jsx";
import DealsRevenueSection from "../../features/DealsRevenueSection.jsx";
import OperationsTeamSection from "../../features/OperationsTeamSection.jsx";
import RecordModal from "../common/RecordModal.jsx";
import { useDashboardContext } from "../../context/DashboardContext.jsx";
import { useDashboardData, useKpiMetrics } from "../../hooks/index.js";
import {
  exportDashboardSummary,
  exportLeadsToCsv,
  exportDealsToCsv,
  exportPaymentsToCsv,
} from "../../services/index.js";
import "../../styles/main.scss";

export default function DashboardLayout() {
  const { range, preset, userId, department } = useDashboardContext();
  const { current } = useDashboardData();
  const kpis = useKpiMetrics();

  const [activeModal, setActiveModal] = useState(null);
  const [activePanel, setActivePanel] = useState(null);
  const [closingPanel, setClosingPanel] = useState(null);
  const closeTimer = useRef(null);

  const handleExpandPanel = useCallback((panel) => {
    if (!panel) {
      if (!activePanel) return;
      window.clearTimeout(closeTimer.current);
      setClosingPanel(activePanel.id);
      closeTimer.current = window.setTimeout(() => {
        setActivePanel(null);
        setClosingPanel(null);
      }, 180);
      return;
    }
    window.clearTimeout(closeTimer.current);
    setClosingPanel(null);
    setActivePanel(panel);
  }, [activePanel]);

  useEffect(() => {
    if (!activePanel) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleEscape = (event) => {
      if (event.key === "Escape") handleExpandPanel(null);
    };
    window.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [activePanel, handleExpandPanel]);

  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  const handleSelectRecord = useCallback((record, type) => {
    setActiveModal({ record, type });
  }, []);

  const handleCloseModal = useCallback(() => {
    setActiveModal(null);
  }, []);

  // Export Callbacks
  const handleExportSummary = useCallback(() => {
    exportDashboardSummary({ kpis, range, preset, userId, department });
  }, [kpis, range, preset, userId, department]);

  const handleExportLeads = useCallback(() => {
    exportLeadsToCsv(current.leads);
  }, [current.leads]);

  const handleExportDeals = useCallback(() => {
    exportDealsToCsv(current.deals);
  }, [current.deals]);

  const handleExportPayments = useCallback(() => {
    exportPaymentsToCsv(current.payments);
  }, [current.payments]);

  return (
    <div className="dashboard">
      {/* Top Header Bar */}
      <DashboardHeader
        onExportSummary={handleExportSummary}
        onExportLeads={handleExportLeads}
        onExportDeals={handleExportDeals}
        onExportPayments={handleExportPayments}
      />

      {/* Main Single Page Content (All Sections Stacked Vertically, No Navigation Tabs) */}
      <main className="dashboard__body" id="main-content">
        <div className="dashboard__content">
          {/* KPI overview */}
          <section id="section-kpis" aria-label="Key Performance Indicators">
            <KpiSection
              onExpand={handleExpandPanel}
              expandedPanel={activePanel?.id}
              closingPanel={closingPanel}
            />
          </section>

          <section id="section-lead-analytics" className="dashboard__section" aria-label="Lead analytics">
            <LeadAnalyticsSection
              leads={current.leads}
              deals={current.deals}
              onExpand={handleExpandPanel}
              expandedPanel={activePanel?.id}
              closingPanel={closingPanel}
            />
          </section>

          {/* SECTION 3: Quotation Analytics */}
          <section id="section-quotation-analytics" className="dashboard__section">
            <div className="dashboard-section-heading">
              <div className="section-divider-bar__left">
                <div className="section-divider-bar__icon section-divider-bar__icon--amber">
                  <FileText size={16} />
                </div>
                <h2 className="section-divider-bar__title">Quotation Analytics</h2>
              </div>
            </div>
            <QuotationAnalyticsSection
              quotations={current.quotations}
              deals={current.deals}
              onExpand={handleExpandPanel}
              expandedPanel={activePanel?.id}
              closingPanel={closingPanel}
            />
          </section>

          {/* SECTION 4: Deals & Revenue Analytics */}
          <section id="section-deals-revenue" className="dashboard__section">
            <div className="dashboard-section-heading">
              <div className="section-divider-bar__left">
                <div className="section-divider-bar__icon section-divider-bar__icon--green">
                  <TrendingUp size={16} />
                </div>
                <h2 className="section-divider-bar__title">Deals &amp; Revenue</h2>
              </div>
            </div>
            <DealsRevenueSection
              deals={current.deals}
              payments={current.payments}
              onExpand={handleExpandPanel}
              expandedPanel={activePanel?.id}
              closingPanel={closingPanel}
            />
          </section>

          {/* SECTION 5: Operations, Team Performance & Recent CRM Activity */}
          <section id="section-operations-team" className="dashboard__section">
            <div className="dashboard-section-heading">
              <div className="section-divider-bar__left">
                <div className="section-divider-bar__icon section-divider-bar__icon--purple">
                  <PackageCheck size={16} />
                </div>
                <h2 className="section-divider-bar__title">Team &amp; Operations</h2>
              </div>
            </div>
            <OperationsTeamSection
              leads={current.leads}
              quotations={current.quotations}
              deals={current.deals}
              orders={current.orders}
              payments={current.payments}
              onSelectRecord={handleSelectRecord}
              onExpand={handleExpandPanel}
              expandedPanel={activePanel?.id}
              closingPanel={closingPanel}
            />
          </section>
        </div>
      </main>

      {activePanel && (
        <div
          className={`dashboard-panel-backdrop${closingPanel ? " dashboard-panel-backdrop--closing" : ""}`}
          onClick={() => handleExpandPanel(null)}
          aria-hidden="true"
        />
      )}

      {/* Record Drill-Down Relational Detail Modal */}
      {activeModal && (
        <RecordModal
          record={activeModal.record}
          type={activeModal.type}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
