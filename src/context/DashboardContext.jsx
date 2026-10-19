import {
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
} from "react";
import { getDateRange, getPreviousRange } from "../utils/dateUtils";
import {
  leads,
  quotations,
  deals,
  orders,
  payments,
  users,
  departments,
  services,
  leadSources,
} from "../data/dummyData";

const DashboardContext = createContext(null);

export function DashboardProvider({ children }) {
  const [preset, setPreset] = useState("30days");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [userId, setUserId] = useState("all");
  const [department, setDepartment] = useState("all");

  // Calculate current range
  const range = useMemo(
    () => getDateRange(preset, customStart, customEnd),
    [preset, customStart, customEnd]
  );

  // Calculate matching previous period range
  const prevRange = useMemo(
    () => getPreviousRange(range),
    [range]
  );

  // Helper to reset all filters to default
  const resetFilters = useCallback(() => {
    setPreset("30days");
    setCustomStart("");
    setCustomEnd("");
    setUserId("all");
    setDepartment("all");
  }, []);

  // Compute number of non-default filters active
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (preset !== "30days") count += 1;
    if (userId !== "all") count += 1;
    if (department !== "all") count += 1;
    return count;
  }, [preset, userId, department]);

  const value = useMemo(
    () => ({
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
      // Provide raw datasets for consumers
      rawDatasets: {
        leads,
        quotations,
        deals,
        orders,
        payments,
        users,
        departments,
        services,
        leadSources,
      },
    }),
    [
      preset,
      customStart,
      customEnd,
      userId,
      department,
      range,
      prevRange,
      resetFilters,
      activeFiltersCount,
    ]
  );

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useDashboardContext() {
  const context = useContext(DashboardContext);

  if (!context) {
    throw new Error(
      "useDashboardContext must be used inside DashboardProvider"
    );
  }

  return context;
}