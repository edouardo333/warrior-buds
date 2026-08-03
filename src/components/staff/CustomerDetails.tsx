"use client";

import { useState, type FormEvent } from "react";
import { Bell, CreditCard, Package, Shield, Star, X } from "lucide-react";
import { getOrderTotal, getStatusLabel, maskName } from "@/lib/bud-guardian/order-engine";
import { getCustomerSegmentLabel, getCustomerStatusLabel } from "@/lib/bud-guardian/customer-engine";
import { getPaymentStatusLabel } from "@/lib/bud-guardian/payment-engine";
import { getRiskLevelLabel } from "@/lib/bud-guardian/risk-engine";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { maskEmailPartial, maskPhonePartial } from "@/lib/staff/order-actions";
import { addCustomerFollowUp, addCustomerNote, setCustomerFollowUpStatus, type StaffCustomerView } from "@/lib/staff/customer-actions";
import { findOrderById } from "@/data/bud-guardian/orders-store";
import { RISK_LEVEL_COLORS } from "./RiskTable";
import { PAYMENT_STATUS_COLORS } from "./PaymentsTable";
import { STATUS_COLORS } from "./OrderStatusEditor";
import { CUSTOMER_SEGMENT_COLORS, CUSTOMER_STATUS_COLORS } from "./CustomersTable";

const TEXT = {
  fr: {
    contact: "Contact",
    quickActions: "Actions rapides",
    viewOrders: "Voir les commandes",
    viewPayments: "Voir les paiements",
    viewRisk: "Voir le risque",
    totalSpent: "Total dépensé",
    orders: "Commandes",
    avgOrder: "Panier moyen",
    frequency: "Fréquence d'achat",
    frequencyNotEnough: "Pas assez d'historique",
    frequencyEvery: (days: number) => `Tous les ${days} j.`,
    firstVisit: "Première visite",
    lastVisit: "Dernière visite",
    risk: "Score de risque",
    noRisk: "Aucune analyse",
    latestPayment: "Dernier paiement",
    noPayment: "Aucun paiement",
    favorites: "Produits favoris",
    noFavorites: "Aucune préférence identifiée.",
    unit: (n: number) => `${n} unité${n > 1 ? "s" : ""}`,
    history: "Historique des commandes",
    followUps: "Rappels de suivi",
    followUpPlaceholder: "Note de suivi…",
    followUpAdd: "Programmer",
    followUpEmpty: "Aucun rappel programmé.",
    markDone: "Fait",
    dismiss: "Ignorer",
    notes: "Notes internes (invisibles au client)",
    notesPlaceholder: "Ajouter une note pour l'équipe…",
    addNote: "Ajouter",
    noNotes: "Aucune note pour l'instant.",
    close: "Fermer",
  },
  en: {
    contact: "Contact",
    quickActions: "Quick actions",
    viewOrders: "View orders",
    viewPayments: "View payments",
    viewRisk: "View risk",
    totalSpent: "Total spent",
    orders: "Orders",
    avgOrder: "Average order",
    frequency: "Purchase frequency",
    frequencyNotEnough: "Not enough history",
    frequencyEvery: (days: number) => `Every ${days} days`,
    firstVisit: "First visit",
    lastVisit: "Last visit",
    risk: "Risk score",
    noRisk: "No assessment",
    latestPayment: "Latest payment",
    noPayment: "No payment",
    favorites: "Favorite products",
    noFavorites: "No preference identified yet.",
    unit: (n: number) => `${n} unit${n > 1 ? "s" : ""}`,
    history: "Order history",
    followUps: "Follow-up reminders",
    followUpPlaceholder: "Follow-up note…",
    followUpAdd: "Schedule",
    followUpEmpty: "No reminder scheduled.",
    markDone: "Done",
    dismiss: "Dismiss",
    notes: "Internal notes (hidden from customer)",
    notesPlaceholder: "Add a note for the team…",
    addNote: "Add",
    noNotes: "No notes yet.",
    close: "Close",
  },
} as const;

function formatCurrency(amount: number, locale: "fr" | "en"): string {
  return new Intl.NumberFormat(locale === "fr" ? "fr-CA" : "en-CA", { style: "currency", currency: "CAD" }).format(amount);
}

function formatDate(iso: string, locale: "fr" | "en"): string {
  return new Intl.DateTimeFormat(locale === "fr" ? "fr-CA" : "en-CA", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
}

function formatDateShort(iso: string, locale: "fr" | "en"): string {
  return new Intl.DateTimeFormat(locale === "fr" ? "fr-CA" : "en-CA", { dateStyle: "medium" }).format(new Date(iso));
}

export default function CustomerDetails({
  customer,
  actor,
  onClose,
}: {
  customer: StaffCustomerView;
  actor: string;
  onClose?: () => void;
}) {
  const { locale } = useLanguage();
  const t = TEXT[locale];
  const [noteText, setNoteText] = useState("");
  const [followUpText, setFollowUpText] = useState("");
  const [followUpDue, setFollowUpDue] = useState("");

  const statusColor = CUSTOMER_STATUS_COLORS[customer.status];
  const segmentColor = CUSTOMER_SEGMENT_COLORS[customer.segment];
  const riskColor = customer.latestRiskLevel ? RISK_LEVEL_COLORS[customer.latestRiskLevel] : null;
  const paymentColor = customer.latestPaymentStatus ? PAYMENT_STATUS_COLORS[customer.latestPaymentStatus] : null;

  const orders = customer.orderIds
    .map((id) => findOrderById(id))
    .filter((order): order is NonNullable<typeof order> => Boolean(order))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const notes = [...customer.meta.notes].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
  const followUps = [...customer.meta.followUps].sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime());

  function handleAddNote(event: FormEvent) {
    event.preventDefault();
    if (!noteText.trim()) return;
    addCustomerNote(customer.id, noteText, actor);
    setNoteText("");
  }

  function handleAddFollowUp(event: FormEvent) {
    event.preventDefault();
    if (!followUpText.trim() || !followUpDue) return;
    addCustomerFollowUp(customer.id, followUpText, new Date(followUpDue).toISOString(), actor);
    setFollowUpText("");
    setFollowUpDue("");
  }

  return (
    <div className="wb-risk-details-in flex flex-col gap-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-sm text-white/50">{customer.id}</p>
          <h2 className="text-lg font-semibold text-white/90">{maskName(customer.name)}</h2>
          <p className="mt-0.5 text-xs text-white/45">
            {t.contact}: {maskPhonePartial(customer.phone)} · {maskEmailPartial(customer.email)}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <span
              className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium"
              style={{ borderColor: statusColor.solid, background: `rgba(${statusColor.rgb}, 0.14)`, color: statusColor.solid }}
            >
              {getCustomerStatusLabel(customer.status, locale)}
            </span>
            <span
              className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium"
              style={{ borderColor: segmentColor.solid, background: `rgba(${segmentColor.rgb}, 0.14)`, color: segmentColor.solid }}
            >
              {getCustomerSegmentLabel(customer.segment, locale)}
            </span>
          </div>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label={t.close}
            className="rounded-full border border-white/10 p-1.5 text-white/60 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-white/50">{t.quickActions}</h3>
        <div className="mt-2 flex flex-wrap gap-2">
          <a
            href="/staff/orders"
            className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-xs font-medium text-white/70 transition-colors duration-200 hover:border-wb-orange/50 hover:text-white"
          >
            <Package className="h-3.5 w-3.5" />
            {t.viewOrders}
          </a>
          <a
            href="/staff/payments"
            className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-xs font-medium text-white/70 transition-colors duration-200 hover:border-wb-orange/50 hover:text-white"
          >
            <CreditCard className="h-3.5 w-3.5" />
            {t.viewPayments}
          </a>
          <a
            href="/staff/security"
            className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-xs font-medium text-white/70 transition-colors duration-200 hover:border-wb-orange/50 hover:text-white"
          >
            <Shield className="h-3.5 w-3.5" />
            {t.viewRisk}
          </a>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-xs uppercase tracking-wide text-white/45">{t.totalSpent}</p>
          <p className="mt-1 font-semibold text-white/90">{formatCurrency(customer.totalSpent, locale)}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-white/45">{t.orders}</p>
          <p className="mt-1 text-white/85">{customer.orderCount}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-white/45">{t.avgOrder}</p>
          <p className="mt-1 text-white/85">{formatCurrency(customer.averageOrderValue, locale)}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-white/45">{t.frequency}</p>
          <p className="mt-1 text-white/85">
            {customer.purchaseFrequencyDays === null ? t.frequencyNotEnough : t.frequencyEvery(Math.round(customer.purchaseFrequencyDays))}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-white/45">{t.firstVisit}</p>
          <p className="mt-1 text-white/85">{formatDateShort(customer.firstOrderAt, locale)}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-white/45">{t.lastVisit}</p>
          <p className="mt-1 text-white/85">{formatDateShort(customer.lastOrderAt, locale)}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-white/10 bg-white/[0.02] px-3.5 py-3">
          <p className="text-xs uppercase tracking-wide text-white/45">{t.risk}</p>
          {riskColor && customer.latestRiskLevel && customer.latestRiskScore !== null ? (
            <span
              className="mt-1.5 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium"
              style={{ borderColor: riskColor.solid, background: `rgba(${riskColor.rgb}, 0.14)`, color: riskColor.solid }}
            >
              {getRiskLevelLabel(customer.latestRiskLevel, locale)} · {customer.latestRiskScore}/100
            </span>
          ) : (
            <p className="mt-1.5 text-xs text-white/40">{t.noRisk}</p>
          )}
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.02] px-3.5 py-3">
          <p className="text-xs uppercase tracking-wide text-white/45">{t.latestPayment}</p>
          {paymentColor && customer.latestPaymentStatus ? (
            <span
              className="mt-1.5 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium"
              style={{ borderColor: paymentColor.solid, background: `rgba(${paymentColor.rgb}, 0.14)`, color: paymentColor.solid }}
            >
              {getPaymentStatusLabel(customer.latestPaymentStatus, locale)}
            </span>
          ) : (
            <p className="mt-1.5 text-xs text-white/40">{t.noPayment}</p>
          )}
        </div>
      </div>

      <div>
        <h3 className="flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-white/50">
          <Star className="h-3.5 w-3.5" />
          {t.favorites}
        </h3>
        {customer.favoriteProducts.length === 0 ? (
          <p className="mt-2 text-sm text-white/45">{t.noFavorites}</p>
        ) : (
          <ul className="mt-2 flex flex-col gap-1.5 text-sm">
            {customer.favoriteProducts.map((product) => (
              <li
                key={product.name}
                className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-3.5 py-2"
              >
                <span className="text-white/85">{product.name}</span>
                <span className="text-xs text-white/45">{t.unit(product.quantity)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-white/50">{t.history}</h3>
        <ul className="mt-3 flex flex-col gap-0">
          {orders.map((order, index) => {
            const color = STATUS_COLORS[order.status];
            const isLast = index === orders.length - 1;
            return (
              <li key={order.id} className="relative flex gap-3 pb-4 last:pb-0">
                {!isLast && <span className="absolute left-[5px] top-3 h-full w-px bg-white/10" />}
                <span
                  className="relative z-10 mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: color.solid, boxShadow: `0 0 0 3px rgba(${color.rgb}, 0.18)` }}
                />
                <div className="flex flex-1 flex-col">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-xs text-white/70">{order.id}</span>
                    <span className="text-sm font-medium text-white/85">{formatCurrency(getOrderTotal(order), locale)}</span>
                  </div>
                  <span className="text-xs text-white/45">
                    {formatDate(order.createdAt, locale)} · {getStatusLabel(order.status, locale)}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div>
        <h3 className="flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-white/50">
          <Bell className="h-3.5 w-3.5" />
          {t.followUps}
        </h3>
        <form onSubmit={handleAddFollowUp} className="mt-2 flex flex-wrap gap-2">
          <input
            type="text"
            value={followUpText}
            onChange={(e) => setFollowUpText(e.target.value)}
            placeholder={t.followUpPlaceholder}
            className="min-w-[160px] flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-foreground outline-none focus:border-wb-orange/60"
          />
          <input
            type="date"
            value={followUpDue}
            onChange={(e) => setFollowUpDue(e.target.value)}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-foreground outline-none focus:border-wb-orange/60"
          />
          <button type="submit" className="rounded-xl bg-wb-orange px-4 py-2 text-sm font-semibold text-black">
            {t.followUpAdd}
          </button>
        </form>
        <ul className="mt-3 flex flex-col gap-2 text-sm">
          {followUps.length === 0 ? (
            <p className="text-xs text-white/40">{t.followUpEmpty}</p>
          ) : (
            followUps.map((followUp) => (
              <li
                key={followUp.id}
                className={`flex items-center justify-between gap-3 rounded-xl border px-3.5 py-2.5 ${
                  followUp.status === "pending" ? "border-white/10 bg-black/20" : "border-white/5 bg-black/10 opacity-55"
                }`}
              >
                <div className="min-w-0">
                  <p className="truncate text-white/80">{followUp.note}</p>
                  <p className="mt-0.5 text-xs text-white/40">{formatDateShort(followUp.dueAt, locale)}</p>
                </div>
                {followUp.status === "pending" && (
                  <div className="flex shrink-0 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setCustomerFollowUpStatus(customer.id, followUp.id, "done")}
                      className="rounded-lg border border-wb-guardian-green/50 bg-wb-guardian-green/10 px-2.5 py-1 text-xs font-medium text-wb-guardian-green"
                    >
                      {t.markDone}
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomerFollowUpStatus(customer.id, followUp.id, "dismissed")}
                      className="rounded-lg border border-white/15 px-2.5 py-1 text-xs font-medium text-white/60 hover:text-white"
                    >
                      {t.dismiss}
                    </button>
                  </div>
                )}
              </li>
            ))
          )}
        </ul>
      </div>

      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-white/50">{t.notes}</h3>
        <form onSubmit={handleAddNote} className="mt-2 flex gap-2">
          <input
            type="text"
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder={t.notesPlaceholder}
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-foreground outline-none focus:border-wb-orange/60"
          />
          <button type="submit" className="rounded-xl bg-wb-orange px-4 py-2 text-sm font-semibold text-black">
            {t.addNote}
          </button>
        </form>
        <ul className="mt-3 flex flex-col gap-2 text-sm">
          {notes.length === 0 ? (
            <p className="text-xs text-white/40">{t.noNotes}</p>
          ) : (
            notes.map((note) => (
              <li key={note.id} className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white/75">
                <p>{note.text}</p>
                <p className="mt-1 text-xs text-white/40">
                  {formatDate(note.at, locale)} · {note.by}
                </p>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
