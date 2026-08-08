// Bud Guardian V2.1/V2.2 — simulated employee authentication for
// /staff/orders and /staff/payments. This is a local demo gate only: a
// fixed set of named accounts (see DEMO_ACCOUNTS below), held in
// sessionStorage so a session clears when the tab closes. No real accounts,
// no password hashing, nothing sent over the network. Swap for real auth
// (Supabase, etc.) later — see AGENTS.md.

import type { StaffRole } from "@/types/staff-order";

export type StaffSession = {
  name: string;
  role: StaffRole;
  loginAt: string;
};

const SESSION_KEY = "wb-staff-session";

const listeners = new Set<() => void>();

// readSession() is used directly as a useSyncExternalStore snapshot, which
// requires a stable reference between calls — JSON.parse-ing sessionStorage
// fresh every call would return a new object each time and spin React into
// an infinite render loop. Cache it and only recompute after notify().
let sessionCache: StaffSession | null | undefined;

function notify(): void {
  sessionCache = undefined;
  for (const listener of listeners) listener();
}

// Lets consumers read the session via useSyncExternalStore instead of an
// effect + setState-on-mount — avoids a hydration mismatch between the
// server (no session) and the client (session may already be in
// sessionStorage) without violating the "no setState in effect" rule.
export function subscribeSessionChange(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export const STAFF_ROLES: StaffRole[] = ["employee", "manager", "supervisor", "admin"];

const ROLE_LABELS: Record<StaffRole, { fr: string; en: string }> = {
  employee: { fr: "Employé", en: "Employee" },
  manager: { fr: "Gestionnaire", en: "Manager" },
  supervisor: { fr: "Superviseur", en: "Supervisor" },
  admin: { fr: "Administrateur", en: "Administrator" },
};

export function getRoleLabel(role: StaffRole, locale: "fr" | "en"): string {
  return ROLE_LABELS[role][locale];
}

export type DemoAccount = {
  name: string;
  role: StaffRole;
  code: string;
};

// Fixed demo accounts — each access code logs the person in as that exact
// name + role, no free-form name/role entry. Deliberately fictional and
// local only; grants access to every /staff/* page, since routing only
// gates on having a session at all — what a role can actually DO once
// inside is governed by lib/staff/permissions.ts, not by which pages it can
// reach.
//
// Bud Guardian V6 — one working demo login per role (Employee, Manager,
// Supervisor, Admin). Before V6 the account labelled "Admin" actually held
// the "manager" role and no account could reach "admin" at all; both are
// fixed here — WB2026 keeps its original code but is now honestly labelled
// "Manager", and a real ADM2026 admin account was added.
export const DEMO_ACCOUNTS: DemoAccount[] = [
  { name: "Camille", role: "employee", code: "EMP2026" },
  { name: "Manager", role: "manager", code: "WB2026" },
  { name: "Supervisor", role: "supervisor", code: "SUP2026" },
  { name: "Admin", role: "admin", code: "ADM2026" },
];

export function findDemoAccount(code: string): DemoAccount | null {
  const normalized = code.trim().toUpperCase();
  return DEMO_ACCOUNTS.find((account) => account.code === normalized) ?? null;
}

export function readSession(): StaffSession | null {
  if (sessionCache !== undefined) return sessionCache;
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(SESSION_KEY);
    sessionCache = raw ? (JSON.parse(raw) as StaffSession) : null;
  } catch {
    sessionCache = null;
  }
  return sessionCache;
}

export function startSession(name: string, role: StaffRole): StaffSession {
  const session: StaffSession = {
    name: name.trim() || ROLE_LABELS[role].fr,
    role,
    loginAt: new Date().toISOString(),
  };
  if (typeof window !== "undefined") {
    try {
      window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch {
      // Storage unavailable — session still works for this render.
    }
  }
  notify();
  return session;
}

export function endSession(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // Nothing to clean up.
  }
  notify();
}
