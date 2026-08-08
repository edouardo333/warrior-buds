// Bud Guardian V7 — Staff Management types. Models the demo staff roster
// shown at /staff/team: a managed record per person (role, status, profile)
// distinct from StaffSession (lib/staff/staff-auth.ts), which only
// represents "who is logged into this tab right now". Kept separate from
// types/staff-order.ts (order-timeline/CRM types) since this is about the
// staff themselves, not the orders they touch.

import type { StaffRole } from "./staff-order";

export type StaffMemberStatus = "active" | "suspended";

export type StaffMember = {
  id: string; // e.g. "STF-1001"
  name: string;
  role: StaffRole;
  code: string; // matches the DEMO_ACCOUNTS access code used to log in as this person
  email: string;
  status: StaffMemberStatus;
  joinedAt: string;
  updatedAt: string;
};
