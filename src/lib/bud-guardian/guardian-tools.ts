// Bud Guardian V10 — controlled tool catalog. This is the ONLY vocabulary
// the external AI provider is ever given: a fixed, named, schema-described
// list of read-only lookups. Isomorphic — imported by both the server route
// handler (app/api/bud-guardian/chat/route.ts, which hands these schemas to
// the model) and the browser-side executor (tool-executor.ts, which is the
// only thing that actually runs one) — so the exact same names/descriptions/
// schemas are what the model is offered and what is allowed to execute.
// This file itself must stay free of store/React/Next imports so it is safe
// to import from either runtime unchanged.
//
// Adding a capability means adding an entry here AND a matching case in
// tool-executor.ts — there is no other way for the AI to reach app data (see
// AGENTS instructions: "AI can only interact through explicit approved
// tools", "No arbitrary mutation tools yet"). Every tool below is read-only
// EXCEPT the cart tools (V12 — get_cart/add_to_cart/update_cart_quantity/
// remove_from_cart/clear_cart), which are the one deliberate, narrowly-
// scoped exception: they can only ever change the SIGNED-IN or GUEST
// caller's own draft shopping cart (never another customer's), always
// stock-validated, and never touch an order, payment, account, inventory
// record, or permission. Checkout/payment stays an explicit action the
// customer takes themselves on the real Cart/Checkout pages — no tool here
// can place an order or take a payment.

export type GuardianToolScope = "public" | "staff";

export type GuardianJsonSchema = {
  type: "object";
  properties: Record<string, { type: string; description: string; enum?: readonly string[] }>;
  required?: string[];
};

export type GuardianToolDefinition = {
  name: string;
  description: string;
  scope: GuardianToolScope;
  input_schema: GuardianJsonSchema;
};

const PRODUCT_CATEGORIES = [
  "flower", "pre-rolls", "edibles", "concentrates", "vapes", "cbd", "accessories", "topicals", "mushrooms",
] as const;

// ---------------------------------------------------------------------------
// Public tools — safe to offer in the customer-facing chat. Every one of
// these only ever reads either public catalog/store data, or the SIGNED-IN
// customer's own data (never another customer's).
// ---------------------------------------------------------------------------

const PUBLIC_TOOLS: GuardianToolDefinition[] = [
  {
    name: "search_products",
    description:
      "Search the live Warrior Buds product catalog by keyword, category, and/or budget. Always use this instead of guessing product names, prices, or availability — e.g. for 'vapes under $30', 'cheaper than $50', or 'what's available under $X'.",
    scope: "public",
    input_schema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Free-text search — a product name, brand, or general term (e.g. 'gummies', 'sativa vape')." },
        category: { type: "string", description: "Optional category filter.", enum: PRODUCT_CATEGORIES },
        maxPrice: { type: "number", description: "Optional — only include products priced at or under this amount (CAD)." },
        minPrice: { type: "number", description: "Optional — only include products priced strictly above this amount (CAD)." },
      },
    },
  },
  {
    name: "get_product_details",
    description: "Get full details (price, stock, THC/CBD, rating, description) for one product by its id, as returned by search_products.",
    scope: "public",
    input_schema: {
      type: "object",
      properties: { productId: { type: "string", description: "A product id returned by search_products." } },
      required: ["productId"],
    },
  },
  {
    name: "get_categories",
    description: "List every product category Warrior Buds carries, with localized labels.",
    scope: "public",
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "get_store_info",
    description:
      "Get Warrior Buds' current open/closed status, weekly hours, and contact info (phone, address, Instagram, Google Maps). Always use this instead of guessing hours or contact details.",
    scope: "public",
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "get_faq_answer",
    description: "Search Warrior Buds' store FAQ/policies knowledge base (payment, age requirements, purchase process, legal, etc.) for the closest matching answer.",
    scope: "public",
    input_schema: {
      type: "object",
      properties: { question: { type: "string", description: "The customer's question, verbatim or paraphrased." } },
      required: ["question"],
    },
  },
  {
    name: "get_learning_center_topic",
    description: "Search Warrior Buds' educational Learning Center (cannabis basics, consumption methods, effects, responsible use) for a topic.",
    scope: "public",
    input_schema: {
      type: "object",
      properties: { topic: { type: "string", description: "A topic, e.g. 'sativa', 'edibles dosing', 'CBD'." } },
      required: ["topic"],
    },
  },
  {
    name: "get_my_orders",
    description:
      "List the signed-in customer's own recent storefront orders (id, status, total, date). Only works if the customer is currently signed in on this device — if the result says they're not signed in, tell them to sign in to their account or use order tracking instead.",
    scope: "public",
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "get_order_status",
    description: "Get the status/tracking details of one of the signed-in customer's OWN orders, by order id. Never returns another customer's order.",
    scope: "public",
    input_schema: {
      type: "object",
      properties: { orderId: { type: "string", description: "An order id, e.g. 'WB-100234'." } },
      required: ["orderId"],
    },
  },
  {
    name: "get_payment_status_for_order",
    description:
      "Get the real payment status of one of the signed-in customer's OWN orders, by order id — whether payment is pending, received, or the order was cancelled. Warrior Buds' order system does not track a separate 'declined' or 'expired' payment flag; if payment never arrives, staff cancel the order manually — always reflect that honestly instead of inventing a decline/expiry status.",
    scope: "public",
    input_schema: {
      type: "object",
      properties: { orderId: { type: "string", description: "An order id, e.g. 'WB-100234'." } },
      required: ["orderId"],
    },
  },

  // -------------------------------------------------------------------------
  // V13 — Checkout & Order Assistant. Both read-only, grounded entirely in
  // real live data (the customer's own cart/account and the real
  // payment-provider registry) — never a simulated or invented result.
  // -------------------------------------------------------------------------
  {
    name: "get_checkout_status",
    description:
      "Get the customer's real checkout readiness: their current cart summary, whether it's empty, whether they're signed in or shopping as a guest, and — if signed in — whether they have a saved default address. Always use this instead of guessing what's needed to check out.",
    scope: "public",
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "get_payment_methods",
    description:
      "List the payment methods currently enabled at Warrior Buds checkout, from the real payment-provider configuration, and whether each one has real step-by-step instructions or is still a demo placeholder. Always use this instead of guessing which payment methods are accepted.",
    scope: "public",
    input_schema: { type: "object", properties: {} },
  },

  // -------------------------------------------------------------------------
  // V14 — Customer Support & Problem Resolution. Read-only, grounded
  // entirely in the caller's own real account (never another customer's) —
  // see tool-executor.ts's header for the identical ownership rule the
  // order/payment tools above already enforce.
  // -------------------------------------------------------------------------
  {
    name: "get_account_status",
    description:
      "Get whether the caller currently has a real signed-in Warrior Buds account, whether its email is verified, and how many saved addresses/payment methods it has on file. Never returns the email, phone, or password itself. Always use this instead of guessing when the customer asks for login/account/password help.",
    scope: "public",
    input_schema: { type: "object", properties: {} },
  },

  // -------------------------------------------------------------------------
  // V12 — Shopping & Cart Assistant. Every tool here acts on the SIGNED-IN or
  // GUEST caller's own draft cart only (never another customer's), always
  // through the real cart engine (lib/shop/cart-engine.ts), always stock-
  // validated. None of them can place an order or take a payment — checkout
  // stays an explicit customer action on the real Cart/Checkout pages.
  // -------------------------------------------------------------------------
  {
    name: "get_cart",
    description:
      "Get the customer's current shopping cart: each item with product id/name/price/quantity/line total, and the cart's real subtotal, shipping, tax, and total. Always use this instead of guessing what's in the cart or its total.",
    scope: "public",
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "add_to_cart",
    description:
      "Add a product to the customer's cart, or increase its quantity if it's already in the cart. Resolve the productId from search_products/get_product_details (or an earlier get_cart/add_to_cart result) first — never guess an id. The result reports real stock and whether the requested quantity had to be capped; never claim more was added than the result confirms.",
    scope: "public",
    input_schema: {
      type: "object",
      properties: {
        productId: { type: "string", description: "A product id, as returned by search_products or get_product_details." },
        quantity: { type: "number", description: "How many units to add. Defaults to 1 if omitted." },
      },
      required: ["productId"],
    },
  },
  {
    name: "update_cart_quantity",
    description: "Set the exact quantity of a product already in the customer's cart (see get_cart for current items/ids). Setting quantity to 0 removes it.",
    scope: "public",
    input_schema: {
      type: "object",
      properties: {
        productId: { type: "string", description: "A product id already in the cart (see get_cart)." },
        quantity: { type: "number", description: "The new quantity (0 removes the item)." },
      },
      required: ["productId", "quantity"],
    },
  },
  {
    name: "remove_from_cart",
    description: "Remove a product entirely from the customer's cart, regardless of its quantity.",
    scope: "public",
    input_schema: {
      type: "object",
      properties: { productId: { type: "string", description: "A product id already in the cart (see get_cart)." } },
      required: ["productId"],
    },
  },
  {
    name: "clear_cart",
    description: "Remove every item from the customer's cart. Only do this when the customer clearly asks to empty/clear their whole cart.",
    scope: "public",
    input_schema: { type: "object", properties: {} },
  },
];

// ---------------------------------------------------------------------------
// Staff-only tools — never offered in public-mode conversations (the server
// route only includes these when mode === "staff"; the client executor
// double-checks the same thing before running one — see tool-executor.ts).
// ---------------------------------------------------------------------------

const STAFF_TOOLS: GuardianToolDefinition[] = [
  {
    name: "staff_get_analytics_summary",
    description:
      "Get the KPI/insights summary for the analytics period currently open on the staff dashboard (revenue, payments, risk, inventory, customers, top products, peak times).",
    scope: "staff",
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "staff_lookup_order",
    description: "Look up one store order by id for staff (status, payment, total, items, masked customer name).",
    scope: "staff",
    input_schema: {
      type: "object",
      properties: { orderId: { type: "string", description: "An order id, e.g. 'WB-100234'." } },
      required: ["orderId"],
    },
  },
  {
    name: "staff_lookup_payment",
    description: "Look up a payment record for staff, by order id or transaction id.",
    scope: "staff",
    input_schema: {
      type: "object",
      properties: {
        orderId: { type: "string", description: "An order id, e.g. 'WB-100234'." },
        transactionId: { type: "string", description: "A transaction id, e.g. 'TXN-ABC123'." },
      },
    },
  },
  {
    name: "staff_lookup_risk",
    description: "Look up the risk/fraud assessment for staff, by order id.",
    scope: "staff",
    input_schema: {
      type: "object",
      properties: { orderId: { type: "string", description: "An order id, e.g. 'WB-100234'." } },
      required: ["orderId"],
    },
  },
  {
    name: "staff_lookup_customer",
    description: "Search staff CRM customer profiles by name, phone, or email fragment.",
    scope: "staff",
    input_schema: {
      type: "object",
      properties: { query: { type: "string", description: "A name, phone, or email fragment." } },
      required: ["query"],
    },
  },
  {
    name: "staff_lookup_inventory",
    description: "Look up inventory/stock for staff, by product name fragment.",
    scope: "staff",
    input_schema: {
      type: "object",
      properties: { query: { type: "string", description: "A product name fragment." } },
      required: ["query"],
    },
  },
];

export const GUARDIAN_TOOLS: GuardianToolDefinition[] = [...PUBLIC_TOOLS, ...STAFF_TOOLS];

// Public-mode conversations only ever get PUBLIC_TOOLS; staff-mode ones get
// both (staff can still ask ordinary product/FAQ questions too).
export function toolsForScope(scope: GuardianToolScope): GuardianToolDefinition[] {
  return scope === "staff" ? GUARDIAN_TOOLS : PUBLIC_TOOLS;
}

export type GuardianToolName = (typeof GUARDIAN_TOOLS)[number]["name"];

export type GuardianToolCall = { id: string; name: string; input: Record<string, unknown> };

export type GuardianToolResult = {
  id: string;
  name: string;
  output: unknown;
  isError?: boolean;
  // Optional structured hints the caller can use without re-parsing output —
  // today just the product a search/detail tool resolved to, so the UI can
  // keep its "last product discussed" conversation memory working the same
  // way it already does for LocalHeuristicProvider (see product-intent.ts).
  meta?: { productId?: string };
};
