import { useMemo } from "react";
import { useDashboardContext } from "../context/DashboardContext";
import { filterDatasetPair } from "../utils/filterUtils";

/**
 * Generic hook to filter any arbitrary array of records
 * using the global dashboard date and owner filters.
 */
export function useFilteredDataset(records = [], options = {}) {
  const { dateField = "createdAt" } = options;
  const { range, prevRange, userId, department } = useDashboardContext();

  const pair = useMemo(() => {
    return filterDatasetPair(records, {
      range,
      prevRange,
      userId,
      department,
      dateField,
    });
  }, [records, range, prevRange, userId, department, dateField]);

  return pair;
}
