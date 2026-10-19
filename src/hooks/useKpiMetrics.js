import { useMemo } from "react";
import { useDashboardContext } from "../context/DashboardContext";
import { computeKPIs } from "../services/kpiService";

/**
 * Hook to retrieve calculated KPI metrics reactively.
 * Updates immediately when filter context changes.
 */
export function useKpiMetrics() {
  const {
    range,
    userId,
    department,
    rawDatasets,
  } = useDashboardContext();

  const metrics = useMemo(() => {
    return computeKPIs({
      leads: rawDatasets.leads,
      quotations: rawDatasets.quotations,
      deals: rawDatasets.deals,
      orders: rawDatasets.orders,
      payments: rawDatasets.payments,
      range,
      userId,
      department,
    });
  }, [rawDatasets, range, userId, department]);

  return metrics;
}
