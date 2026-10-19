import { Target } from "lucide-react";
import { formatCurrency } from "../../utils/formatUtils.js";
import "./Charts.scss";

export default function LeadTargetAchievement({ revenue = 0, target = 8500000 }) {
  const remaining = Math.max(target - revenue, 0);
  const percentage = target > 0 ? (revenue / target) * 100 : 0;
  const progress = Math.min(percentage, 100);

  return (
    <div className="revenue-target-card">
      <div className="chart-card-header">
        <div className="revenue-target-heading">
          <Target size={16} />
          <h4 className="chart-card-title">Target Achievement</h4>
        </div>
      </div>

      <div className="revenue-target-content">
        <div className="revenue-target-details">
          <div className="revenue-target-summary">
            <span>Monthly Revenue Target</span>
            <strong>{formatCurrency(target)}</strong>
          </div>
          <div className="revenue-target-stats">
            <div>
              <span><i className="revenue-target-dot revenue-target-dot--achieved" />Achieved</span>
              <strong>{formatCurrency(revenue)}</strong>
              <small>{percentage.toFixed(1)}%</small>
            </div>
            <div>
              <span><i className="revenue-target-dot revenue-target-dot--remaining" />Remaining</span>
              <strong>{formatCurrency(remaining)}</strong>
              <small>{(100 - Math.min(percentage, 100)).toFixed(1)}%</small>
            </div>
          </div>
          <div className="revenue-target-progress" aria-label={`${percentage.toFixed(1)}% of revenue target achieved`}>
            <span style={{ width: `${progress}%` }} />
          </div>
        </div>
        <div className="revenue-target-funnel" aria-label={`Revenue target, ${percentage.toFixed(1)} percent achieved`}>
          <span className="revenue-target-funnel__caption">Target vs Achieved</span>
          <div className="revenue-target-funnel__remaining" title={`Remaining: ${formatCurrency(remaining)}`}>
            <span>Remaining</span>
          </div>
          <div className="revenue-target-funnel__achieved" title={`Achieved: ${formatCurrency(revenue)}`}>
            <span>Achieved</span>
          </div>
          <small>{percentage.toFixed(1)}% achieved</small>
        </div>
      </div>
    </div>
  );
}
