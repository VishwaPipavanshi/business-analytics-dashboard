import { calculateSum } from "../utils/analyticsUtils.js";

/**
 * Payment breakdown by status: paid, partial, pending, overdue.
 */
export function getPaymentStatusBreakdown(payments = []) {
  const statuses = [
    { key: "paid", label: "Paid", color: "#16a34a" },
    { key: "partial", label: "Partially Paid", color: "#3b82f6" },
    { key: "pending", label: "Pending", color: "#f59e0b" },
    { key: "overdue", label: "Overdue", color: "#ef4444" },
  ];

  const totalAmount = calculateSum(payments, "amount");
  const totalCollected = calculateSum(payments, "collected");
  const totalOutstanding = calculateSum(payments, "outstanding");

  const list = statuses.map((item) => {
    const matching = payments.filter((p) => p.status === item.key);
    const amount = calculateSum(matching, "amount");
    const collected = calculateSum(matching, "collected");
    const outstanding = calculateSum(matching, "outstanding");

    return {
      ...item,
      count: matching.length,
      amount,
      collected,
      outstanding,
      percentage: payments.length > 0 ? Number(((matching.length / payments.length) * 100).toFixed(1)) : 0,
    };
  });

  return {
    list,
    totalBilled: totalAmount,
    totalCollected,
    totalOutstanding,
    collectionEfficiency: totalAmount > 0 ? Number(((totalCollected / totalAmount) * 100).toFixed(1)) : 0,
  };
}
