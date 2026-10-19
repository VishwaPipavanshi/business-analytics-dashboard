import { useMemo } from "react";
import { useDashboardContext } from "../context/DashboardContext";
import { formatDateRangeDisplay } from "../utils/dateUtils";

/**
 * Hook providing access to filter states and actions.
 */
export function useFilter() {
  const {
    preset,
    setPreset,
    customStart,
    setCustomStart,
    customEnd,
    setCustomEnd,
    userId,
    setUserId,
    department,
    setDepartment,
    range,
    prevRange,
    resetFilters,
    activeFiltersCount,
  } = useDashboardContext();

  const formattedRange = useMemo(
    () => formatDateRangeDisplay(range),
    [range]
  );

  const formattedPrevRange = useMemo(
    () => formatDateRangeDisplay(prevRange),
    [prevRange]
  );

  return {
    preset,
    setPreset,
    customStart,
    setCustomStart,
    customEnd,
    setCustomEnd,
    userId,
    setUserId,
    department,
    setDepartment,
    range,
    prevRange,
    formattedRange,
    formattedPrevRange,
    resetFilters,
    activeFiltersCount,
  };
}
