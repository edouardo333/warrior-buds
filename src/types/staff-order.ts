// Staff-only types for Bud Guardian V2.1's "Espace employé" (/staff/orders).
// Kept separate from types/order.ts (the shape the chatbot reads) so
// internal-only data — notes, audit trail, staff names — can never leak into
// the customer-facing Bud Guardian engine by accident.

import type { OrderStatus } from "./order";

export type StaffRole = "employee" | "manager" | "admin";

export type TimelineEntry = {
  id: string;
  status: OrderStatus;
  at: string;
  by: string;
};

export type InternalNote = {
  id: string;
  text: string;
  at: string;
  by: string;
};

export type ReminderKind = "received" | "confirmation-needed" | "ready" | "abandoned-cart";

export type ReminderLogEntry = {
  id: string;
  kind: ReminderKind;
  at: string;
  by: string;
};

export type AuditLogEntry = {
  id: string;
  at: string;
  by: string;
  orderId: string | null;
  action: string;
};

export type OrderStaffMeta = {
  timeline: TimelineEntry[];
  notes: InternalNote[];
  reminders: ReminderLogEntry[];
  manuallyAbandoned: boolean;
};
