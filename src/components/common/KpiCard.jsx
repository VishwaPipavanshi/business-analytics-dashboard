import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { formatCurrency, formatPercent, formatDelta, deltaDirection } from "../../utils/formatUtils";
import "./KpiCard.scss";

/**
 * @param {object} props
 * @param {string}  props.id        - unique element id
 * @param {string}  props.label     - card title
 * @param {number}  props.value     - primary metric value
 * @param {"number"|"currency"|"percent"} props.format
 * @param {object}  props.change    - { value, label, direction } from calculatePeriodChange
 * @param {string}  props.icon      - Lucide icon component
 * @param {string}  props.color     - accent color CSS variable name, e.g. "primary"
 * @param {string?} props.subLabel  - secondary info line
 * @param {function?} props.onClick - drill-down handler
 */
export default function KpiCard({
  id,
  label,
  value,
  format = "number",
  change,
  icon: Icon,
  color = "primary",
  subLabel,
  onClick,
  expanded = false,
  closing = false,
}) {
  const displayValue =
    format === "currency" ? formatCurrency(value, true)
    : format === "percent" ? formatPercent(value)
    : value.toLocaleString("en-IN");

  const dir = change ? deltaDirection(change.value) : "neutral";
  const deltaLabel = change ? formatDelta(change.value) : null;

  const DeltaIcon =
    dir === "positive" ? TrendingUp
    : dir === "negative" ? TrendingDown
    : Minus;

  return (
    <div
      id={id}
      className={`kpi-card kpi-card--${color}${onClick ? " kpi-card--clickable" : ""}${expanded ? " kpi-card--expanded" : ""}${closing ? " kpi-card--closing" : ""}`}
      onClick={expanded ? undefined : onClick}
      role={expanded ? "dialog" : onClick ? "button" : undefined}
      aria-modal={expanded ? "true" : undefined}
      aria-expanded={expanded}
      tabIndex={expanded ? -1 : onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
        if (e.key === "Escape" && expanded) {
          e.stopPropagation();
          onClick(null);
        }
      } : undefined}
      aria-label={`${label}: ${displayValue}`}
    >
      <div className="kpi-card__header">
        <span className="kpi-card__label">{label}</span>
        {Icon && (
          <div className={`kpi-card__icon kpi-card__icon--${color}`}>
            <Icon size={16} />
          </div>
        )}
      </div>

      <div className="kpi-card__value">{displayValue}</div>

      <div className="kpi-card__footer">
        {change && (
          <span className={`delta delta--${dir}`}>
            <DeltaIcon size={11} />
            {deltaLabel}
          </span>
        )}
        {subLabel && (
          <span className="kpi-card__sub">{subLabel}</span>
        )}
      </div>
    </div>
  );
}
