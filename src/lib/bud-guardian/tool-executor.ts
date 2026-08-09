// Bud Guardian V10 — controlled tool EXECUTION. This is the only place a
// tool call from the AI actually touches app data, and it only ever runs in
// the browser (every store it reads from is localStorage-backed — see
// guardian-ai-client.ts's header for why tool execution has to live on the
// client even though the model call itself is server-only). The AI never
// gets closer to real data than this file: every case below is a fixed,
// reviewable mapping from one approved tool name to one or more existing,
// already-reviewed read-only engine calls — no dynamic property access, no
// eval, no passthrough of arbitrary arguments into a store call. Arguments
// are pulled out and type-checked field by field before use (see the `str`
// helper) instead of trusting the shape the model claims to have sent.
//
// Scope discipline: `staff_*` tools hard-refuse to run unless
// ctx.mode === "staff" (belt-and-suspenders on top of the server only
// offering them to the model in staff mode — see guardian-tools.ts). Public
// order/payment tools are scoped to the SIGNED-IN customer's own orders only
// (data/shop/order-store.ts + account-store.ts), never a global lookup by
// id — that boundary is what stands in for the two-factor identifier rule
// order-engine.ts/payment-engine.ts enforce for the *unauthenticated* guest
// flow, which this file never touches or bypasses.
//
// Nothing here mutates anything — every import below is a read-only getter/
// finder, never an add*/replace*/update*/set* mutation.

import type { Locale } from "@/lib/i18n/types";
import type { ProductCategory } from "@/types/product";
import type { StaffRole } from "@/types/staff-order";
import type { AnalyticsSnapshot } from "./analytics-engine";
import type { GuardianToolCall, GuardianToolResult } from "./guardian-tools";

import { getProducts } from "@/data/shop/product-store";
import {
  getEffectivePrice,
  getStockStatus,
  getAverageRating,
  getCategoryLabel as getProductCategoryLabel,
  getStrainLabel,
  getAllCategories,
} from "@/lib/shop/product-engine";
import { getStoreStatus, getWeeklySchedule } from "@/lib/hours";
import { SITE } from "@/lib/site";
import { respondToQuery } from "./engine";
import { LEARNING_CATEGORIES } from "@/data/learning-center";
import { getSession, findAccountById } from "@/data/shop/account-store";
import { getOrdersForAccount } from "@/data/shop/order-store";
import { getOrderStatusLabel, getNextStatus } from "@/lib/shop/order-engine";
import { GUEST_OWNER_ID } from "@/data/shop/cart-store";
import {
  getCartLines,
  getCartTotals,
  addToCart as addToCartEngine,
  updateCartQuantity as updateCartQuantityEngine,
  removeFromCart as removeFromCartEngine,
  clearCartItems,
} from "@/lib/shop/cart-engine";
import { getEnabledProviders, getProvider } from "@/lib/shop/payment-providers/registry";
import type { PaymentProviderId } from "@/types/shop-payment";

import { getOrders as getStaffOrders } from "@/data/bud-guardian/orders-store";
import { findLatestPaymentByOrderId, findPaymentById } from "@/data/bud-guardian/payments";
import { findRiskAssessmentByOrderId } from "@/data/bud-guardian/risk";
import { getInventoryProducts } from "@/data/bud-guardian/inventory-store";
import { getCustomerProfiles } from "./customer-engine";
import { getOrderTotal, getStatusLabel, getPaymentStatusLabel as getOrderPaymentStatusLabel, maskName, normalizeOrderNumber } from "./order-engine";
import { getPaymentStatusLabel as getTxnStatusLabel, getEffectivePaymentStatus, normalizeTransactionId } from "./payment-engine";
import { getRiskLevelLabel, getRiskFactorLabel } from "./risk-engine";
import { getStockStatusLabel, getCategoryLabel as getInventoryCategoryLabel } from "./inventory-engine";
import { getActiveBan } from "./moderation-engine";
import { getGuardianIdentities } from "./guardian-identity";

export type ToolExecContext = {
  locale: Locale;
  mode: "public" | "staff";
  staffRole?: StaffRole;
  // The AnalyticsSnapshot already computed/displayed for whatever period is
  // currently selected on the staff dashboard — staff_get_analytics_summary
  // reads exactly this, never a parallel/re-derived one.
  analyticsSnapshot?: AnalyticsSnapshot;
};

function ok(id: string, name: string, output: unknown, meta?: GuardianToolResult["meta"]): GuardianToolResult {
  return { id, name, output, meta };
}

function toolError(id: string, name: string, message: string): GuardianToolResult {
  return { id, name, output: { error: message }, isError: true };
}

function str(input: Record<string, unknown>, key: string): string | undefined {
  const value = input[key];
  return typeof value === "string" && value.trim().length > 0 ? value.trim().slice(0, 200) : undefined;
}

// V11 — search_products' maxPrice/minPrice args.
function num(input: Record<string, unknown>, key: string): number | undefined {
  const value = input[key];
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim();
}

const PRODUCT_CATEGORY_VALUES = new Set<ProductCategory>([
  "flower", "pre-rolls", "edibles", "concentrates", "vapes", "cbd", "accessories", "topicals", "mushrooms",
]);

// ---------------------------------------------------------------------------
// Public tools
// ---------------------------------------------------------------------------

function toolSearchProducts(call: GuardianToolCall, ctx: ToolExecContext): GuardianToolResult {
  const query = str(call.input, "query");
  const categoryRaw = str(call.input, "category");
  const category = categoryRaw && PRODUCT_CATEGORY_VALUES.has(categoryRaw as ProductCategory) ? (categoryRaw as ProductCategory) : undefined;
  const maxPrice = num(call.input, "maxPrice");
  const minPrice = num(call.input, "minPrice");
  const needle = query ? normalize(query) : null;

  const matches = getProducts().filter((p) => {
    if (category && p.category !== category) return false;
    const price = getEffectivePrice(p);
    if (maxPrice != null && price > maxPrice) return false;
    if (minPrice != null && price <= minPrice) return false;
    if (!needle) return true;
    return normalize(`${p.name} ${p.brand} ${p.shortDescription}`).includes(needle);
  });

  const results = matches.slice(0, 8).map((p) => ({
    productId: p.id,
    name: p.name,
    brand: p.brand,
    category: p.category,
    strain: p.strain ? getStrainLabel(p.strain, ctx.locale) : null,
    price: getEffectivePrice(p),
    stockStatus: getStockStatus(p),
    rating: getAverageRating(p),
  }));

  return ok(call.id, call.name, { count: results.length, products: results }, results[0] ? { productId: results[0].productId } : undefined);
}

function toolGetProductDetails(call: GuardianToolCall, ctx: ToolExecContext): GuardianToolResult {
  const productId = str(call.input, "productId");
  if (!productId) return toolError(call.id, call.name, "missing_productId");

  const product = getProducts().find((p) => p.id === productId);
  if (!product) return ok(call.id, call.name, { found: false });

  return ok(
    call.id,
    call.name,
    {
      found: true,
      productId: product.id,
      name: product.name,
      brand: product.brand,
      category: product.category,
      strain: product.strain ? getStrainLabel(product.strain, ctx.locale) : null,
      thcPercent: product.thcPercent,
      cbdPercent: product.cbdPercent,
      price: getEffectivePrice(product),
      onSale: product.salePrice !== null,
      stockStatus: getStockStatus(product),
      rating: getAverageRating(product),
      shortDescription: product.shortDescription,
      description: product.description,
    },
    { productId: product.id }
  );
}

function toolGetCategories(_call: GuardianToolCall, ctx: ToolExecContext): GuardianToolResult {
  const categories = getAllCategories().map((c) => ({ id: c, label: getProductCategoryLabel(c, ctx.locale) }));
  return ok(_call.id, _call.name, { categories });
}

function toolGetStoreInfo(_call: GuardianToolCall, ctx: ToolExecContext): GuardianToolResult {
  const status = getStoreStatus(new Date(), ctx.locale);
  const schedule = getWeeklySchedule(ctx.locale);
  return ok(_call.id, _call.name, {
    status: `${status.primaryLabel} — ${status.secondaryLabel}`,
    weeklySchedule: schedule,
    phone: SITE.phoneDisplay,
    address: `${SITE.addressLine1}, ${SITE.addressLine2}`,
    instagramUrl: SITE.instagramUrl,
    linktreeUrl: SITE.linktreeUrl,
    mapsUrl: SITE.mapsUrl,
    email: SITE.email,
  });
}

function toolGetFaqAnswer(call: GuardianToolCall, ctx: ToolExecContext): GuardianToolResult {
  const question = str(call.input, "question");
  if (!question) return toolError(call.id, call.name, "missing_question");
  const result = respondToQuery(question, ctx.locale, null);
  return ok(call.id, call.name, { found: result.found, answer: result.answer, topic: result.topic ?? null });
}

function toolGetLearningCenterTopic(call: GuardianToolCall, ctx: ToolExecContext): GuardianToolResult {
  const topic = str(call.input, "topic");
  if (!topic) return toolError(call.id, call.name, "missing_topic");
  const needle = normalize(topic);

  let best: { title: string; summary: string; body: string[]; score: number } | null = null;
  for (const category of LEARNING_CATEGORIES) {
    for (const t of category.topics) {
      const haystack = normalize(`${t.title[ctx.locale]} ${t.summary[ctx.locale]} ${t.slug}`);
      if (!haystack.includes(needle) && !needle.includes(t.slug)) continue;
      // Longer overlap wins — a topic whose title contains the whole query
      // beats one that only shares a short substring.
      const score = t.slug.length;
      if (!best || score > best.score) {
        best = { title: t.title[ctx.locale], summary: t.summary[ctx.locale], body: t.body[ctx.locale], score };
      }
    }
  }

  if (!best) return ok(call.id, call.name, { found: false });
  return ok(call.id, call.name, { found: true, title: best.title, summary: best.summary, body: best.body });
}

function toolGetMyOrders(_call: GuardianToolCall, ctx: ToolExecContext): GuardianToolResult {
  const session = getSession();
  if (!session) return ok(_call.id, _call.name, { authenticated: false });

  const orders = getOrdersForAccount(session.accountId)
    .slice(0, 10)
    .map((o) => ({
      orderId: o.id,
      status: getOrderStatusLabel(o.status, ctx.locale),
      total: o.total,
      createdAt: o.createdAt,
    }));

  return ok(_call.id, _call.name, { authenticated: true, orders });
}

function toolGetOrderStatus(call: GuardianToolCall, ctx: ToolExecContext): GuardianToolResult {
  const orderId = str(call.input, "orderId");
  if (!orderId) return toolError(call.id, call.name, "missing_orderId");

  const session = getSession();
  if (!session) return ok(call.id, call.name, { authenticated: false });

  // Ownership-scoped lookup only — never a global findOrderById(). A
  // signed-in customer asking about an id that isn't theirs gets the same
  // "not found" answer as one that doesn't exist at all, so this never
  // confirms or denies another customer's order exists.
  const order = getOrdersForAccount(session.accountId).find((o) => o.id.toUpperCase() === orderId.toUpperCase());
  if (!order) return ok(call.id, call.name, { found: false });

  const next = getNextStatus(order.status);
  return ok(call.id, call.name, {
    found: true,
    orderId: order.id,
    status: getOrderStatusLabel(order.status, ctx.locale),
    nextStatus: next ? getOrderStatusLabel(next, ctx.locale) : null,
    isPendingPayment: order.status === "pending_payment",
    isCancelled: order.status === "cancelled",
    trackingNumber: order.canadaPostTrackingNumber,
    shippingMethod: order.shippingMethod,
    total: order.total,
    updatedAt: order.updatedAt,
  });
}

function toolGetPaymentStatusForOrder(call: GuardianToolCall, ctx: ToolExecContext): GuardianToolResult {
  const orderId = str(call.input, "orderId");
  if (!orderId) return toolError(call.id, call.name, "missing_orderId");

  const session = getSession();
  if (!session) return ok(call.id, call.name, { authenticated: false });

  const order = getOrdersForAccount(session.accountId).find((o) => o.id.toUpperCase() === orderId.toUpperCase());
  if (!order) return ok(call.id, call.name, { found: false });

  const paid = order.status !== "pending_payment" && order.status !== "cancelled";
  const provider = getProvider(order.paymentProviderId as PaymentProviderId);
  // Warrior Buds' real order model only tracks pending / paid / cancelled —
  // no separate "declined"/"expired" flag exists (see guardian-tools.ts's
  // description for this tool). isPendingPayment/isCancelled below are the
  // full, real vocabulary — never report a status beyond these.
  return ok(call.id, call.name, {
    found: true,
    orderId: order.id,
    orderStatus: getOrderStatusLabel(order.status, ctx.locale),
    paid,
    isPendingPayment: order.status === "pending_payment",
    isCancelled: order.status === "cancelled",
    paymentProviderId: order.paymentProviderId,
    paymentProviderName: provider ? provider.getDisplayName(ctx.locale) : null,
  });
}

// ---------------------------------------------------------------------------
// V13 — Checkout & Order Assistant. Both read-only, grounded entirely in
// real live data — see guardian-tools.ts's header for this tool's scope.
// ---------------------------------------------------------------------------

function toolGetCheckoutStatus(call: GuardianToolCall): GuardianToolResult {
  const ownerId = resolveOwnerId();
  const cart = buildCartSnapshot(ownerId);
  const session = getSession();
  const account = session ? findAccountById(session.accountId) : undefined;

  return ok(call.id, call.name, {
    cart,
    cartEmpty: cart.itemCount === 0,
    signedIn: !!session,
    savedAddressCount: account ? account.addresses.length : null,
    hasDefaultAddress: account ? account.addresses.some((a) => a.isDefault) : null,
    checkoutSteps: ["shipping", "billing", "review", "payment"],
    guestCheckoutAvailable: true,
  });
}

function toolGetPaymentMethods(call: GuardianToolCall, ctx: ToolExecContext): GuardianToolResult {
  const methods = getEnabledProviders().map((p) => {
    const hasLiveInstructions = p.getInstructions(ctx.locale, { id: "", total: 0 }, "checkout").steps.length > 0;
    return { id: p.id, name: p.getDisplayName(ctx.locale), isLiveInstructions: hasLiveInstructions };
  });
  return ok(call.id, call.name, { methods });
}

// ---------------------------------------------------------------------------
// V14 — Customer Support & Problem Resolution. Same ownership rule as the
// order/payment tools above: only ever the SIGNED-IN caller's own account,
// never a global/by-id lookup. Deliberately excludes email/phone/password
// from the output (see guardian-tools.ts's description for this tool).
// ---------------------------------------------------------------------------

function toolGetAccountStatus(call: GuardianToolCall): GuardianToolResult {
  const session = getSession();
  if (!session) return ok(call.id, call.name, { signedIn: false });

  const account = findAccountById(session.accountId);
  if (!account) return ok(call.id, call.name, { signedIn: false });

  return ok(call.id, call.name, {
    signedIn: true,
    emailVerified: account.emailVerified,
    addressCount: account.addresses.length,
    paymentPreferenceCount: account.paymentPreferences.length,
  });
}

// ---------------------------------------------------------------------------
// V12 — Shopping & Cart Assistant. Same owner resolution as
// lib/shop/cart-actions.ts's useOwnerId(): the signed-in customer's account
// id, or the shared "guest" cart if nobody's signed in — never a customer-
// supplied id, so this can never touch another customer's cart.
// ---------------------------------------------------------------------------

function resolveOwnerId(): string {
  return getSession()?.accountId ?? GUEST_OWNER_ID;
}

function buildCartSnapshot(ownerId: string) {
  const lines = getCartLines(ownerId);
  const totals = getCartTotals(ownerId);
  return {
    itemCount: lines.reduce((sum, l) => sum + l.quantity, 0),
    items: lines.map((l) => ({
      productId: l.product.id,
      name: l.product.name,
      price: getEffectivePrice(l.product),
      quantity: l.quantity,
      lineTotal: l.lineTotal,
      stockStatus: getStockStatus(l.product),
    })),
    subtotal: totals.subtotal,
    shipping: totals.shipping,
    tax: totals.tax,
    total: totals.total,
  };
}

function toolGetCart(call: GuardianToolCall): GuardianToolResult {
  return ok(call.id, call.name, buildCartSnapshot(resolveOwnerId()));
}

function toolAddToCart(call: GuardianToolCall): GuardianToolResult {
  const productId = str(call.input, "productId");
  if (!productId) return toolError(call.id, call.name, "missing_productId");

  const product = getProducts().find((p) => p.id === productId);
  if (!product) return ok(call.id, call.name, { added: false, reason: "product_not_found" });

  const ownerId = resolveOwnerId();
  const requestedRaw = num(call.input, "quantity");
  const requestedQuantity = requestedRaw != null && requestedRaw > 0 ? Math.floor(requestedRaw) : 1;

  if (product.stock <= 0) {
    return ok(
      call.id,
      call.name,
      { added: false, reason: "out_of_stock", productId, name: product.name, stock: 0, cart: buildCartSnapshot(ownerId) },
      { productId }
    );
  }

  const existingQuantity = getCartLines(ownerId).find((l) => l.product.id === productId)?.quantity ?? 0;
  if (existingQuantity >= product.stock) {
    return ok(
      call.id,
      call.name,
      { added: false, reason: "already_at_max_stock", productId, name: product.name, stock: product.stock, cart: buildCartSnapshot(ownerId) },
      { productId }
    );
  }

  // Never let the cart hold more than what's actually in stock — same cap
  // the Product Detail page's own quantity stepper enforces.
  const addedQuantity = Math.min(requestedQuantity, product.stock - existingQuantity);
  addToCartEngine(ownerId, productId, addedQuantity);

  return ok(
    call.id,
    call.name,
    {
      added: true,
      productId,
      name: product.name,
      requestedQuantity,
      addedQuantity,
      cappedByStock: addedQuantity < requestedQuantity,
      stock: product.stock,
      cart: buildCartSnapshot(ownerId),
    },
    { productId }
  );
}

function toolUpdateCartQuantity(call: GuardianToolCall): GuardianToolResult {
  const productId = str(call.input, "productId");
  if (!productId) return toolError(call.id, call.name, "missing_productId");

  const requestedRaw = num(call.input, "quantity");
  if (requestedRaw == null || !Number.isFinite(requestedRaw) || requestedRaw < 0) {
    return toolError(call.id, call.name, "missing_or_invalid_quantity");
  }

  const ownerId = resolveOwnerId();
  const product = getProducts().find((p) => p.id === productId);
  if (!product) return ok(call.id, call.name, { updated: false, reason: "product_not_found" });

  const requestedQuantity = Math.floor(requestedRaw);
  if (requestedQuantity === 0) {
    removeFromCartEngine(ownerId, productId);
    return ok(call.id, call.name, { updated: true, productId, name: product.name, quantity: 0, cart: buildCartSnapshot(ownerId) }, { productId });
  }

  if (product.stock <= 0) {
    return ok(
      call.id,
      call.name,
      { updated: false, reason: "out_of_stock", productId, name: product.name, cart: buildCartSnapshot(ownerId) },
      { productId }
    );
  }

  const quantity = Math.min(requestedQuantity, product.stock);
  updateCartQuantityEngine(ownerId, productId, quantity);

  return ok(
    call.id,
    call.name,
    {
      updated: true,
      productId,
      name: product.name,
      quantity,
      cappedByStock: quantity < requestedQuantity,
      stock: product.stock,
      cart: buildCartSnapshot(ownerId),
    },
    { productId }
  );
}

function toolRemoveFromCart(call: GuardianToolCall): GuardianToolResult {
  const productId = str(call.input, "productId");
  if (!productId) return toolError(call.id, call.name, "missing_productId");

  const ownerId = resolveOwnerId();
  const product = getProducts().find((p) => p.id === productId);
  const wasInCart = getCartLines(ownerId).some((l) => l.product.id === productId);
  removeFromCartEngine(ownerId, productId);

  return ok(
    call.id,
    call.name,
    { removed: wasInCart, productId, name: product?.name ?? null, cart: buildCartSnapshot(ownerId) },
    { productId }
  );
}

function toolClearCart(call: GuardianToolCall): GuardianToolResult {
  const ownerId = resolveOwnerId();
  clearCartItems(ownerId);
  return ok(call.id, call.name, { cleared: true, cart: buildCartSnapshot(ownerId) });
}

// ---------------------------------------------------------------------------
// Staff-only tools — hard-gated on ctx.mode === "staff" (see header).
// ---------------------------------------------------------------------------

function toolStaffGetAnalyticsSummary(call: GuardianToolCall, ctx: ToolExecContext): GuardianToolResult {
  const snapshot = ctx.analyticsSnapshot;
  if (!snapshot) return toolError(call.id, call.name, "no_snapshot_available");
  return ok(call.id, call.name, {
    range: snapshot.range,
    kpis: snapshot.kpis,
    topProducts: snapshot.topProducts.slice(0, 5),
    insights: snapshot.insights.map((i) => ({ kind: i.kind, severity: i.severity, data: i.data })),
    customers: snapshot.customers,
    riskPayment: snapshot.riskPayment,
  });
}

function toolStaffLookupOrder(call: GuardianToolCall, ctx: ToolExecContext): GuardianToolResult {
  const orderIdRaw = str(call.input, "orderId");
  if (!orderIdRaw) return toolError(call.id, call.name, "missing_orderId");
  const orderId = normalizeOrderNumber(orderIdRaw);

  const order = getStaffOrders().find((o) => o.id === orderId);
  if (!order) return ok(call.id, call.name, { found: false });

  return ok(call.id, call.name, {
    found: true,
    orderId: order.id,
    customer: maskName(order.customerName),
    status: getStatusLabel(order.status, ctx.locale),
    payment: getOrderPaymentStatusLabel(order.payment.status, ctx.locale),
    total: getOrderTotal(order),
    itemCount: order.items.length,
    createdAt: order.createdAt,
  });
}

function toolStaffLookupPayment(call: GuardianToolCall, ctx: ToolExecContext): GuardianToolResult {
  const orderId = str(call.input, "orderId");
  const transactionIdRaw = str(call.input, "transactionId");
  if (!orderId && !transactionIdRaw) return toolError(call.id, call.name, "missing_identifier");

  const payment = transactionIdRaw
    ? findPaymentById(normalizeTransactionId(transactionIdRaw))
    : findLatestPaymentByOrderId(normalizeOrderNumber(orderId!));

  if (!payment) return ok(call.id, call.name, { found: false });

  return ok(call.id, call.name, {
    found: true,
    transactionId: payment.id,
    orderId: payment.orderId,
    status: getTxnStatusLabel(getEffectivePaymentStatus(payment), ctx.locale),
    amount: payment.amount,
    provider: payment.provider,
  });
}

function toolStaffLookupRisk(call: GuardianToolCall, ctx: ToolExecContext): GuardianToolResult {
  const orderIdRaw = str(call.input, "orderId");
  if (!orderIdRaw) return toolError(call.id, call.name, "missing_orderId");
  const orderId = normalizeOrderNumber(orderIdRaw);

  const assessment = findRiskAssessmentByOrderId(orderId);
  if (!assessment) return ok(call.id, call.name, { found: false });

  return ok(call.id, call.name, {
    found: true,
    orderId,
    riskLevel: getRiskLevelLabel(assessment.riskLevel, ctx.locale),
    confidenceScore: assessment.confidenceScore,
    validation: assessment.validation,
    factors: assessment.factors.map((f) => getRiskFactorLabel(f.id, ctx.locale)),
  });
}

function toolStaffLookupCustomer(call: GuardianToolCall): GuardianToolResult {
  const query = str(call.input, "query");
  if (!query) return toolError(call.id, call.name, "missing_query");
  const needle = normalize(query);

  const matches = getCustomerProfiles()
    .filter((c) => normalize(`${c.name} ${c.phone} ${c.email}`).includes(needle))
    .slice(0, 5)
    .map((c) => ({
      customerId: c.id,
      name: c.name,
      status: c.status,
      segment: c.segment,
      orderCount: c.orderCount,
      totalSpent: c.totalSpent,
      favoriteProducts: c.favoriteProducts.map((f) => f.name),
    }));

  return ok(call.id, call.name, { count: matches.length, customers: matches });
}

function toolStaffLookupInventory(call: GuardianToolCall, ctx: ToolExecContext): GuardianToolResult {
  const query = str(call.input, "query");
  if (!query) return toolError(call.id, call.name, "missing_query");
  const needle = normalize(query);

  const matches = getInventoryProducts()
    .filter((p) => normalize(p.name).includes(needle) || p.matchKeywords.some((k) => normalize(k).includes(needle)))
    .slice(0, 8)
    .map((p) => ({
      productId: p.id,
      name: p.name,
      category: getInventoryCategoryLabel(p.category, ctx.locale),
      quantityOnHand: p.quantityOnHand,
      stockStatus: getStockStatusLabel(getStockStatus2(p.quantityOnHand, p.lowStockThreshold), ctx.locale),
      location: p.location,
    }));

  return ok(call.id, call.name, { count: matches.length, products: matches });
}

// Small local helper so this file doesn't need to import inventory-engine's
// InventoryProduct-typed getStockStatus just to re-derive the same status
// from the two fields already destructured above.
function getStockStatus2(quantityOnHand: number, lowStockThreshold: number): "in-stock" | "low-stock" | "out-of-stock" {
  if (quantityOnHand <= 0) return "out-of-stock";
  if (quantityOnHand <= lowStockThreshold) return "low-stock";
  return "in-stock";
}

// ---------------------------------------------------------------------------
// Dispatcher — a fixed switch (allow-list), never dynamic property access.
// ---------------------------------------------------------------------------

const STAFF_ONLY_TOOLS = new Set([
  "staff_get_analytics_summary",
  "staff_lookup_order",
  "staff_lookup_payment",
  "staff_lookup_risk",
  "staff_lookup_customer",
  "staff_lookup_inventory",
]);

export function executeGuardianTool(call: GuardianToolCall, ctx: ToolExecContext): GuardianToolResult {
  if (STAFF_ONLY_TOOLS.has(call.name) && ctx.mode !== "staff") {
    return toolError(call.id, call.name, "forbidden_scope");
  }

  // V12.2 — Autonomous Abuse Defense, defense-in-depth: a banned public
  // identity can never reach store data/mutations through the AI tool path
  // either, even if something upstream (BudGuardian.tsx's own pre-send gate)
  // were ever bypassed — see moderation-engine.ts's header. Staff are never
  // banned, so this never affects mode === "staff".
  if (ctx.mode === "public" && getActiveBan(getGuardianIdentities())) {
    return toolError(call.id, call.name, "identity_banned");
  }

  try {
    switch (call.name) {
      case "search_products":
        return toolSearchProducts(call, ctx);
      case "get_product_details":
        return toolGetProductDetails(call, ctx);
      case "get_categories":
        return toolGetCategories(call, ctx);
      case "get_store_info":
        return toolGetStoreInfo(call, ctx);
      case "get_faq_answer":
        return toolGetFaqAnswer(call, ctx);
      case "get_learning_center_topic":
        return toolGetLearningCenterTopic(call, ctx);
      case "get_my_orders":
        return toolGetMyOrders(call, ctx);
      case "get_order_status":
        return toolGetOrderStatus(call, ctx);
      case "get_payment_status_for_order":
        return toolGetPaymentStatusForOrder(call, ctx);
      case "get_checkout_status":
        return toolGetCheckoutStatus(call);
      case "get_payment_methods":
        return toolGetPaymentMethods(call, ctx);
      case "get_account_status":
        return toolGetAccountStatus(call);
      case "get_cart":
        return toolGetCart(call);
      case "add_to_cart":
        return toolAddToCart(call);
      case "update_cart_quantity":
        return toolUpdateCartQuantity(call);
      case "remove_from_cart":
        return toolRemoveFromCart(call);
      case "clear_cart":
        return toolClearCart(call);
      case "staff_get_analytics_summary":
        return toolStaffGetAnalyticsSummary(call, ctx);
      case "staff_lookup_order":
        return toolStaffLookupOrder(call, ctx);
      case "staff_lookup_payment":
        return toolStaffLookupPayment(call, ctx);
      case "staff_lookup_risk":
        return toolStaffLookupRisk(call, ctx);
      case "staff_lookup_customer":
        return toolStaffLookupCustomer(call);
      case "staff_lookup_inventory":
        return toolStaffLookupInventory(call, ctx);
      default:
        return toolError(call.id, call.name, "unknown_tool");
    }
  } catch {
    // A tool must never crash the conversation loop — surface a generic
    // error the model can react to ("I couldn't look that up") instead.
    return toolError(call.id, call.name, "tool_execution_failed");
  }
}
