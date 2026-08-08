"use client";

// Bud Guardian V7 — staff-side read/write access for /staff/team. Mirrors
// risk-actions.ts's shape: a subscription over the staff directory
// (data/bud-guardian/staff-directory.ts), plus gated mutations that check
// hasPermission before calling through to staff-engine.ts and log every
// attempt — allowed or denied — to the shared audit log.
//
// Role/status changes are admin-only (permissions.ts) and additionally
// refuse to demote or suspend the last active admin — a guard rail, not a
// permission check, so it logs as "denied" too but with its own reason.

import { useSyncExternalStore } from "react";
import type { StaffMember, StaffMemberStatus } from "@/types/staff";
import type { StaffRole } from "@/types/staff-order";
import { findStaffMemberById, getStaffMembers, subscribeStaffDirectory } from "@/data/bud-guardian/staff-directory";
import { getStaffActionLabel, hasPermission } from "./permissions";
import { getRoleLabel, type StaffSession } from "./staff-auth";
import { getStaffStatusLabel, isLastActiveAdmin, updateStaffMemberRole, updateStaffMemberStatus } from "@/lib/bud-guardian/staff-engine";
import { logAuditEntry } from "./audit-log";

export function useStaffDirectory(): StaffMember[] {
  return useSyncExternalStore(subscribeStaffDirectory, getStaffMembers, getStaffMembers);
}

export function useStaffMember(id: string | null): StaffMember | null {
  const members = useStaffDirectory();
  if (!id) return null;
  return members.find((member) => member.id === id) ?? null;
}

// ---------------------------------------------------------------------------
// Gated staff mutations
// ---------------------------------------------------------------------------

function deny(session: StaffSession, action: string, memberId: string, description: string): void {
  logAuditEntry({
    actor: session.name,
    role: session.role,
    module: "staff",
    action,
    entityId: memberId,
    description,
    outcome: "denied",
  });
}

export function staffChangeRole(id: string, role: StaffRole, session: StaffSession): StaffMember | undefined {
  if (!hasPermission(session.role, "staff.roleChange")) {
    deny(session, "staff.roleChange", id, `${getStaffActionLabel("staff.roleChange", "fr")} refusé — rôle "${session.role}" insuffisant.`);
    return undefined;
  }
  const member = findStaffMemberById(id);
  if (!member) return undefined;
  if (member.role === role) return member;
  if (role !== "admin" && isLastActiveAdmin(member)) {
    deny(session, "staff.roleChange", id, `Changement de rôle refusé — ${member.name} est le dernier administrateur actif.`);
    return undefined;
  }
  const updated = updateStaffMemberRole(id, role);
  if (!updated) return undefined;
  logAuditEntry({
    actor: session.name,
    role: session.role,
    module: "staff",
    action: "staff.roleChange",
    entityId: id,
    description: `Rôle modifié — ${member.name} : ${getRoleLabel(member.role, "fr")} → ${getRoleLabel(role, "fr")}`,
    metadata: { previousRole: member.role, newRole: role },
  });
  return updated;
}

export function staffChangeStatus(id: string, status: StaffMemberStatus, session: StaffSession): StaffMember | undefined {
  if (!hasPermission(session.role, "staff.statusChange")) {
    deny(
      session,
      "staff.statusChange",
      id,
      `${getStaffActionLabel("staff.statusChange", "fr")} refusé — rôle "${session.role}" insuffisant.`
    );
    return undefined;
  }
  const member = findStaffMemberById(id);
  if (!member) return undefined;
  if (member.status === status) return member;
  if (status !== "active" && isLastActiveAdmin(member)) {
    deny(session, "staff.statusChange", id, `Changement de statut refusé — ${member.name} est le dernier administrateur actif.`);
    return undefined;
  }
  const updated = updateStaffMemberStatus(id, status);
  if (!updated) return undefined;
  logAuditEntry({
    actor: session.name,
    role: session.role,
    module: "staff",
    action: "staff.statusChange",
    entityId: id,
    description: `Statut modifié — ${member.name} : ${getStaffStatusLabel(member.status, "fr")} → ${getStaffStatusLabel(status, "fr")}`,
    metadata: { previousStatus: member.status, newStatus: status },
  });
  return updated;
}
