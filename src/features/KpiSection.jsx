import {
  Users,
  UserCheck,
  CheckCircle2,
  XCircle,
  Percent,
  FileText,
  Briefcase,
  TrendingUp,
} from "lucide-react";
import KpiCard from "../components/common/KpiCard";
import { useKpiMetrics } from "../hooks";

const KPI_CONFIG = [
  { key: "newLeads",       format: "number",   color: "primary", icon: Users,        id: "kpi-new-leads",    label: "New Leads" },
  { key: "qualifiedLeads", format: "number",   color: "cyan",    icon: UserCheck,    id: "kpi-qualified",    label: "Qualified Leads" },
  { key: "convertedLeads", format: "number",   color: "success", icon: CheckCircle2, id: "kpi-converted",    label: "Converted Leads" },
  { key: "unqualifiedLeads", format: "number", color: "danger",  icon: XCircle,      id: "kpi-unqualified",  label: "Unqualified Leads" },
  { key: "conversionRate", format: "percent",   color: "purple",  icon: Percent,      id: "kpi-conversion",   label: "Conversion Rate" },
  { key: "quotations",     format: "number",   color: "warning", icon: FileText,     id: "kpi-quotations",   label: "Quotations Created" },
  { key: "deals",          format: "number",   color: "indigo",  icon: Briefcase,    id: "kpi-deals",        label: "Deals Created" },
  { key: "revenue",        format: "currency", color: "success", icon: TrendingUp,   id: "kpi-revenue",      label: "Invoices Generated" },
];

export default function KpiSection({ onExpand, expandedPanel, closingPanel }) {
  const kpis = useKpiMetrics();

  return (
    <div className="kpi-grid" id="kpi-section-grid">
      {KPI_CONFIG.map(({ key, format, color, icon, id, label }) => {
        const metric = kpis[key] || { value: 0, label: label, change: null };
        return (
          <KpiCard
            key={key}
            id={id}
            label={metric.label || label}
            value={metric.value}
            format={format}
            change={metric.change}
            icon={icon}
            color={color}
            onClick={onExpand ? (panel) => onExpand(panel ? { id: `kpi-${key}`, title: label } : null) : undefined}
            expanded={expandedPanel === `kpi-${key}`}
            closing={closingPanel === `kpi-${key}`}
          />
        );
      })}
    </div>
  );
}
