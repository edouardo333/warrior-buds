// Bud Guardian V6 — centralized staff permission model. Single source of
// truth for "can this role do X" across every module (Orders, Payments,
// Risk Engine, Inventory). Nothing outside this file should hard-code a
// role comparison for a sensitive action — call hasPermission() instead,
// and call it at the action layer (lib/staff/*-actions.ts), never only in a
// component. A component may use hasPermission()/canPerform() to decide
// what to render, but the mutation function itself must re-check — a button
// being hidden is not the security boundary.
//
// Hierarchy — each role inherits every permission of the roles below it:
//   employee (0) < manager (1) < supervisor (2) < admin (3)
//
// ---------------------------------------------------------------------------
// Permission matrix (V6, extended in V7)
// ---------------------------------------------------------------------------
// View access to all seven modules (Dashboard, Orders, Payments, Risk
// Engine, Customers, Inventory, Staff) is unchanged: every signed-in role
// can view every module — that was already true before V6 and nothing here
// narrows it, per the "don't redesign the app" constraint. What V6 adds
// (and V7's Staff Management follows) is consistent enforcement of the
// WRITE side, below:
//
//   Action                          | employee | manager | supervisor | admin
//   ---------------------------------|----------|---------|------------|------
//   order.statusForward (normal      |    ✅    |   ✅    |    ✅      |  ✅
//     workflow progression)          |          |         |            |
//   order.confirmationFlag           |    ✅    |   ✅    |    ✅      |  ✅
//   order.addNote                    |    ✅    |   ✅    |    ✅      |  ✅
//   order.sendReminder               |    ✅    |   ✅    |    ✅      |  ✅
//   order.markAbandoned              |    ✅    |   ✅    |    ✅      |  ✅
//   order.cancel                     |    ❌    |   ✅    |    ✅      |  ✅
//   order.statusRegress (move a      |    ❌    |   ✅    |    ✅      |  ✅
//     status backward, non-cancel)   |          |         |            |
//   order.restoreAbandoned           |    ❌    |   ✅    |    ✅      |  ✅
//   order.overridePaymentStatus      |    ❌    |   ✅    |    ✅      |  ✅
//     (manual payment/method edit    |          |         |            |
//     from the order confirmation    |          |         |            |
//     panel — same tier as confirm/  |          |         |            |
//     decline, it has the same       |          |         |            |
//     financial effect)              |          |         |            |
//   payment.confirm                  |    ❌    |   ✅    |    ✅      |  ✅
//   payment.decline                  |    ❌    |   ✅    |    ✅      |  ✅
//   payment.cancel (a reversal/      |    ❌    |   ❌    |    ✅      |  ✅
//     correction, not a normal       |          |         |            |
//     workflow step — supervisor's   |          |         |            |
//     "sensitive corrections" tier)  |          |         |            |
//   risk.approve                     |    ❌    |   ❌    |    ✅      |  ✅
//   risk.reject                      |    ❌    |   ❌    |    ✅      |  ✅
//   inventory.receive                |    ❌    |   ✅    |    ✅      |  ✅
//   inventory.adjust                 |    ❌    |   ✅    |    ✅      |  ✅
//   inventory.transfer               |    ❌    |   ✅    |    ✅      |  ✅
//   staff.roleChange (V7 — change    |    ❌    |   ❌    |    ❌      |  ✅
//     what role a staff member       |          |         |            |
//     holds)                         |          |         |            |
//   staff.statusChange (V7 —         |    ❌    |   ❌    |    ❌      |  ✅
//     activate/suspend a staff       |          |         |            |
//     member's demo access)          |          |         |            |
//
// customer.addNote / customer.addFollowUp / customer.setFollowUpStatus are
// deliberately NOT gated — they're collaborative internal notes, not
// destructive or financially sensitive, available to every role (unchanged
// from pre-V6 behaviour). They're still recorded in the shared audit log.

import type { StaffRole } from "@/types/staff-order";

export const ROLE_RANK: Record<StaffRole, number> = {
  employee: 0,
  manager: 1,
  supervisor: 2,
  admin: 3,
};

export type StaffAction =
  | "order.cancel"
  | "order.statusRegress"
  | "order.restoreAbandoned"
  | "order.overridePaymentStatus"
  | "payment.confirm"
  | "payment.decline"
  | "payment.cancel"
  | "risk.approve"
  | "risk.reject"
  | "inventory.receive"
  | "inventory.adjust"
  | "inventory.transfer"
  | "staff.roleChange"
  | "staff.statusChange";

// The permission matrix as data — the ONE place that decides which role
// tier a sensitive action requires. Every action listed here is enforced at
// its mutation in the matching lib/staff/*-actions.ts file, not just hidden
// in the UI.
const ACTION_MIN_ROLE: Record<StaffAction, StaffRole> = {
  "order.cancel": "manager",
  "order.statusRegress": "manager",
  "order.restoreAbandoned": "manager",
  "order.overridePaymentStatus": "manager",

  "payment.confirm": "manager",
  "payment.decline": "manager",
  "payment.cancel": "supervisor",

  "risk.approve": "supervisor",
  "risk.reject": "supervisor",

  "inventory.receive": "manager",
  "inventory.adjust": "manager",
  "inventory.transfer": "manager",

  // V7 — Staff Management. Reserved for admin: changing a colleague's role
  // or suspending their access is more sensitive than any write action
  // another module gates, so it sits above even the "supervisor" tier.
  "staff.roleChange": "admin",
  "staff.statusChange": "admin",
};

export function hasPermission(role: StaffRole, action: StaffAction): boolean {
  return ROLE_RANK[role] >= ROLE_RANK[ACTION_MIN_ROLE[action]];
}

// The minimum role an action needs — used by UI notices ("reserved for
// managers and above") so the copy can never drift from the actual gate.
export function minRoleFor(action: StaffAction): StaffRole {
  return ACTION_MIN_ROLE[action];
}

// Convenience for the inventory UI, which offers/hides its three write
// actions as a single group (they're all "manager" tier today) rather than
// checking each action separately.
export function canWriteInventory(role: StaffRole): boolean {
  return hasPermission(role, "inventory.adjust");
}

// Structured form of the matrix above — this is the data source for Staff
// Management's permissions overview (components/staff/PermissionMatrix.tsx),
// so it never has to re-derive the matrix from ACTION_MIN_ROLE by hand.
export type PermissionModule = "orders" | "payments" | "risk" | "inventory" | "staff";

const ACTION_MODULE: Record<StaffAction, PermissionModule> = {
  "order.cancel": "orders",
  "order.statusRegress": "orders",
  "order.restoreAbandoned": "orders",
  "order.overridePaymentStatus": "orders",
  "payment.confirm": "payments",
  "payment.decline": "payments",
  "payment.cancel": "payments",
  "risk.approve": "risk",
  "risk.reject": "risk",
  "inventory.receive": "inventory",
  "inventory.adjust": "inventory",
  "inventory.transfer": "inventory",
  "staff.roleChange": "staff",
  "staff.statusChange": "staff",
};

export const PERMISSION_MATRIX: { module: PermissionModule; action: StaffAction; minRole: StaffRole }[] = (
  Object.entries(ACTION_MIN_ROLE) as [StaffAction, StaffRole][]
).map(([action, minRole]) => ({ module: ACTION_MODULE[action], action, minRole }));

// ---------------------------------------------------------------------------
// Display labels — Staff Management (V7) is the first surface that renders
// the matrix above for humans, so the module/action labels live here next to
// the data they describe, in the same fr/en shape every other module uses.
// ---------------------------------------------------------------------------

const MODULE_LABELS: Record<PermissionModule, { fr: string; en: string }> = {
  orders: { fr: "Commandes", en: "Orders" },
  payments: { fr: "Paiements", en: "Payments" },
  risk: { fr: "Risk Engine", en: "Risk Engine" },
  inventory: { fr: "Inventaire", en: "Inventory" },
  staff: { fr: "Personnel", en: "Staff" },
};

export function getStaffModuleLabel(module: PermissionModule, locale: "fr" | "en"): string {
  return MODULE_LABELS[module][locale];
}

const ACTION_LABELS: Record<StaffAction, { fr: string; en: string }> = {
  "order.cancel": { fr: "Annuler une commande", en: "Cancel an order" },
  "order.statusRegress": { fr: "Reculer le statut d'une commande", en: "Move an order status backward" },
  "order.restoreAbandoned": { fr: "Restaurer une commande abandonnée", en: "Restore an abandoned order" },
  "order.overridePaymentStatus": { fr: "Modifier manuellement le paiement", en: "Manually override payment status" },
  "payment.confirm": { fr: "Confirmer un paiement", en: "Confirm a payment" },
  "payment.decline": { fr: "Refuser un paiement", en: "Decline a payment" },
  "payment.cancel": { fr: "Annuler un paiement", en: "Cancel a payment" },
  "risk.approve": { fr: "Approuver une analyse de risque", en: "Approve a risk assessment" },
  "risk.reject": { fr: "Rejeter une analyse de risque", en: "Reject a risk assessment" },
  "inventory.receive": { fr: "Réceptionner du stock", en: "Receive stock" },
  "inventory.adjust": { fr: "Ajuster le stock", en: "Adjust stock" },
  "inventory.transfer": { fr: "Transférer du stock", en: "Transfer stock" },
  "staff.roleChange": { fr: "Changer le rôle d'un membre du personnel", en: "Change a staff member's role" },
  "staff.statusChange": { fr: "Activer / suspendre un membre du personnel", en: "Activate / suspend a staff member" },
};

export function getStaffActionLabel(action: StaffAction, locale: "fr" | "en"): string {
  return ACTION_LABELS[action][locale];
}
