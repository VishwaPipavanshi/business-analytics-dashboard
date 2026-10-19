import {
  startOfDay,
  endOfDay,
  subDays,
  isValid,
  format,
} from "date-fns";

/**
 * Safely parse a date string or Date object.
 * YYYY-MM-DD strings are parsed into local noon (12:00:00) to eliminate
 * UTC-midnight timezone shift issues.
 */
export function parseRecordDate(value) {
  if (!value) return null;
  if (value instanceof Date) {
    return isValid(value) ? value : null;
  }
  if (typeof value === "string") {
    // Check YYYY-MM-DD format
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const year = Number(match[1]);
      const month = Number(match[2]) - 1;
      const day = Number(match[3]);
      const date = new Date(year, month, day, 12, 0, 0, 0);
      return isValid(date) ? date : null;
    }
    const parsed = new Date(value);
    return isValid(parsed) ? parsed : null;
  }
  return null;
}

/**
 * Returns { start, end } Date objects for the given preset.
 * "today"   → today 00:00:00.000 → 23:59:59.999
 * "7days"   → 6 days ago 00:00:00.000 → today 23:59:59.999 (7 total days)
 * "30days"  → 29 days ago 00:00:00.000 → today 23:59:59.999 (30 total days)
 * "custom"  → parse provided strings, with fallback
 */
export function getDateRange(preset, customStart, customEnd, baseDate = new Date()) {
  const now = baseDate instanceof Date && isValid(baseDate) ? baseDate : new Date();

  if (preset === "today") {
    return {
      start: startOfDay(now),
      end: endOfDay(now),
    };
  }

  if (preset === "7days") {
    return {
      start: startOfDay(subDays(now, 6)),
      end: endOfDay(now),
    };
  }

  if (preset === "custom") {
    const s = parseRecordDate(customStart);
    const e = parseRecordDate(customEnd);

    if (s && e) {
      // If user selected inverted range, swap
      const start = s.getTime() <= e.getTime() ? s : e;
      const end = s.getTime() <= e.getTime() ? e : s;
      return {
        start: startOfDay(start),
        end: endOfDay(end),
      };
    }
    if (s && !e) {
      return {
        start: startOfDay(s),
        end: endOfDay(now),
      };
    }
    if (!s && e) {
      return {
        start: startOfDay(subDays(e, 29)),
        end: endOfDay(e),
      };
    }
  }

  // Default: last 30 days
  return {
    start: startOfDay(subDays(now, 29)),
    end: endOfDay(now),
  };
}

/**
 * Returns a previous-period range of the same length, immediately before `range`.
 * Example: if range is Oct 12 - Oct 18 (7 days), previous is Oct 05 - Oct 11 (7 days).
 */
export function getPreviousRange(range) {
  if (!range || !range.start || !range.end) {
    const defaultRange = getDateRange("30days");
    return getPreviousRange(defaultRange);
  }

  const durationMs = range.end.getTime() - range.start.getTime() + 1;
  const prevEnd = new Date(range.start.getTime() - 1);
  const prevStart = new Date(prevEnd.getTime() - durationMs + 1);

  return {
    start: prevStart,
    end: prevEnd,
  };
}

/**
 * Check if a date string or object falls within { start, end }
 */
export function isDateInRange(dateValue, range) {
  if (!dateValue || !range || !range.start || !range.end) return false;
  const date = parseRecordDate(dateValue);
  if (!date) return false;
  const time = date.getTime();
  return time >= range.start.getTime() && time <= range.end.getTime();
}

/**
 * Format a date for UI display (e.g. "Oct 18, 2026")
 */
export function formatDisplayDate(dateValue) {
  const date = parseRecordDate(dateValue);
  if (!date) return "—";
  try {
    return format(date, "MMM dd, yyyy");
  } catch {
    return "—";
  }
}

/**
 * Format a date range for UI display (e.g. "Oct 1 – Oct 18, 2026")
 */
export function formatDateRangeDisplay(range) {
  if (!range || !range.start || !range.end) return "—";
  try {
    const s = parseRecordDate(range.start);
    const e = parseRecordDate(range.end);
    if (!s || !e) return "—";

    if (s.getFullYear() === e.getFullYear()) {
      if (s.getMonth() === e.getMonth() && s.getDate() === e.getDate()) {
        return format(s, "MMM d, yyyy");
      }
      return `${format(s, "MMM d")} – ${format(e, "MMM d, yyyy")}`;
    }
    return `${format(s, "MMM d, yyyy")} – ${format(e, "MMM d, yyyy")}`;
  } catch {
    return `${formatDisplayDate(range.start)} – ${formatDisplayDate(range.end)}`;
  }
}

/**
 * Format a Date to YYYY-MM-DD input format
 */
export function formatInputDate(dateValue) {
  const date = parseRecordDate(dateValue);
  if (!date) return "";
  try {
    return format(date, "yyyy-MM-dd");
  } catch {
    return "";
  }
}
