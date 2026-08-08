// Bud Guardian V5.0 — Inventory engine. Pure business logic plus the
// automatic order-reconciliation pass, mirroring risk-engine.ts's shape:
// locale-driven labels, synchronous derivation, a single store-backed
// mutation path, and a `subscribeOrders`/`subscribePayments` re-run on
// change so /staff/inventory never needs a manual refresh.
//
// Integration boundaries (see AGENTS instructions — Orders, Payments, CRM,
// and Risk Engine business logic must never be modified):
//   - Orders: read-only via getOrders()/subscribeOrders() (already exported
//     by orders-store.ts). Stock is deducted/restored by matching
//     Order.items[].name against each product's matchKeywords — the only
//     viable no-edit hook, since OrderItem has no productId.
//   - Payments: read-only via subscribeOrders (a payment confirmation always
//     cascades into an order status change through payment-engine.ts's
//     confirmPayment, which is what actually flips stock) plus a direct
//     failed-payment gate (see shouldCommitStock) so a confirmed order whose
//     payment failed never commits stock.
//   - CRM / Risk Engine: read-only cross-references only (getRecentBuyers,
//     getRiskFlagForOrder below) — this module never writes into
//     customer-engine.ts or risk-engine.ts, and never extends risk.ts's
//     closed RiskFactorId union, since both are on the "do not modify" list.

import type { Locale } from "@/lib/i18n/types";
import type {
  InventoryCategory,
  InventoryLocation,
  InventoryMovement,
  InventoryProduct,
  MovementReason,
  MovementType,
  StockStatus,
} from "@/types/inventory";
import type { Order } from "@/types/order";
import { getOrders, subscribeOrders } from "@/data/bud-guardian/orders-store";
import { subscribePayments } from "@/data/bud-guardian/payments";
import { findRiskAssessmentByOrderId } from "@/data/bud-guardian/risk";
import {
  addMovement,
  findProductById,
  getInventoryMovements,
  getInventoryProducts,
  getOrderStockLinks,
  setOrderStockLink,
  updateProductLocation,
} from "@/data/bud-guardian/inventory-store";
// audit-log.ts is shared infrastructure (like orders-store.ts or risk.ts),
// not staff business logic, so importing it here doesn't invert the
// data -> engine -> staff-action layering described above.
import { hasAuditEntry, logAuditEntry } from "@/data/bud-guardian/audit-log";
import { getOrderTotal, maskName } from "./order-engine";

// ---------------------------------------------------------------------------
// Derived stock facts
// ---------------------------------------------------------------------------

export function getStockStatus(product: InventoryProduct): StockStatus {
  if (product.quantityOnHand <= 0) return "out-of-stock";
  if (product.quantityOnHand <= product.lowStockThreshold) return "low-stock";
  return "in-stock";
}

const EXPIRING_SOON_WINDOW_DAYS = 14;

export function daysUntilExpiration(product: InventoryProduct): number | null {
  if (!product.expirationDate) return null;
  return Math.ceil((new Date(product.expirationDate).getTime() - Date.now()) / (24 * 60 * 60 * 1000));
}

export function isExpiringSoon(product: InventoryProduct): boolean {
  const days = daysUntilExpiration(product);
  return days !== null && days >= 0 && days <= EXPIRING_SOON_WINDOW_DAYS;
}

export function isExpired(product: InventoryProduct): boolean {
  const days = daysUntilExpiration(product);
  return days !== null && days < 0;
}

export function getProfitMargin(product: InventoryProduct): number {
  if (product.sellingPrice <= 0) return 0;
  return (product.sellingPrice - product.purchaseCost) / product.sellingPrice;
}

export function getInventoryValue(products: InventoryProduct[]): number {
  return products.reduce((sum, p) => sum + p.quantityOnHand * p.purchaseCost, 0);
}

function isToday(iso: string): boolean {
  return new Date(iso).toDateString() === new Date().toDateString();
}

export function getTodayMovementCount(movements: InventoryMovement[]): number {
  return movements.filter((m) => isToday(m.at)).length;
}

// ---------------------------------------------------------------------------
// Name matching — the no-edit hook into Order.items[].name (see header)
// ---------------------------------------------------------------------------

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip combining accents (e.g. e-acute -> e)
    .toLowerCase()
    .trim();
}

export function matchProductByItemName(itemName: string): InventoryProduct | null {
  const normalized = normalizeText(itemName);
  let best: { product: InventoryProduct; length: number } | null = null;

  for (const product of getInventoryProducts()) {
    for (const keyword of product.matchKeywords) {
      const needle = normalizeText(keyword);
      if (needle && normalized.includes(needle) && (!best || needle.length > best.length)) {
        best = { product, length: needle.length };
      }
    }
  }

  return best?.product ?? null;
}

// ---------------------------------------------------------------------------
// Manual mutations — the single path /staff/inventory's Quick Actions and
// product detail page go through.
// ---------------------------------------------------------------------------

export function receiveStock(
  productId: string,
  quantity: number,
  actor: string,
  options: { note?: string } = {}
): InventoryMovement | undefined {
  if (quantity <= 0) return undefined;
  return addMovement({
    productId,
    type: "stock-in",
    quantityDelta: quantity,
    reason: "purchase-order",
    note: options.note ?? null,
    actor,
    orderId: null,
  });
}

export function adjustStock(
  productId: string,
  delta: number,
  reason: Extract<MovementReason, "damaged" | "manual-count" | "correction" | "expired">,
  actor: string,
  note?: string
): InventoryMovement | undefined {
  if (delta === 0) return undefined;
  return addMovement({
    productId,
    type: "adjustment",
    quantityDelta: delta,
    reason,
    note: note ?? null,
    actor,
    orderId: null,
  });
}

export function transferStock(productId: string, destination: InventoryLocation, actor: string, note?: string): InventoryMovement | undefined {
  const product = findProductById(productId);
  if (!product || product.location === destination) return undefined;
  const movement = addMovement({
    productId,
    type: "transfer",
    quantityDelta: 0,
    reason: "location-transfer",
    note: note ?? null,
    actor,
    orderId: null,
  });
  updateProductLocation(productId, destination);
  return movement;
}

// ---------------------------------------------------------------------------
// Order-driven reconciliation — see header. Deliberately whole-state
// re-derivation (like risk-engine.ts's analyzeAllOrders), not incremental,
// so it never drifts no matter what triggered the change.
// ---------------------------------------------------------------------------

const COMMIT_STATUSES: Order["status"][] = ["confirmed", "preparing", "ready", "completed"];

// An order "commits" stock once staff have confirmed it and it's moving
// toward fulfillment — but never while its most recent payment attempt
// failed outright, and never once cancelled. This is the concrete mechanism
// behind "Payments update inventory status": a payment failure withholds
// (or reverses) a stock commitment even if the order itself still reads
// "confirmed".
function shouldCommitStock(order: Order): boolean {
  if (order.status === "cancelled") return false;
  if (!COMMIT_STATUSES.includes(order.status)) return false;
  if (order.payment.status === "failed") return false;
  return true;
}

function computeDeductions(order: Order): { productId: string; quantity: number }[] {
  const deductions: { productId: string; quantity: number }[] = [];
  for (const item of order.items) {
    const product = matchProductByItemName(item.name);
    if (product) deductions.push({ productId: product.id, quantity: item.quantity });
  }
  return deductions;
}

// Bud Guardian V6 — Inventory Matching Safety. The keyword-matching hook
// above (see header) means an order item with no matching product's
// matchKeywords simply never deducts stock — before V6 that failure was
// completely silent. This doesn't change the matching itself (no product/
// order architecture redesign), it just makes the failure visible: any item
// on a stock-committing order that can't be matched is surfaced here so
// warnUnmatchedItems() below can log it instead of letting it disappear.
export function getUnmatchedItemNames(order: Order): string[] {
  return order.items.filter((item) => matchProductByItemName(item.name) === null).map((item) => item.name);
}

const UNMATCHED_ITEM_ACTION = "inventory.unmatchedItem";

// Logs a warning to the shared audit log the first time an order with
// unmatched items commits stock — guarded by hasAuditEntry so a repeated
// reconciliation pass (this runs on every order/payment change) never logs
// the same order twice, the same "check independently, don't just trust a
// flag" belt-and-suspenders approach hasOutstandingDeduction() already uses
// for the deduction/restore guards below.
function warnUnmatchedItems(order: Order): void {
  const unmatched = getUnmatchedItemNames(order);
  if (unmatched.length === 0) return;
  if (hasAuditEntry("inventory", UNMATCHED_ITEM_ACTION, order.id)) return;
  logAuditEntry({
    actor: "Bud Guardian (auto)",
    role: "system",
    module: "inventory",
    action: UNMATCHED_ITEM_ACTION,
    entityId: order.id,
    description: `${unmatched.length} article(s) de la commande ${order.id} n'ont pas pu être associés à un produit d'inventaire et n'ont pas été déduits : ${unmatched.join(", ")}.`,
    metadata: { orderId: order.id, unmatchedItemNames: unmatched },
    outcome: "warning",
  });
}

// Bud Guardian V5.0 — Inventory Safety & Permissions. Duplicate-deduction
// guard: the order-stock link (applied/reversed) is the primary idempotency
// key, but before committing a deduction or a restore we also re-derive the
// same fact independently from the movement log itself — outstanding
// deductions = every "stock-out" for this orderId minus every "return"
// stock-in that already restored one. That second, independent check is
// what makes "the same order never reduces inventory twice" (and "a
// cancelled order is restored exactly once") hold even if the link were
// ever missing or stale — belt-and-suspenders on top of the link, not a
// replacement for it. It also stays correct across legitimate multiple
// commit/reverse cycles (e.g. a payment that fails then later succeeds),
// since each cycle nets back to zero outstanding deductions instead of
// permanently latching on "a stock-out happened once".
function hasOutstandingDeduction(orderId: string): boolean {
  const movements = getInventoryMovements().filter((m) => m.orderId === orderId);
  const deducted = movements.filter((m) => m.type === "stock-out").length;
  const restored = movements.filter((m) => m.type === "stock-in" && m.reason === "return").length;
  return deducted > restored;
}

export function reconcileOrders(actor = "Bud Guardian (auto)"): void {
  const orders = getOrders();
  const links = getOrderStockLinks();

  for (const order of orders) {
    const desiredCommitted = shouldCommitStock(order);
    const link = links[order.id];
    const currentlyCommitted = link?.status === "applied";

    if (desiredCommitted && !currentlyCommitted) {
      // V6 — surface (once per order) any item that can't be matched to a
      // product, whether this is a fresh deduction or a resync below.
      warnUnmatchedItems(order);

      // Guard: never deduct twice for the same order, even if the link is
      // missing/stale — if the movement log already shows an outstanding
      // (un-returned) deduction for this order, just resync the link
      // instead of deducting again.
      if (hasOutstandingDeduction(order.id)) {
        setOrderStockLink({ orderId: order.id, status: "applied", deductions: link?.deductions ?? [], updatedAt: new Date().toISOString() });
        continue;
      }
      const deductions = computeDeductions(order);
      for (const deduction of deductions) {
        addMovement({
          productId: deduction.productId,
          type: "stock-out",
          quantityDelta: -deduction.quantity,
          reason: "sale",
          note: null,
          actor,
          orderId: order.id,
        });
      }
      setOrderStockLink({ orderId: order.id, status: "applied", deductions, updatedAt: new Date().toISOString() });
    } else if (!desiredCommitted && currentlyCommitted && link) {
      // Guard: restore a cancelled/reversed order's stock exactly once —
      // skip if the movement log shows no outstanding deduction left to
      // restore for this order (i.e. it was already returned).
      if (!hasOutstandingDeduction(order.id)) {
        setOrderStockLink({ orderId: order.id, status: "reversed", deductions: link.deductions, updatedAt: new Date().toISOString() });
        continue;
      }
      for (const deduction of link.deductions) {
        addMovement({
          productId: deduction.productId,
          type: "stock-in",
          quantityDelta: deduction.quantity,
          reason: "return",
          note: null,
          actor,
          orderId: order.id,
        });
      }
      setOrderStockLink({ orderId: order.id, status: "reversed", deductions: link.deductions, updatedAt: new Date().toISOString() });
    }
  }
}

// Runs once on load and again whenever the shared order or payment stores
// change, so a status edit in /staff/orders or a confirmed/declined payment
// in /staff/payments is reflected in stock without any manual trigger —
// same automatic-re-run pattern as risk-engine.ts's analyzeAllOrders wiring.
if (typeof window !== "undefined") {
  reconcileOrders();
  subscribeOrders(() => reconcileOrders());
  subscribePayments(() => reconcileOrders());
}

// ---------------------------------------------------------------------------
// Read-only cross-references — CRM purchase history and Risk Engine context,
// surfaced inside the Inventory module without writing back into either.
// ---------------------------------------------------------------------------

export type ProductBuyer = {
  orderId: string;
  customerName: string;
  quantity: number;
  at: string;
  status: Order["status"];
  riskFlag: "high" | "critical" | null;
};

export function getRecentBuyers(productId: string, limit = 8): ProductBuyer[] {
  const buyers: ProductBuyer[] = [];
  for (const order of getOrders()) {
    for (const item of order.items) {
      const product = matchProductByItemName(item.name);
      if (product?.id !== productId) continue;
      const risk = findRiskAssessmentByOrderId(order.id);
      buyers.push({
        orderId: order.id,
        customerName: maskName(order.customerName),
        quantity: item.quantity,
        at: order.createdAt,
        status: order.status,
        riskFlag: risk && (risk.riskLevel === "high" || risk.riskLevel === "critical") ? risk.riskLevel : null,
      });
    }
  }
  return buyers.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()).slice(0, limit);
}

export function getOrderRiskFlag(orderId: string | null): "high" | "critical" | null {
  if (!orderId) return null;
  const risk = findRiskAssessmentByOrderId(orderId);
  return risk && (risk.riskLevel === "high" || risk.riskLevel === "critical") ? risk.riskLevel : null;
}

// Re-exported so components don't need to reach into order-engine.ts
// directly just for this one formatter.
export { getOrderTotal };

// ---------------------------------------------------------------------------
// Labels — locale-driven, mirrors getStatusLabel/getRiskLevelLabel.
// ---------------------------------------------------------------------------

const CATEGORY_LABELS: Record<InventoryCategory, Record<Locale, string>> = {
  flower: { fr: "Fleur", en: "Flower" },
  "pre-rolls": { fr: "Pré-roulés", en: "Pre-rolls" },
  edibles: { fr: "Comestibles", en: "Edibles" },
  concentrates: { fr: "Concentrés", en: "Concentrates" },
  vapes: { fr: "Vaporisateurs", en: "Vapes" },
  accessories: { fr: "Accessoires", en: "Accessories" },
  topicals: { fr: "Topiques", en: "Topicals" },
};

export function getCategoryLabel(category: InventoryCategory, locale: Locale): string {
  return CATEGORY_LABELS[category][locale];
}

const STOCK_STATUS_LABELS: Record<StockStatus, Record<Locale, string>> = {
  "in-stock": { fr: "En stock", en: "In stock" },
  "low-stock": { fr: "Stock faible", en: "Low stock" },
  "out-of-stock": { fr: "Rupture de stock", en: "Out of stock" },
};

export function getStockStatusLabel(status: StockStatus, locale: Locale): string {
  return STOCK_STATUS_LABELS[status][locale];
}

const LOCATION_LABELS: Record<InventoryLocation, Record<Locale, string>> = {
  warehouse: { fr: "Entrepôt", en: "Warehouse" },
  "sales-floor": { fr: "Aire de vente", en: "Sales floor" },
  "back-storage": { fr: "Réserve", en: "Back storage" },
};

export function getLocationLabel(location: InventoryLocation, locale: Locale): string {
  return LOCATION_LABELS[location][locale];
}

const MOVEMENT_TYPE_LABELS: Record<MovementType, Record<Locale, string>> = {
  "stock-in": { fr: "Entrée de stock", en: "Stock in" },
  "stock-out": { fr: "Sortie de stock", en: "Stock out" },
  adjustment: { fr: "Ajustement manuel", en: "Manual adjustment" },
  transfer: { fr: "Transfert", en: "Transfer" },
};

export function getMovementTypeLabel(type: MovementType, locale: Locale): string {
  return MOVEMENT_TYPE_LABELS[type][locale];
}

const MOVEMENT_REASON_LABELS: Record<MovementReason, Record<Locale, string>> = {
  "purchase-order": { fr: "Bon de commande", en: "Purchase order" },
  sale: { fr: "Vente", en: "Sale" },
  return: { fr: "Retour", en: "Return" },
  damaged: { fr: "Endommagé", en: "Damaged" },
  "manual-count": { fr: "Comptage manuel", en: "Manual count" },
  correction: { fr: "Correction", en: "Correction" },
  expired: { fr: "Expiré", en: "Expired" },
  "location-transfer": { fr: "Transfert d'emplacement", en: "Location transfer" },
};

export function getMovementReasonLabel(reason: MovementReason, locale: Locale): string {
  return MOVEMENT_REASON_LABELS[reason][locale];
}
