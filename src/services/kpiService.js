import { filterDatasetPair, filterByOwner } from "../utils/filterUtils.js";
import { calculatePeriodChange, calculateSum } from "../utils/analyticsUtils.js";
import { getPreviousRange } from "../utils/dateUtils.js";

/**
 * Compute all 8 KPI metrics from the raw datasets + current filter context.
 * Cards: New Leads, Qualified, Converted, Unqualified, Conversion Rate %,
 *        Quotations Created, Deals Created, Revenue Realized
 */
export function computeKPIs({
  leads = [],
  quotations = [],
  deals = [],
  orders = [],
  payments = [],
  range,
  userId = "all",
  department = "all",
}) {
  const prevRange = getPreviousRange(range);

  // Filter current and previous datasets
  const leadsPair = filterDatasetPair(leads, { range, prevRange, userId, department, dateField: "createdAt" });
  const quotesPair = filterDatasetPair(quotations, { range, prevRange, userId, department, dateField: "createdAt" });
  const dealsPair = filterDatasetPair(deals, { range, prevRange, userId, department, dateField: "createdAt" });
  const ordersPair = filterDatasetPair(orders, { range, prevRange, userId, department, dateField: "createdAt" });
  const paymentsPair = filterDatasetPair(payments, { range, prevRange, userId, department, dateField: "createdAt" });

  const curLeads = leadsPair.current;
  const prevLeads = leadsPair.previous;

  const curQuotes = quotesPair.current;
  const prevQuotes = quotesPair.previous;

  const curDeals = dealsPair.current;
  const prevDeals = dealsPair.previous;

  const curPayments = paymentsPair.current;
  const prevPayments = paymentsPair.previous;

  // 1. New Leads (all leads in period)
  const newLeadsChange = calculatePeriodChange(curLeads.length, prevLeads.length);

  // 2. Qualified Leads
  const curQualified = curLeads.filter((l) => l.status === "qualified").length;
  const prevQualified = prevLeads.filter((l) => l.status === "qualified").length;
  const qualifiedChange = calculatePeriodChange(curQualified, prevQualified);

  // 3. Converted Leads
  const curConverted = curLeads.filter((l) => l.status === "converted").length;
  const prevConverted = prevLeads.filter((l) => l.status === "converted").length;
  const convertedChange = calculatePeriodChange(curConverted, prevConverted);

  // 4. Unqualified Leads
  const curUnqualified = curLeads.filter((l) => l.status === "unqualified").length;
  const prevUnqualified = prevLeads.filter((l) => l.status === "unqualified").length;
  const unqualifiedChange = calculatePeriodChange(curUnqualified, prevUnqualified);

  // 5. Conversion Rate (converted / total)
  const curConvRate = curLeads.length ? (curConverted / curLeads.length) * 100 : 0;
  const prevConvRate = prevLeads.length ? (prevConverted / prevLeads.length) * 100 : 0;
  const convChange = calculatePeriodChange(curConvRate, prevConvRate);

  // 6. Quotations Created
  const quotesChange = calculatePeriodChange(curQuotes.length, prevQuotes.length);
  const curQuoteVal = calculateSum(curQuotes, "amount");
  const prevQuoteVal = calculateSum(prevQuotes, "amount");
  const quoteValChange = calculatePeriodChange(curQuoteVal, prevQuoteVal);

  // 7. Deals Created (all deals, not just won)
  const dealsChange = calculatePeriodChange(curDeals.length, prevDeals.length);
  const curWonDeals = curDeals.filter((d) => d.status === "won");
  const prevWonDeals = prevDeals.filter((d) => d.status === "won");

  // 8. Revenue (won deals value)
  const curRevenue = calculateSum(curWonDeals, "value");
  const prevRevenue = calculateSum(prevWonDeals, "value");
  const revenueChange = calculatePeriodChange(curRevenue, prevRevenue);

  // Additional metrics for other sections
  const curCollected = calculateSum(curPayments, "collected");
  const prevCollected = calculateSum(prevPayments, "collected");
  const collectChange = calculatePeriodChange(curCollected, prevCollected);

  const curOutstanding = calculateSum(curPayments, "outstanding");
  const prevOutstanding = calculateSum(prevPayments, "outstanding");
  const outstandingChange = calculatePeriodChange(curOutstanding, prevOutstanding);

  const ownerPayments = filterByOwner(payments, userId, department);
  const totalPortfolioOutstanding = calculateSum(ownerPayments, "outstanding");

  return {
    // ── 8 Mandatory Top KPI Cards ──
    newLeads: {
      value: curLeads.length,
      change: newLeadsChange,
      label: "New Leads",
      previousValue: prevLeads.length,
    },
    qualifiedLeads: {
      value: curQualified,
      change: qualifiedChange,
      label: "Qualified Leads",
    },
    convertedLeads: {
      value: curConverted,
      change: convertedChange,
      label: "Converted Leads",
    },
    unqualifiedLeads: {
      value: curUnqualified,
      change: unqualifiedChange,
      label: "Unqualified Leads",
    },
    conversionRate: {
      value: curConvRate,
      change: convChange,
      label: "Conversion Rate",
      convertedCount: curConverted,
      totalCount: curLeads.length,
      previousValue: prevConvRate,
    },
    quotations: {
      value: curQuotes.length,
      change: quotesChange,
      label: "Quotations Created",
      subValue: curQuoteVal,
      previousValue: prevQuotes.length,
    },
    deals: {
      value: curDeals.length,
      change: dealsChange,
      label: "Deals Created",
      totalDeals: curDeals.length,
      wonDeals: curWonDeals.length,
      previousValue: prevDeals.length,
    },
    revenue: {
      value: curRevenue,
      change: revenueChange,
      label: "Revenue Realized",
      previousValue: prevRevenue,
    },

    // ── Extended metrics for sub-sections ──
    leads: {
      value: curLeads.length,
      change: newLeadsChange,
      label: "Total Leads",
      previousValue: prevLeads.length,
    },
    quoteValue: {
      value: curQuoteVal,
      change: quoteValChange,
      label: "Quote Value",
      previousValue: prevQuoteVal,
    },
    collections: {
      value: curCollected,
      change: collectChange,
      label: "Collected",
      previousValue: prevCollected,
    },
    outstanding: {
      value: curOutstanding > 0 ? curOutstanding : totalPortfolioOutstanding,
      change: outstandingChange,
      label: "Outstanding",
      periodOutstanding: curOutstanding,
      portfolioOutstanding: totalPortfolioOutstanding,
      previousValue: prevOutstanding,
    },

    // Raw filtered subsets for drill-downs or chart components
    _raw: {
      curLeads,
      prevLeads,
      curQuotes,
      prevQuotes,
      curDeals,
      prevDeals,
      curWonDeals,
      curOrders: ordersPair.current,
      prevOrders: ordersPair.previous,
      curPayments,
      prevPayments,
    },
  };
}
