import { formatDisplayDate } from "../utils/dateUtils.js";
import { formatCurrency } from "../utils/formatUtils.js";

/**
 * Generate a sorted, chronological CRM activity stream from filtered records.
 */
export function getRecentCrmActivity({ leads = [], quotations = [], deals = [], payments = [] }) {
  const events = [];

  // Lead events
  leads.forEach((l) => {
    events.push({
      id: `act-lead-${l.id}`,
      type: l.status === "converted" ? "conversion" : "lead",
      date: l.createdAt,
      title: l.status === "converted" ? `Lead Converted: ${l.name}` : `New Lead Created: ${l.name}`,
      description: `Source: ${l.source} · Department: ${l.department}`,
      ownerId: l.ownerId,
      status: l.status,
      badgeColor: l.status === "converted" ? "success" : "primary",
    });
  });

  // Quotation events
  quotations.forEach((q) => {
    events.push({
      id: `act-quote-${q.id}`,
      type: "quotation",
      date: q.createdAt,
      title: `Quotation ${q.status.toUpperCase()}: ${q.service}`,
      description: `Value: ${formatCurrency(q.amount)} · ID: ${q.id}`,
      ownerId: q.ownerId,
      status: q.status,
      badgeColor: q.status === "accepted" ? "success" : q.status === "sent" ? "primary" : "warning",
    });
  });

  // Deal events
  deals.forEach((d) => {
    events.push({
      id: `act-deal-${d.id}`,
      type: "deal",
      date: d.closedAt || d.createdAt,
      title: d.status === "won" ? `Deal Closed WON: ${d.service}` : `Deal Updated: ${d.service}`,
      description: `Value: ${formatCurrency(d.value)} · Priority: ${d.priority?.toUpperCase()}`,
      ownerId: d.ownerId,
      status: d.status,
      badgeColor: d.status === "won" ? "purple" : "danger",
    });
  });

  // Payment events
  payments.forEach((p) => {
    if (p.collected > 0) {
      events.push({
        id: `act-payment-${p.id}`,
        type: "payment",
        date: p.paidAt || p.createdAt,
        title: `Payment Received: ${formatCurrency(p.collected)}`,
        description: `Order: ${p.orderId} · Outstanding: ${formatCurrency(p.outstanding)}`,
        ownerId: p.ownerId,
        status: p.status,
        badgeColor: "cyan",
      });
    }
  });

  // Sort descending by date
  return events
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 15)
    .map((e) => ({
      ...e,
      formattedDate: formatDisplayDate(e.date),
    }));
}
