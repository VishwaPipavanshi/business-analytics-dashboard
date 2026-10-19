import { calculateSum } from "../utils/analyticsUtils.js";

/**
 * Deal status analytics (won, open, lost).
 */
export function getDealStatusBreakdown(deals = []) {
  const won = deals.filter((d) => d.status === "won");
  const open = deals.filter((d) => d.status === "open");
  const lost = deals.filter((d) => d.status === "lost");

  const total = deals.length;
  const wonValue = calculateSum(won, "value");
  const openValue = calculateSum(open, "value");
  const lostValue = calculateSum(lost, "value");
  const totalValue = wonValue + openValue + lostValue;

  return {
    won: { count: won.length, value: wonValue, percentage: total > 0 ? (won.length / total) * 100 : 0 },
    open: { count: open.length, value: openValue, percentage: total > 0 ? (open.length / total) * 100 : 0 },
    lost: { count: lost.length, value: lostValue, percentage: total > 0 ? (lost.length / total) * 100 : 0 },
    total,
    totalValue,
    winRate: (won.length + lost.length) > 0 ? Number(((won.length / (won.length + lost.length)) * 100).toFixed(1)) : 0,
  };
}

/**
 * Priority breakdown of deals (high, medium, low).
 */
export function getDealsByPriority(deals = []) {
  const priorities = ["high", "medium", "low"];
  const total = deals.length;

  return priorities.map((priority) => {
    const list = deals.filter((d) => d.priority === priority);
    const value = calculateSum(list, "value");
    return {
      priority,
      count: list.length,
      value,
      percentage: total > 0 ? Number(((list.length / total) * 100).toFixed(1)) : 0,
    };
  });
}
