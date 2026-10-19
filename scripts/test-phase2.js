import assert from "node:assert";
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
} from "../src/data/dummyData.js";
import { getDateRange, getPreviousRange, formatDateRangeDisplay } from "../src/utils/dateUtils.js";
import { computeKPIs } from "../src/services/kpiService.js";
import { getLeadFunnelMetrics, getLeadSourceMetrics } from "../src/services/leadService.js";
import { getServiceWiseQuotations } from "../src/services/quotationService.js";
import { getDealStatusBreakdown } from "../src/services/dealService.js";
import { getPaymentStatusBreakdown } from "../src/services/paymentService.js";

console.log("==================================================");
console.log(" Running Phase 2 Verification & Analytics Tests  ");
console.log("==================================================\n");

// 1. Verify Datasets Exist and are Connected
console.log("Test 1: Datasets integrity & relationships");
assert(leads.length >= 65, `Expected >= 65 leads, got ${leads.length}`);
assert(quotations.length >= 40, `Expected >= 40 quotations, got ${quotations.length}`);
assert(deals.length >= 30, `Expected >= 30 deals, got ${deals.length}`);
assert(orders.length >= 25, `Expected >= 25 orders, got ${orders.length}`);
assert(payments.length >= 25, `Expected >= 25 payments, got ${payments.length}`);
assert(users.length === 8, `Expected 8 users, got ${users.length}`);
assert(departments.length === 4, `Expected 4 departments, got ${departments.length}`);
assert(services.length === 10, `Expected 10 services, got ${services.length}`);
assert(leadSources.length === 8, `Expected 8 lead sources, got ${leadSources.length}`);

// Test foreign key relationships
quotations.forEach((q) => {
  const lead = leads.find((l) => l.id === q.leadId);
  assert(lead, `Quotation ${q.id} references nonexistent lead ${q.leadId}`);
  const user = users.find((u) => u.id === q.ownerId);
  assert(user, `Quotation ${q.id} references nonexistent user ${q.ownerId}`);
});

deals.forEach((d) => {
  const quote = quotations.find((q) => q.id === d.quotationId);
  assert(quote, `Deal ${d.id} references nonexistent quotation ${d.quotationId}`);
});

orders.forEach((o) => {
  const deal = deals.find((d) => d.id === o.dealId);
  assert(deal, `Order ${o.id} references nonexistent deal ${o.dealId}`);
});

payments.forEach((p) => {
  const order = orders.find((o) => o.id === p.orderId);
  assert(order, `Payment ${p.id} references nonexistent order ${p.orderId}`);
});
console.log("  ✔ All dataset foreign keys and references validated successfully.\n");

// 2. Date Ranges & Previous Period Calculation
console.log("Test 2: Date presets & previous-period calculations");
const baseDate = new Date("2026-10-18T12:00:00");

// Today
const todayRange = getDateRange("today", "", "", baseDate);
const yesterdayRange = getPreviousRange(todayRange);
console.log("  Today range:", formatDateRangeDisplay(todayRange));
console.log("  Prev range: ", formatDateRangeDisplay(yesterdayRange));
const todayDiffHours = (todayRange.end.getTime() - todayRange.start.getTime() + 1) / (1000 * 3600);
assert.strictEqual(todayDiffHours, 24, "Today range should be 24 hours");
const yestDiffHours = (yesterdayRange.end.getTime() - yesterdayRange.start.getTime() + 1) / (1000 * 3600);
assert.strictEqual(yestDiffHours, 24, "Yesterday range should be 24 hours");

// Last 7 Days
const sevenDayRange = getDateRange("7days", "", "", baseDate);
const prevSevenRange = getPreviousRange(sevenDayRange);
console.log("  7 Days range: ", formatDateRangeDisplay(sevenDayRange));
console.log("  Prev 7 range: ", formatDateRangeDisplay(prevSevenRange));
const sevenDayDiff = Math.round((sevenDayRange.end.getTime() - sevenDayRange.start.getTime() + 1) / (1000 * 3600 * 24));
assert.strictEqual(sevenDayDiff, 7, "7 Days range should be exactly 7 days");
const prevSevenDiff = Math.round((prevSevenRange.end.getTime() - prevSevenRange.start.getTime() + 1) / (1000 * 3600 * 24));
assert.strictEqual(prevSevenDiff, 7, "Previous 7 Days range should be exactly 7 days");

// Last 30 Days
const thirtyDayRange = getDateRange("30days", "", "", baseDate);
const prevThirtyRange = getPreviousRange(thirtyDayRange);
console.log("  30 Days range: ", formatDateRangeDisplay(thirtyDayRange));
console.log("  Prev 30 range: ", formatDateRangeDisplay(prevThirtyRange));
const thirtyDayDiff = Math.round((thirtyDayRange.end.getTime() - thirtyDayRange.start.getTime() + 1) / (1000 * 3600 * 24));
assert.strictEqual(thirtyDayDiff, 30, "30 Days range should be exactly 30 days");
const prevThirtyDiff = Math.round((prevThirtyRange.end.getTime() - prevThirtyRange.start.getTime() + 1) / (1000 * 3600 * 24));
assert.strictEqual(prevThirtyDiff, 30, "Previous 30 Days range should be exactly 30 days");

// Custom Range
const customRange = getDateRange("custom", "2026-10-01", "2026-10-10", baseDate);
const prevCustomRange = getPreviousRange(customRange);
console.log("  Custom range:  ", formatDateRangeDisplay(customRange));
console.log("  Prev custom:   ", formatDateRangeDisplay(prevCustomRange));
const customDiff = Math.round((customRange.end.getTime() - customRange.start.getTime() + 1) / (1000 * 3600 * 24));
assert.strictEqual(customDiff, 10, "Custom range Oct 01 - Oct 10 should be 10 days");
console.log("  ✔ Date ranges and previous period durations verified.\n");

// 3. KPI Calculation Under Different Filters
console.log("Test 3: KPI calculations under various filters");

// 3a. Default: Last 30 Days, All Users, All Departments
const kpi30 = computeKPIs({
  leads, quotations, deals, orders, payments,
  range: thirtyDayRange,
  userId: "all",
  department: "all",
});

console.log("  [30 Days, All Users]");
console.log(`    Total Leads:    ${kpi30.leads.value} (Change: ${kpi30.leads.change.label})`);
console.log(`    Conversion %:   ${kpi30.conversionRate.value.toFixed(1)}% (Change: ${kpi30.conversionRate.change.label})`);
console.log(`    Quotations:     ${kpi30.quotations.value} (Change: ${kpi30.quotations.change.label})`);
console.log(`    Quote Value:    ₹${kpi30.quoteValue.value.toLocaleString("en-IN")} (Change: ${kpi30.quoteValue.change.label})`);
console.log(`    Deals Won:      ${kpi30.deals.value} (Change: ${kpi30.deals.change.label})`);
console.log(`    Revenue:        ₹${kpi30.revenue.value.toLocaleString("en-IN")} (Change: ${kpi30.revenue.change.label})`);
console.log(`    Collected:      ₹${kpi30.collections.value.toLocaleString("en-IN")} (Change: ${kpi30.collections.change.label})`);
console.log(`    Outstanding:    ₹${kpi30.outstanding.value.toLocaleString("en-IN")} (Change: ${kpi30.outstanding.change.label})`);

assert(kpi30.leads.value > 0, "30-day leads must be > 0");
assert(kpi30.deals.value > 0, "30-day deals won must be > 0");
assert(kpi30.revenue.value > 0, "30-day revenue must be > 0");
assert(kpi30.collections.value > 0, "30-day collections must be > 0");

// 3b. Filter: Today
const kpiToday = computeKPIs({
  leads, quotations, deals, orders, payments,
  range: todayRange,
  userId: "all",
  department: "all",
});
console.log("\n  [Today, All Users]");
console.log(`    Total Leads:    ${kpiToday.leads.value} (vs Yesterday: ${kpiToday.leads.previousValue})`);
console.log(`    Quotations:     ${kpiToday.quotations.value} (vs Yesterday: ${kpiToday.quotations.previousValue})`);
assert(kpiToday.leads.value <= kpi30.leads.value, "Today leads must be <= 30-day leads");

// 3c. Filter: Last 7 Days
const kpi7 = computeKPIs({
  leads, quotations, deals, orders, payments,
  range: sevenDayRange,
  userId: "all",
  department: "all",
});
console.log("\n  [7 Days, All Users]");
console.log(`    Total Leads:    ${kpi7.leads.value} (vs Prev 7 Days: ${kpi7.leads.previousValue})`);
console.log(`    Revenue:        ₹${kpi7.revenue.value.toLocaleString("en-IN")} (vs Prev 7 Days: ₹${kpi7.revenue.previousValue.toLocaleString("en-IN")})`);
assert(kpi7.leads.value <= kpi30.leads.value, "7-day leads must be <= 30-day leads");
assert(kpiToday.leads.value <= kpi7.leads.value, "Today leads must be <= 7-day leads");

// 3d. User Filtering: U001 (Arjun Mehta)
const kpiUser = computeKPIs({
  leads, quotations, deals, orders, payments,
  range: thirtyDayRange,
  userId: "U001",
  department: "all",
});
console.log("\n  [30 Days, User U001: Arjun Mehta]");
console.log(`    Total Leads:    ${kpiUser.leads.value}`);
console.log(`    Deals Won:      ${kpiUser.deals.value}`);
console.log(`    Revenue:        ₹${kpiUser.revenue.value.toLocaleString("en-IN")}`);
assert(kpiUser.leads.value > 0, "U001 leads should be > 0");
assert(kpiUser.leads.value < kpi30.leads.value, "U001 leads should be less than all-users total");
assert(kpiUser._raw.curLeads.every((l) => l.ownerId === "U001"), "All filtered leads must have ownerId U001");

// 3e. Department Filtering: Marketing
const kpiDept = computeKPIs({
  leads, quotations, deals, orders, payments,
  range: thirtyDayRange,
  userId: "all",
  department: "Marketing",
});
console.log("\n  [30 Days, Department: Marketing]");
console.log(`    Total Leads:    ${kpiDept.leads.value}`);
assert(kpiDept.leads.value > 0, "Marketing leads should be > 0");
assert(kpiDept._raw.curLeads.every((l) => l.department === "Marketing"), "All filtered leads must belong to Marketing");
console.log("  ✔ All filter variations update KPI values correctly and isolate matching cohorts.\n");

// 4. Analytics Services Verification
console.log("Test 4: Analytics services calculation");
const funnel = getLeadFunnelMetrics(kpi30._raw.curLeads);
console.log("  Funnel stages:", funnel.map((f) => `${f.stage}: ${f.count} (${f.percentage}%)`).join(" -> "));
assert(funnel.length === 4, "Funnel should have 4 stages");
assert.strictEqual(funnel[0].count, kpi30.leads.value, "Total leads in funnel must equal KPI leads");

const sources = getLeadSourceMetrics(kpi30._raw.curLeads);
console.log("  Top Lead Source:", sources[0].source, `(${sources[0].count} leads, ${sources[0].percentage}%)`);
assert(sources.length > 0, "Lead sources must not be empty");

const servicesBreakdown = getServiceWiseQuotations(kpi30._raw.curQuotes);
console.log("  Top Quotation Service:", servicesBreakdown[0].service, `(Total ₹${servicesBreakdown[0].totalAmount})`);
assert(servicesBreakdown.length > 0, "Service-wise breakdown must not be empty");

const dealStats = getDealStatusBreakdown(kpi30._raw.curDeals);
console.log(`  Deals Pipeline: Won: ${dealStats.won.count}, Open: ${dealStats.open.count}, Lost: ${dealStats.lost.count}, Win Rate: ${dealStats.winRate}%`);

const paymentStats = getPaymentStatusBreakdown(kpi30._raw.curPayments);
console.log(`  Payments: Billed: ₹${paymentStats.totalBilled}, Collected: ₹${paymentStats.totalCollected}, Efficiency: ${paymentStats.collectionEfficiency}%`);
console.log("  ✔ Analytics services (funnel, sources, services, deals, payments) verified.\n");

console.log("==================================================");
console.log("  ALL PHASE 2 VERIFICATION TESTS PASSED (100%)    ");
console.log("==================================================");
