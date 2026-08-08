// Bud Guardian V7 — Staff Management engine. Pure mutations over the staff
// directory (data/bud-guardian/staff-directory.ts) plus a locale-aware
// status label, mirroring risk-engine.ts's shape: the engine performs the
// actual state change, the gate (hasPermission) and the audit-log write live
// one layer up in lib/staff/staff-actions.ts — same separation as every
// other module.

import type { StaffMember, StaffMemberStatus } from "@/types/staff";
import type { StaffRole } from "@/types/staff-order";
import { getStaffMembers, replaceStaffMember } from "@/data/bud-guardian/staff-directory";

const STATUS_LABELS: Record<StaffMemberStatus, { fr: string; en: string }> = {
  active: { fr: "Actif", en: "Active" },
  suspended: { fr: "Suspendu", en: "Suspended" },
};

export function getStaffStatusLabel(status: StaffMemberStatus, locale: "fr" | "en"): string {
  return STATUS_LABELS[status][locale];
}

// How many staff members currently hold the admin role AND are active —
// used to block demoting/suspending the last active admin, which would lock
// everyone out of Staff Management (there's no server-side reset for this
// demo, only a fresh browser profile / cleared localStorage).
export function countActiveAdmins(): number {
  return getStaffMembers().filter((member) => member.role === "admin" && member.status === "active").length;
}

export function isLastActiveAdmin(member: StaffMember): boolean {
  return member.role === "admin" && member.status === "active" && countActiveAdmins() <= 1;
}

export function updateStaffMemberRole(id: string, role: StaffRole): StaffMember | undefined {
  return replaceStaffMember(id, (member) => ({ ...member, role, updatedAt: new Date().toISOString() }));
}

export function updateStaffMemberStatus(id: string, status: StaffMemberStatus): StaffMember | undefined {
  return replaceStaffMember(id, (member) => ({ ...member, status, updatedAt: new Date().toISOString() }));
}
