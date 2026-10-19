/**
 * Calculate the percentage change between current and previous period.
 * Returns: { value, label, direction }
 * direction: "positive" | "negative" | "neutral"
 */
export function calculatePeriodChange(current, previous) {
  const cur = Number(current) || 0;
  const prev = Number(previous) || 0;

  if (prev === 0) {
    if (cur === 0) {
      return {
        value: 0,
        label: "0.0%",
        direction: "neutral",
      };
    }
    return {
      value: 100,
      label: "+100%",
      direction: "positive",
    };
  }

  const value = ((cur - prev) / Math.abs(prev)) * 100;

  return {
    value,
    label: `${value > 0 ? "+" : ""}${value.toFixed(1)}%`,
    direction: value > 0 ? "positive" : value < 0 ? "negative" : "neutral",
  };
}

/**
 * Calculate the sum of a numeric field in records.
 */
export function calculateSum(records, field) {
  if (!Array.isArray(records)) return 0;
  return records.reduce((sum, item) => sum + (Number(item?.[field]) || 0), 0);
}

/**
 * Calculate the average of a numeric field in records.
 */
export function calculateAverage(records, field) {
  if (!Array.isArray(records) || records.length === 0) return 0;
  return calculateSum(records, field) / records.length;
}

/**
 * Count occurrences of a specific property value.
 */
export function countBy(records, key) {
  if (!Array.isArray(records)) return {};
  return records.reduce((acc, item) => {
    const val = item?.[key] || "Unknown";
    acc[val] = (acc[val] || 0) + 1;
    return acc;
  }, {});
}

/**
 * Aggregate records by a group key and sum a numeric field.
 */
export function aggregateBy(records, groupKey, sumKey) {
  if (!Array.isArray(records)) return [];
  const map = new Map();

  records.forEach((item) => {
    const key = item?.[groupKey] || "Unknown";
    const amount = Number(item?.[sumKey]) || 0;
    if (!map.has(key)) {
      map.set(key, { name: key, count: 0, total: 0 });
    }
    const entry = map.get(key);
    entry.count += 1;
    entry.total += amount;
  });

  return Array.from(map.values());
}