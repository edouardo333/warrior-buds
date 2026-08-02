// Bud Guardian V2.1 — simulated employee authentication for /staff/orders.
// This is a local demo gate only: one shared access code + a display name
// picked at login, held in sessionStorage so it clears when the tab closes.
// No real accounts, no password hashing, nothing sent over the network.
// Swap for real auth (Supabase, etc.) later — see AGENTS.md.

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

// Demo-only credential, deliberately never rendered or interpolated into any
// UI string — the public build must not leak it. In a real deployment this
// is replaced entirely by proper authentication.
const DEMO_ACCESS_CODE = "WARRIOR-2026";

export const STAFF_ROLES: StaffRole[] = ["employee", "manager", "admin"];

const ROLE_LABELS: Record<StaffRole, { fr: string; en: string }> = {
  employee: { fr: "Employé", en: "Employee" },
  manager: { fr: "Gestionnaire", en: "Manager" },
  admin: { fr: "Administrateur", en: "Administrator" },
};

export function getRoleLabel(role: StaffRole, locale: "fr" | "en"): string {
  return ROLE_LABELS[role][locale];
}

export function verifyAccessCode(code: string): boolean {
  return code.trim().toUpperCase() === DEMO_ACCESS_CODE;
}

// Managers and admins can cancel orders; plain employees cannot — a small,
// forward-looking taste of the role separation the spec asks to plan for.
export function canCancelOrder(role: StaffRole): boolean {
  return role === "manager" || role === "admin";
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
