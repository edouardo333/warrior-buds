// Bud Guardian V12.2 — persistent local identity for moderation/ban
// enforcement. Deliberately NOT fingerprinting: no canvas/font/IP/user-agent
// collection, just one opaque random token generated once and stored in
// localStorage — exactly the same pattern as every other id in this app
// (CustomerAccount.id, order ids, staff sessions). A signed-in customer is
// ALSO identified by their real CustomerAccount.id (data/shop/account-store.ts),
// so a ban survives signing in/out on the same browser. Clearing site data
// or switching browsers/devices is a known limitation of this client-storage-
// only demo build with no server/database — see the V12.2 report's
// "Persistence limitation" note.

import { getSession } from "@/data/shop/account-store";

const DEVICE_ID_KEY = "wb-guardian-device-id-v1";

function generateId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `dev-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

// Stable per-browser-profile token — created once, then read on every later
// visit. Never derived from anything about the device/browser itself (no
// fingerprinting), just a random value this app generated and remembers.
export function getGuardianDeviceId(): string {
  if (typeof window === "undefined") return "server";
  try {
    const existing = window.localStorage.getItem(DEVICE_ID_KEY);
    if (existing) return existing;
    const created = generateId();
    window.localStorage.setItem(DEVICE_ID_KEY, created);
    return created;
  } catch {
    // Storage unavailable (private browsing) — moderation still works for
    // THIS session, it just won't persist across a reload.
    return generateId();
  }
}

export type GuardianIdentity = { type: "device" | "account"; id: string };

// Every identity currently tied to this browser: always the device id, plus
// the signed-in customer account id when there is one. A ban is checked
// against, and applied to, ALL of these together (see moderation-engine.ts)
// so signing in/out on the same device can never be used to dodge an active
// ban or reset the escalation count.
export function getGuardianIdentities(): GuardianIdentity[] {
  const identities: GuardianIdentity[] = [{ type: "device", id: getGuardianDeviceId() }];
  const accountId = getSession()?.accountId;
  if (accountId) identities.push({ type: "account", id: accountId });
  return identities;
}
