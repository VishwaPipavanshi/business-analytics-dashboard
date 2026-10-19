import { useMemo } from "react";
import { useDashboardContext } from "../context/DashboardContext";
import { filterDatasetPair } from "../utils/filterUtils";

/**
 * Custom hook that returns current and previous filtered datasets
 * based on the global dashboard filter context.
 */
export function useDashboardData() {
  const {
    range,
    prevRange,
    userId,
    department,
    preset,
    rawDatasets,
  } = useDashboardContext();

  const filtered = useMemo(() => {
    const opts = { range, prevRange, userId, department, dateField: "createdAt" };

    const leadsPair = filterDatasetPair(rawDatasets.leads, opts);
    const quotesPair = filterDatasetPair(rawDatasets.quotations, opts);
    const dealsPair = filterDatasetPair(rawDatasets.deals, opts);
    const ordersPair = filterDatasetPair(rawDatasets.orders, opts);
    const paymentsPair = filterDatasetPair(rawDatasets.payments, opts);

    return {
      current: {
        leads: leadsPair.current,
        quotations: quotesPair.current,
        deals: dealsPair.current,
        orders: ordersPair.current,
        payments: paymentsPair.current,
      },
      previous: {
        leads: leadsPair.previous,
        quotations: quotesPair.previous,
        deals: dealsPair.previous,
        orders: ordersPair.previous,
        payments: paymentsPair.previous,
      },
      range,
      prevRange,
      preset,
      userId,
      department,
    };
  }, [range, prevRange, userId, department, preset, rawDatasets]);

  return filtered;
}
