"use client";

// Bud Guardian V8 — staff-side read access for /staff/analytics. Mirrors
// every other lib/staff/*-actions.ts file's shape (StaffHub.tsx's comment
// says it best): this is pure aggregation over the exact same hooks the
// Orders/Payments/Risk/Inventory/Customers dashboards already use — no
// parallel store, no new business logic. The only new piece is
// lib/bud-guardian/analytics-engine.ts's pure computation, applied here via
// useMemo so it only re-runs when the underlying data (or the selected date
// range) actually changes.
//
// Read-only module: every signed-in role can view Analytics, same as every
// other module's view access (see lib/staff/permissions.ts's header) — there
// is nothing here to gate because there is nothing here to mutate.

import { useMemo } from "react";
import { useStaffOrders } from "./order-actions";
import { useStaffPayments } from "./payment-actions";
import { useStaffRiskAssessments } from "./risk-actions";
import { useInventoryMovements, useStaffInventory } from "./inventory-actions";
import { useStaffCustomers } from "./customer-actions";
import { computeAnalyticsSnapshot, type AnalyticsRangeKey, type AnalyticsSnapshot } from "@/lib/bud-guardian/analytics-engine";

export function useAnalyticsSnapshot(range: AnalyticsRangeKey): AnalyticsSnapshot {
  const orders = useStaffOrders();
  const payments = useStaffPayments();
  const assessments = useStaffRiskAssessments();
  const products = useStaffInventory();
  const movements = useInventoryMovements();
  const customers = useStaffCustomers();

  return useMemo(
    () => computeAnalyticsSnapshot(orders, payments, assessments, products, movements, customers, range),
    [orders, payments, assessments, products, movements, customers, range]
  );
}
