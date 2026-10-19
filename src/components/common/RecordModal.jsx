import { useEffect, useState } from "react";
import {
  X,
  Link as LinkIcon,
  User,
  Building,
  Calendar,
  DollarSign,
  Tag,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { formatCurrency } from "../../utils/formatUtils.js";
import { formatDisplayDate } from "../../utils/dateUtils.js";
import {
  leads,
  quotations,
  deals,
  orders,
  payments,
  users,
} from "../../data/dummyData.js";
import "./RecordModal.scss";

/**
 * Interactive Drill-Down Modal with full relationship tracing:
 * Lead <-> Quotation <-> Deal <-> Order <-> Payment
 */
export function RecordModal({ record: initialRecord, type: initialType, onClose }) {
  const [history, setHistory] = useState([
    { record: initialRecord, type: initialType },
  ]);

  const current = history[history.length - 1];
  const { record, type } = current || {};

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!record) return null;

  const navigateTo = (newRecord, newType) => {
    if (!newRecord) return;
    setHistory((prev) => [...prev, { record: newRecord, type: newType }]);
  };

  const navigateBack = () => {
    if (history.length > 1) {
      setHistory((prev) => prev.slice(0, prev.length - 1));
    }
  };

  // Find owner object
  const owner = users.find((u) => u.id === record.ownerId) || {
    name: record.ownerId || "Unassigned",
  };

  // Relationship Finders
  let linkedLead = null;
  let linkedQuotes = [];
  let linkedDeals = [];
  let linkedOrders = [];
  let linkedPayments = [];

  if (type === "lead") {
    linkedLead = record;
    linkedQuotes = quotations.filter((q) => q.leadId === record.id);
    linkedDeals = deals.filter((d) => d.leadId === record.id);
    const dealIds = new Set(linkedDeals.map((d) => d.id));
    linkedOrders = orders.filter((o) => dealIds.has(o.dealId));
    const orderIds = new Set(linkedOrders.map((o) => o.id));
    linkedPayments = payments.filter((p) => orderIds.has(p.orderId));
  } else if (type === "quotation") {
    linkedLead = leads.find((l) => l.id === record.leadId);
    linkedQuotes = [record];
    linkedDeals = deals.filter((d) => d.quotationId === record.id);
    const dealIds = new Set(linkedDeals.map((d) => d.id));
    linkedOrders = orders.filter((o) => dealIds.has(o.dealId));
    const orderIds = new Set(linkedOrders.map((o) => o.id));
    linkedPayments = payments.filter((p) => orderIds.has(p.orderId));
  } else if (type === "deal") {
    linkedLead = leads.find((l) => l.id === record.leadId);
    const quote = quotations.find((q) => q.id === record.quotationId);
    if (quote) linkedQuotes = [quote];
    linkedDeals = [record];
    linkedOrders = orders.filter((o) => o.dealId === record.id);
    const orderIds = new Set(linkedOrders.map((o) => o.id));
    linkedPayments = payments.filter((p) => orderIds.has(p.orderId));
  } else if (type === "order") {
    const deal = deals.find((d) => d.id === record.dealId);
    if (deal) {
      linkedDeals = [deal];
      linkedLead = leads.find((l) => l.id === deal.leadId);
      const quote = quotations.find((q) => q.id === deal.quotationId);
      if (quote) linkedQuotes = [quote];
    }
    linkedOrders = [record];
    linkedPayments = payments.filter((p) => p.orderId === record.id);
  } else if (type === "payment") {
    const order = orders.find((o) => o.id === record.orderId);
    if (order) {
      linkedOrders = [order];
      const deal = deals.find((d) => d.id === order.dealId);
      if (deal) {
        linkedDeals = [deal];
        linkedLead = leads.find((l) => l.id === deal.leadId);
        const quote = quotations.find((q) => q.id === deal.quotationId);
        if (quote) linkedQuotes = [quote];
      }
    }
    linkedPayments = [record];
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "won":
      case "converted":
      case "accepted":
      case "completed":
      case "paid":
        return "badge--success";
      case "qualified":
      case "in_progress":
      case "sent":
      case "partial":
        return "badge--primary";
      case "new":
      case "draft":
      case "open":
      case "pending":
        return "badge--warning";
      case "unqualified":
      case "lost":
      case "rejected":
      case "expired":
      case "overdue":
      case "cancelled":
        return "badge--danger";
      default:
        return "badge--neutral";
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-header__title-group">
            {history.length > 1 && (
              <button
                className="modal-back-btn"
                onClick={navigateBack}
                aria-label="Back to previous record"
              >
                ← Back
              </button>
            )}
            <span className="modal-entity-tag">{type.toUpperCase()}</span>
            <h2 className="modal-title">
              {record.name || record.service || record.id}
            </h2>
            <span className={`badge ${getStatusBadgeClass(record.status)}`}>
              {record.status}
            </span>
          </div>

          <button
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="modal-body">
          {/* Key Attributes Grid */}
          <div className="modal-section">
            <h4 className="modal-section-title">Record Details</h4>
            <div className="modal-attr-grid">
              <div className="modal-attr-card">
                <div className="modal-attr-label">
                  <Tag size={12} /> ID
                </div>
                <div className="modal-attr-value font-mono">{record.id}</div>
              </div>

              <div className="modal-attr-card">
                <div className="modal-attr-label">
                  <User size={12} /> Owner
                </div>
                <div className="modal-attr-value">{owner.name}</div>
              </div>

              <div className="modal-attr-card">
                <div className="modal-attr-label">
                  <Building size={12} /> Department
                </div>
                <div className="modal-attr-value">{record.department || "Sales"}</div>
              </div>

              <div className="modal-attr-card">
                <div className="modal-attr-label">
                  <Calendar size={12} /> Created Date
                </div>
                <div className="modal-attr-value">
                  {formatDisplayDate(record.createdAt)}
                </div>
              </div>

              {record.service && (
                <div className="modal-attr-card">
                  <div className="modal-attr-label">
                    <ShieldCheck size={12} /> Service
                  </div>
                  <div className="modal-attr-value">{record.service}</div>
                </div>
              )}

              {record.amount !== undefined && (
                <div className="modal-attr-card">
                  <div className="modal-attr-label">
                    <DollarSign size={12} /> Amount
                  </div>
                  <div className="modal-attr-value font-semibold">
                    {formatCurrency(record.amount)}
                  </div>
                </div>
              )}

              {record.value !== undefined && (
                <div className="modal-attr-card">
                  <div className="modal-attr-label">
                    <DollarSign size={12} /> Deal Value
                  </div>
                  <div className="modal-attr-value font-semibold">
                    {formatCurrency(record.value)}
                  </div>
                </div>
              )}

              {record.collected !== undefined && (
                <div className="modal-attr-card">
                  <div className="modal-attr-label">
                    <DollarSign size={12} /> Collected
                  </div>
                  <div className="modal-attr-value text-success font-semibold">
                    {formatCurrency(record.collected)}
                  </div>
                </div>
              )}

              {record.outstanding !== undefined && (
                <div className="modal-attr-card">
                  <div className="modal-attr-label">
                    <DollarSign size={12} /> Outstanding
                  </div>
                  <div className="modal-attr-value text-danger font-semibold">
                    {formatCurrency(record.outstanding)}
                  </div>
                </div>
              )}

              {record.source && (
                <div className="modal-attr-card">
                  <div className="modal-attr-label">
                    <Tag size={12} /> Source
                  </div>
                  <div className="modal-attr-value">{record.source}</div>
                </div>
              )}

              {record.priority && (
                <div className="modal-attr-card">
                  <div className="modal-attr-label">
                    <Tag size={12} /> Priority
                  </div>
                  <div className="modal-attr-value uppercase font-semibold">
                    {record.priority}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* CRM Relationship Chain */}
          <div className="modal-section">
            <h4 className="modal-section-title">
              <LinkIcon size={14} /> CRM Relationships Trail
            </h4>

            <div className="modal-relations-list">
              {/* Linked Lead */}
              {linkedLead && type !== "lead" && (
                <div
                  className="modal-relation-card"
                  onClick={() => navigateTo(linkedLead, "lead")}
                >
                  <div className="modal-relation-info">
                    <span className="modal-relation-type">LEAD</span>
                    <strong className="modal-relation-name">{linkedLead.name}</strong>
                    <span className="modal-relation-sub">
                      {linkedLead.id} · {linkedLead.source}
                    </span>
                  </div>
                  <span className={`badge ${getStatusBadgeClass(linkedLead.status)}`}>
                    {linkedLead.status}
                  </span>
                  <ArrowRight size={14} className="modal-relation-arrow" />
                </div>
              )}

              {/* Linked Quotations */}
              {linkedQuotes.length > 0 && type !== "quotation" && (
                <div className="modal-relation-group">
                  <span className="modal-group-label">Quotations ({linkedQuotes.length})</span>
                  {linkedQuotes.map((q) => (
                    <div
                      key={q.id}
                      className="modal-relation-card"
                      onClick={() => navigateTo(q, "quotation")}
                    >
                      <div className="modal-relation-info">
                        <span className="modal-relation-type">QUOTATION</span>
                        <strong className="modal-relation-name">{q.service}</strong>
                        <span className="modal-relation-sub">
                          {q.id} · {formatCurrency(q.amount)}
                        </span>
                      </div>
                      <span className={`badge ${getStatusBadgeClass(q.status)}`}>
                        {q.status}
                      </span>
                      <ArrowRight size={14} className="modal-relation-arrow" />
                    </div>
                  ))}
                </div>
              )}

              {/* Linked Deals */}
              {linkedDeals.length > 0 && type !== "deal" && (
                <div className="modal-relation-group">
                  <span className="modal-group-label">Deals ({linkedDeals.length})</span>
                  {linkedDeals.map((d) => (
                    <div
                      key={d.id}
                      className="modal-relation-card"
                      onClick={() => navigateTo(d, "deal")}
                    >
                      <div className="modal-relation-info">
                        <span className="modal-relation-type">DEAL</span>
                        <strong className="modal-relation-name">{d.service}</strong>
                        <span className="modal-relation-sub">
                          {d.id} · {formatCurrency(d.value)} · Priority: {d.priority}
                        </span>
                      </div>
                      <span className={`badge ${getStatusBadgeClass(d.status)}`}>
                        {d.status}
                      </span>
                      <ArrowRight size={14} className="modal-relation-arrow" />
                    </div>
                  ))}
                </div>
              )}

              {/* Linked Orders */}
              {linkedOrders.length > 0 && type !== "order" && (
                <div className="modal-relation-group">
                  <span className="modal-group-label">Orders ({linkedOrders.length})</span>
                  {linkedOrders.map((o) => (
                    <div
                      key={o.id}
                      className="modal-relation-card"
                      onClick={() => navigateTo(o, "order")}
                    >
                      <div className="modal-relation-info">
                        <span className="modal-relation-type">ORDER</span>
                        <strong className="modal-relation-name">{o.service}</strong>
                        <span className="modal-relation-sub">
                          {o.id} · Due: {formatDisplayDate(o.dueDate)}
                        </span>
                      </div>
                      <span className={`badge ${getStatusBadgeClass(o.status)}`}>
                        {o.status}
                      </span>
                      <ArrowRight size={14} className="modal-relation-arrow" />
                    </div>
                  ))}
                </div>
              )}

              {/* Linked Payments */}
              {linkedPayments.length > 0 && type !== "payment" && (
                <div className="modal-relation-group">
                  <span className="modal-group-label">Payments ({linkedPayments.length})</span>
                  {linkedPayments.map((p) => (
                    <div
                      key={p.id}
                      className="modal-relation-card"
                      onClick={() => navigateTo(p, "payment")}
                    >
                      <div className="modal-relation-info">
                        <span className="modal-relation-type">PAYMENT</span>
                        <strong className="modal-relation-name">
                          {formatCurrency(p.amount)}
                        </strong>
                        <span className="modal-relation-sub">
                          {p.id} · Collected: {formatCurrency(p.collected)} · Outstanding: {formatCurrency(p.outstanding)}
                        </span>
                      </div>
                      <span className={`badge ${getStatusBadgeClass(p.status)}`}>
                        {p.status}
                      </span>
                      <ArrowRight size={14} className="modal-relation-arrow" />
                    </div>
                  ))}
                </div>
              )}

              {linkedQuotes.length === 0 &&
                linkedDeals.length === 0 &&
                linkedOrders.length === 0 &&
                linkedPayments.length === 0 && (
                  <div className="modal-no-relations">
                    No downstream records linked yet.
                  </div>
                )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button className="btn btn--secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default RecordModal;
