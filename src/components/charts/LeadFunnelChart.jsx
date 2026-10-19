import { useMemo } from "react";
import "./Charts.scss";

const FUNNEL_COLORS = ["#2563eb", "#10b981", "#f59e0b"];

export default function LeadFunnelChart({ funnelData = [] }) {
  const total = funnelData.find((stage) => stage.stage === "Total Leads")?.count || 0;
  const unqualifiedCount = funnelData.find((stage) => stage.stage === "Unqualified")?.count || 0;
  const stages = useMemo(
    () => [
      {
        label: "New Leads",
        count: total,
        percentage: total ? 100 : 0,
      },
      ...funnelData
        .filter((stage) => stage.stage === "Qualified" || stage.stage === "Converted")
        .map((stage) => ({
          label: stage.stage,
          count: stage.count,
          percentage: total ? (stage.count / total) * 100 : 0,
        })),
    ],
    [funnelData, total]
  );

  return (
    <div className="lead-funnel-card lead-funnel-reference">
      <div className="chart-card-header">
        <h4 className="chart-card-title">Lead Funnel</h4>
      </div>
      {total === 0 ? (
        <div className="chart-empty-state">No lead data for this selection.</div>
      ) : (
        <div className="lead-funnel-reference__visual">
          <div className="lead-funnel-reference__stages">
            {stages.map((stage, index) => (
              <div className="lead-funnel-reference__stage-wrap" key={stage.label}>
                <div
                  className={`lead-funnel-reference__stage lead-funnel-reference__stage--${index}`}
                  style={{ "--funnel-color": FUNNEL_COLORS[index] }}
                  tabIndex={0}
                  aria-describedby={`funnel-tip-${index}`}
                >
                  <strong>{stage.label}</strong>
                  <b>{stage.count}</b>
                  <span>({stage.percentage.toFixed(0)}%)</span>
                </div>
                <div className="lead-funnel-reference__tooltip" id={`funnel-tip-${index}`} role="tooltip">
                  <strong>{stage.label}: {stage.count} ({stage.percentage.toFixed(1)}%)</strong>
                  <span>Unqualified leads: {unqualifiedCount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
