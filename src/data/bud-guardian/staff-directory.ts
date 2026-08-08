// Bud Guardian V7 — Staff Management. Live, mutable staff-roster ledger
// backing /staff/team, mirroring data/bud-guardian/risk.ts's shape: a single
// module-level store, persisted to localStorage and mirrored across tabs via
// the `storage` event. Seeded once from the four DEMO_ACCOUNTS
// (lib/staff/staff-auth.ts) — the login gate — so the directory always
// starts in sync with who can actually sign in. After that the two are
// independent records: this store can be edited (role/status) by an admin
// through Staff Management, DEMO_ACCOUNTS itself cannot — there's still no
// real auth, only a richer local demo profile layered on top of it.

import type { StaffMember } from "@/types/staff";
import { DEMO_ACCOUNTS } from "@/lib/staff/staff-auth";

const STORAGE_KEY = "wb-guardian-staff-directory-v1";

// Fictional, staggered join dates (seniority roughly follows role) so the
// directory doesn't look like everyone started on the same day.
const SEED_JOIN_DATES: Record<string, string> = {
  EMP2026: "2024-03-11T09:00:00.000Z",
  WB2026: "2023-01-16T09:00:00.000Z",
  SUP2026: "2022-06-02T09:00:00.000Z",
  ADM2026: "2021-09-01T09:00:00.000Z",
};

function seed(): StaffMember[] {
  return DEMO_ACCOUNTS.map((account, index) => {
    const joinedAt = SEED_JOIN_DATES[account.code] ?? new Date().toISOString();
    return {
      id: `STF-100${index + 1}`,
      name: account.name,
      role: account.role,
      code: account.code,
      email: `${account.name.toLowerCase()}@warriorbuds.demo`,
      status: "active",
      joinedAt,
      updatedAt: joinedAt,
    };
  });
}

function loadInitial(): StaffMember[] {
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as StaffMember[];
    } catch {
      // Corrupt/unavailable storage — fall through to a fresh seed below.
    }
    return seed();
  }
  return [];
}

let members: StaffMember[] = loadInitial();
const listeners = new Set<() => void>();

function persist(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
  } catch {
    // Storage full/unavailable (private browsing) — in-memory state still works.
  }
}

function notify(): void {
  for (const listener of listeners) listener();
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key !== STORAGE_KEY || !event.newValue) return;
    try {
      members = JSON.parse(event.newValue) as StaffMember[];
      notify();
    } catch {
      // Ignore malformed cross-tab payloads.
    }
  });
}

export function subscribeStaffDirectory(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getStaffMembers(): StaffMember[] {
  return members;
}

export function findStaffMemberById(id: string): StaffMember | undefined {
  return members.find((member) => member.id === id);
}

export function findStaffMemberByCode(code: string): StaffMember | undefined {
  const normalized = code.trim().toUpperCase();
  return members.find((member) => member.code === normalized);
}

export function replaceStaffMember(id: string, updater: (member: StaffMember) => StaffMember): StaffMember | undefined {
  let updated: StaffMember | undefined;
  members = members.map((member) => {
    if (member.id !== id) return member;
    updated = updater(member);
    return updated;
  });
  if (updated) {
    persist();
    notify();
  }
  return updated;
}
