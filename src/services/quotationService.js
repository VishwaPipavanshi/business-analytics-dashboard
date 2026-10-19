import { calculateSum } from "../utils/analyticsUtils.js";

/**
 * Service-wise breakdown of quotations (count, total value, accepted value, conversion rate).
 */
export function getServiceWiseQuotations(quotations = []) {
  const map = new Map();

  quotations.forEach((q) => {
    const sName = q.service || "Other";
    if (!map.has(sName)) {
      map.set(sName, {
        service: sName,
        count: 0,
        totalAmount: 0,
        acceptedCount: 0,
        acceptedAmount: 0,
        sentCount: 0,
        draftCount: 0,
        rejectedCount: 0,
      });
    }

    const entry = map.get(sName);
    entry.count += 1;
    entry.totalAmount += Number(q.amount) || 0;

    if (q.status === "accepted") {
      entry.acceptedCount += 1;
      entry.acceptedAmount += Number(q.amount) || 0;
    } else if (q.status === "sent") {
      entry.sentCount += 1;
    } else if (q.status === "draft") {
      entry.draftCount += 1;
    } else if (q.status === "rejected" || q.status === "expired") {
      entry.rejectedCount += 1;
    }
  });

  return Array.from(map.values())
    .map((item) => ({
      ...item,
      avgAmount: item.count > 0 ? Math.round(item.totalAmount / item.count) : 0,
      conversionRate: item.count > 0 ? Number(((item.acceptedCount / item.count) * 100).toFixed(1)) : 0,
    }))
    .sort((a, b) => b.totalAmount - a.totalAmount);
}

/**
 * Summary breakdown of quotation statuses.
 */
export function getQuotationStatusBreakdown(quotations = []) {
  const statuses = ["accepted", "sent", "draft", "rejected", "expired"];
  const total = quotations.length;
  const totalAmount = calculateSum(quotations, "amount");

  return statuses.map((status) => {
    const filtered = quotations.filter((q) => q.status === status);
    const amount = calculateSum(filtered, "amount");
    return {
      status,
      count: filtered.length,
      amount,
      percentage: total > 0 ? Number(((filtered.length / total) * 100).toFixed(1)) : 0,
      valuePercentage: totalAmount > 0 ? Number(((amount / totalAmount) * 100).toFixed(1)) : 0,
    };
  });
}
