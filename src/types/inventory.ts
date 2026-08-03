// Bud Guardian V5.0 — Inventory & Operations types. Models a standalone
// product/stock ledger (InventoryProduct + InventoryMovement) that is fully
// separate from Order/PaymentRecord/RiskAssessment/CustomerProfile, exactly
// like V3.0's risk.ts and V4.0's customer.ts kept their new shapes out of
// V2/V2.1/V2.2's — so none of those existing modules is ever touched.
//
// Order.items (types/order.ts) only ever carries a free-text `name`, never a
// product id, so InventoryProduct carries its own `matchKeywords`: known
// lowercase, accent-stripped substrings of order item names that identify
// it. This is the same "match by name" approach customer-engine.ts already
// uses for computeFavoriteProducts — just made explicit and reviewable
// instead of implicit — and lets Orders auto-reduce stock without adding a
// productId field to Order.

export type InventoryCategory = "flower" | "pre-rolls" | "edibles" | "concentrates" | "vapes" | "accessories" | "topicals";

export type StockStatus = "in-stock" | "low-stock" | "out-of-stock";

export type InventoryLocation = "warehouse" | "sales-floor" | "back-storage";

export type InventoryProduct = {
  id: string; // SKU, e.g. "INV-1001"
  name: string;
  category: InventoryCategory;
  supplier: string;
  batchId: string;
  quantityOnHand: number;
  lowStockThreshold: number;
  purchaseCost: number;
  sellingPrice: number;
  dateReceived: string;
  expirationDate: string | null;
  location: InventoryLocation;
  // Lowercase, accent-stripped order-item-name fragments that identify this
  // product in Order.items — see module header. Empty for products that
  // aren't expected to ever match an existing order fixture.
  matchKeywords: string[];
  createdAt: string;
  updatedAt: string;
};

export type MovementType = "stock-in" | "stock-out" | "adjustment" | "transfer";

export type MovementReason =
  | "purchase-order"
  | "sale"
  | "return"
  | "damaged"
  | "manual-count"
  | "correction"
  | "expired"
  | "location-transfer";

export type InventoryMovement = {
  id: string;
  productId: string;
  type: MovementType;
  quantityDelta: number; // positive for stock-in/adjustment-up, negative for stock-out/adjustment-down
  resultingQuantity: number;
  reason: MovementReason;
  note: string | null;
  actor: string;
  orderId: string | null; // set when the movement was auto-generated from an order
  at: string;
};

// Tracks whether an order's items have already been deducted from stock, so
// the auto-reconciliation pass (inventory-engine.ts's reconcileOrders) stays
// idempotent no matter how many times the shared order store notifies.
export type OrderStockLink = {
  orderId: string;
  status: "applied" | "reversed";
  deductions: { productId: string; quantity: number }[];
  updatedAt: string;
};
