import { parseRecordDate, getPreviousRange } from "./dateUtils.js";

/**
 * Filter records by a date field falling within [start, end].
 */
export function filterRecordsByDate(records, field, start, end) {
  if (!Array.isArray(records)) return [];
  if (!start || !end) return records;

  const startTime = start.getTime();
  const endTime = end.getTime();

  return records.filter((record) => {
    const rawVal = record?.[field];
    if (!rawVal) return false;
    const date = parseRecordDate(rawVal);
    if (!date) return false;

    const time = date.getTime();
    return time >= startTime && time <= endTime;
  });
}

/**
 * Filter records by user owner and/or department.
 */
export function filterByOwner(records, userId = "all", department = "all") {
  if (!Array.isArray(records)) return [];

  return records.filter((record) => {
    const matchesUser =
      userId === "all" || !userId || record.ownerId === userId;

    const matchesDepartment =
      department === "all" || !department || record.department === department;

    return matchesUser && matchesDepartment;
  });
}

/**
 * Filter a dataset by both date range and owner criteria.
 */
export function filterDataset(records, { range, userId = "all", department = "all", dateField = "createdAt" }) {
  if (!Array.isArray(records)) return [];

  let result = records;
  if (range?.start && range?.end) {
    result = filterRecordsByDate(result, dateField, range.start, range.end);
  }
  return filterByOwner(result, userId, department);
}

/**
 * Filter a dataset for both current period and previous period.
 */
export function filterDatasetPair(records, { range, prevRange, userId = "all", department = "all", dateField = "createdAt" }) {
  const current = filterDataset(records, { range, userId, department, dateField });
  const effectivePrevRange = prevRange || getPreviousRange(range);
  const previous = filterDataset(records, { range: effectivePrevRange, userId, department, dateField });

  return { current, previous };
}