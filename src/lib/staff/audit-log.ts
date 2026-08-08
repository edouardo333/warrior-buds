"use client";

// Bud Guardian V6 — React subscription layer over the shared audit store
// (data/bud-guardian/audit-log.ts). Mirrors every other lib/staff/*.ts file's
// shape: the store itself lives in data/, this file only adds
// useSyncExternalStore on top, plus re-exports of the plain read/write
// functions so callers in lib/staff/*-actions.ts don't need a second import.

import { useSyncExternalStore } from "react";
import type { AuditEntry, AuditModule } from "@/types/audit";
import { getAuditLog, getAuditLogForModule, subscribeAuditLog } from "@/data/bud-guardian/audit-log";

export { logAuditEntry, hasAuditEntry, getAuditLog, getAuditLogForModule } from "@/data/bud-guardian/audit-log";

const EMPTY_LOG: AuditEntry[] = [];

// useSyncExternalStore requires getSnapshot to return a stable reference
// when nothing changed — getAuditLogForModule() filters fresh on every call,
// which would otherwise produce a new array (and an infinite render loop)
// every render. Cache per module, mirroring inventory-actions.ts's
// productMovementsCache, and invalidate once, globally, whenever the
// underlying store changes (not per hook instance).
let allCache: AuditEntry[] | null = null;
const moduleCache = new Map<AuditModule, AuditEntry[]>();

function invalidate(): void {
  allCache = null;
  moduleCache.clear();
}

subscribeAuditLog(invalidate);

function getSnapshot(module?: AuditModule): AuditEntry[] {
  if (!module) {
    if (!allCache) allCache = getAuditLog();
    return allCache;
  }
  let cached = moduleCache.get(module);
  if (!cached) {
    cached = getAuditLogForModule(module);
    moduleCache.set(module, cached);
  }
  return cached;
}

// No module filter -> the full cross-module log (not surfaced in any V6 UI
// yet, per spec, but available for the module-scoped hooks below and for
// whatever audit view comes after V6).
export function useAuditLog(module?: AuditModule): AuditEntry[] {
  return useSyncExternalStore(subscribeAuditLog, () => getSnapshot(module), () => EMPTY_LOG);
}
