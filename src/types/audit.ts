// Bud Guardian V6 — shared audit-log types. One entry shape for every
// module (Orders, Payments, Risk, Inventory, Customers) instead of each
// module hand-rolling its own log record, so "who did what, when, and was
// it allowed" is answered the same way everywhere.

import type { StaffRole } from "./staff-order";

export type AuditModule = "orders" | "payments" | "risk" | "inventory" | "customers" | "staff";

// StaffRole for a real staff-driven action; "system" for automatic,
// non-staff entries (e.g. the inventory engine's own unmatched-item
// warnings); "unknown" only ever appears on entries migrated from the pre-V6
// per-module audit logs, which never recorded a role.
export type AuditActorRole = StaffRole | "system" | "unknown";

// "allowed" (default) — the action went through. "denied" — a role without
// permission attempted a gated action and it was rejected as a no-op.
// "warning" — not a staff action at all, a system-detected condition worth
// staff attention (e.g. an order item that couldn't be matched to a
// product).
export type AuditOutcome = "allowed" | "denied" | "warning";

export type AuditEntry = {
  id: string;
  at: string;
  actor: string;
  role: AuditActorRole;
  module: AuditModule;
  /** Stable, machine-ish key (e.g. "order.status.changed") — not for display. */
  action: string;
  entityId: string | null;
  /** Human-readable summary — this is what the UI renders. */
  description: string;
  metadata?: Record<string, unknown>;
  outcome?: AuditOutcome;
};
