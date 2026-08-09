// Bud Guardian V12.2 — Autonomous Abuse Defense ban store. Mirrors every
// other store in this folder (audit-log.ts, orders-store.ts, payments.ts,
// risk.ts): a single module-level singleton, persisted to localStorage,
// mirrored across tabs via the `storage` event, one write primitive
// (upsertBanRecord). Records are keyed by moderation identity
// (`${type}:${identityId}` — see lib/bud-guardian/guardian-identity.ts) so a
// ban is a stable, per-identity record rather than a global list to scan.

import type { BanRecord } from "@/types/moderation";

const STORAGE_KEY = "wb-guardian-bans-v1";

function loadInitial(): Record<string, BanRecord> {
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as Record<string, BanRecord>;
    } catch {
      // Corrupt/unavailable storage — fall back to an empty ban list below.
    }
  }
  return {};
}

let records: Record<string, BanRecord> = loadInitial();
const listeners = new Set<() => void>();

function persist(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    // Storage full/unavailable (private browsing) — in-memory state still works.
  }
}

function notify(): void {
  for (const listener of listeners) listener();
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key !== STORAGE_KEY) return;
    records = loadInitial();
    notify();
  });
}

export function subscribeBanStore(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getBanRecord(key: string): BanRecord | undefined {
  return records[key];
}

export function getAllBanRecords(): BanRecord[] {
  return Object.values(records);
}

export function upsertBanRecord(record: BanRecord): void {
  records = { ...records, [record.key]: record };
  persist();
  notify();
}
