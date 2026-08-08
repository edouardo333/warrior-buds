"use client";

import { useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { getFulfillmentLabel, getOrderTotal, maskName } from "@/lib/bud-guardian/order-engine";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import {
  addInternalNote,
  maskEmailPartial,
  maskPhonePartial,
  markOrderAbandoned,
  restoreAbandonedOrder,
  sendReminder,
  type StaffOrderView,
} from "@/lib/staff/order-actions";
import { hasPermission, minRoleFor } from "@/lib/staff/permissions";
import { getRoleLabel, type StaffSession } from "@/lib/staff/staff-auth";
import type { ReminderKind } from "@/types/staff-order";
import OrderStatusEditor from "./OrderStatusEditor";
import CustomerConfirmation from "./CustomerConfirmation";
import OrderTimeline from "./OrderTimeline";

const TEXT = {
  fr: {
    items: "Articles",
    total: "Total",
    pickup: "Récupération",
    contact: "Contact",
    notes: "Notes internes (invisibles au client)",
    notesPlaceholder: "Ajouter une note pour l'équipe…",
    addNote: "Ajouter",
    noNotes: "Aucune note pour l'instant.",
    abandon: "Marquer comme abandonnée",
    restore: "Restaurer la commande",
    abandonedHint: "Basée sur l'inactivité (plus de 4h) ou un marquage manuel.",
    reminders: "Rappels simulés",
    remindersSent: "Rappels envoyés",
    noReminders: "Aucun rappel envoyé.",
    close: "Fermer",
    restoreRestricted: (role: string) => `Réservé aux rôles ${role} et plus.`,
  },
  en: {
    items: "Items",
    total: "Total",
    pickup: "Pickup",
    contact: "Contact",
    notes: "Internal notes (hidden from customer)",
    notesPlaceholder: "Add a note for the team…",
    addNote: "Add",
    noNotes: "No notes yet.",
    abandon: "Mark as abandoned",
    restore: "Restore order",
    abandonedHint: "Based on inactivity (over 4h) or a manual flag.",
    reminders: "Simulated reminders",
    remindersSent: "Reminders sent",
    noReminders: "No reminders sent.",
    close: "Close",
    restoreRestricted: (role: string) => `Reserved for ${role} and above.`,
  },
} as const;

const REMINDER_KINDS: ReminderKind[] = ["received", "confirmation-needed", "ready", "abandoned-cart"];

const REMINDER_LABELS: Record<ReminderKind, { fr: string; en: string }> = {
  received: { fr: "Commande reçue", en: "Order received" },
  "confirmation-needed": { fr: "Confirmation requise", en: "Confirmation needed" },
  ready: { fr: "Commande prête", en: "Order ready" },
  "abandoned-cart": { fr: "Panier abandonné", en: "Abandoned cart" },
};

function formatCurrency(amount: number, locale: "fr" | "en"): string {
  return new Intl.NumberFormat(locale === "fr" ? "fr-CA" : "en-CA", { style: "currency", currency: "CAD" }).format(amount);
}

function formatDateTime(iso: string, locale: "fr" | "en"): string {
  return new Intl.DateTimeFormat(locale === "fr" ? "fr-CA" : "en-CA", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
}

export default function OrderDetails({
  order,
  session,
  onClose,
}: {
  order: StaffOrderView;
  session: StaffSession;
  onClose?: () => void;
}) {
  const { locale } = useLanguage();
  const t = TEXT[locale];
  const [noteText, setNoteText] = useState("");
  const canRestore = hasPermission(session.role, "order.restoreAbandoned");

  function handleAddNote(event: FormEvent) {
    event.preventDefault();
    if (!noteText.trim()) return;
    addInternalNote(order.id, noteText, session);
    setNoteText("");
  }

  const notes = [...order.staffMeta.notes].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
  const reminders = [...order.staffMeta.reminders].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-sm text-white/50">{order.id}</p>
          <h2 className="text-lg font-semibold text-white/90">{maskName(order.customerName)}</h2>
          <p className="mt-0.5 text-xs text-white/45">
            {t.contact}: {maskPhonePartial(order.phone)} · {maskEmailPartial(order.email)}
          </p>
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
        <h3 className="text-sm font-semibold uppercase tracking-wide text-white/50">{t.items}</h3>
        <ul className="mt-2 flex flex-col gap-1.5 text-sm text-white/75">
          {order.items.map((item, index) => (
            <li key={index} className="flex justify-between gap-4">
              <span>
                {item.quantity} × {item.name}
              </span>
              <span className="text-white/50">{formatCurrency(item.unitPrice * item.quantity, locale)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-2 flex justify-between border-t border-white/10 pt-2 text-sm font-semibold text-white/90">
          <span>{t.total}</span>
          <span>{formatCurrency(getOrderTotal(order), locale)}</span>
        </div>
        <p className="mt-1 text-xs text-white/45">
          {t.pickup}: {getFulfillmentLabel(order.fulfillmentMethod, locale)}
        </p>
      </div>

      <OrderStatusEditor order={order} session={session} />
      <CustomerConfirmation order={order} session={session} />

      <div className="flex flex-wrap items-center gap-3">
        {order.staffMeta.manuallyAbandoned ? (
          <button
            type="button"
            disabled={!canRestore}
            title={!canRestore ? t.restoreRestricted(getRoleLabel(minRoleFor("order.restoreAbandoned"), locale)) : undefined}
            onClick={() => restoreAbandonedOrder(order.id, session)}
            className="rounded-xl border border-wb-guardian-green/50 bg-wb-guardian-green/10 px-3 py-2 text-sm font-medium text-wb-guardian-green disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t.restore}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => markOrderAbandoned(order.id, session)}
            className="rounded-xl border border-white/15 px-3 py-2 text-sm font-medium text-white/70 hover:text-white"
          >
            {t.abandon}
          </button>
        )}
        {order.isAbandoned && <span className="text-xs text-white/40">{t.abandonedHint}</span>}
        {order.staffMeta.manuallyAbandoned && !canRestore && (
          <span className="text-xs text-white/35">{t.restoreRestricted(getRoleLabel(minRoleFor("order.restoreAbandoned"), locale))}</span>
        )}
      </div>

      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-white/50">{t.reminders}</h3>
        <div className="mt-2 flex flex-wrap gap-2">
          {REMINDER_KINDS.map((kind) => (
            <button
              key={kind}
              type="button"
              onClick={() => sendReminder(order.id, kind, session)}
              className="rounded-full border border-wb-orange/30 bg-wb-orange/10 px-3 py-1.5 text-xs font-medium text-wb-orange hover:bg-wb-orange/20"
            >
              {REMINDER_LABELS[kind][locale]}
            </button>
          ))}
        </div>
        <div className="mt-2 text-xs text-white/45">
          <p className="font-medium text-white/55">{t.remindersSent}</p>
          {reminders.length === 0 ? (
            <p>{t.noReminders}</p>
          ) : (
            <ul className="mt-1 flex flex-col gap-0.5">
              {reminders.map((reminder) => (
                <li key={reminder.id}>
                  {REMINDER_LABELS[reminder.kind][locale]} — {formatDateTime(reminder.at, locale)} ({reminder.by})
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <OrderTimeline order={order} />

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
                  {formatDateTime(note.at, locale)} · {note.by}
                </p>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
