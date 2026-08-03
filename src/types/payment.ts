// Bud Guardian V2.2 — payment types. Models a standalone payment ledger
// (PaymentRecord) tied to an Order via orderId, kept separate from
// Order.payment (types/order.ts) so V2/V2.1's order shapes are never
// touched — this module only ever reads an order's id/total and writes back
// through the existing OrderPayment field, never redefines it.
//
// PaymentProvider deliberately lists every rail Warrior Buds may plug in
// later (Interac, Stripe, Square, Moneris, Clover, in-store, QR code), but
// this simulated build only ever creates "interac" and "in_store" records —
// everything else is a type-level placeholder for a future real
// integration. No API is connected here; all data stays local and fictional.

export type PaymentProvider =
  | "interac"
  | "stripe"
  | "square"
  | "moneris"
  | "clover"
  | "in_store"
  | "qr_code";

// The five statuses requested for this standalone ledger — distinct from
// OrderPayment's PaymentStatus (types/order.ts), which stays owned by
// V2.1's staff dashboard.
export type PaymentTransactionStatus = "pending" | "received" | "declined" | "expired" | "cancelled";

export type PaymentHistoryEntry = {
  id: string;
  status: PaymentTransactionStatus;
  at: string;
  by: string;
  note?: string;
};

export type PaymentRecord = {
  id: string; // simulated transaction number, e.g. "TXN-4F82A1"
  orderId: string;
  provider: PaymentProvider;
  amount: number;
  status: PaymentTransactionStatus;
  createdAt: string;
  updatedAt: string;
  expiresAt: string | null;
  history: PaymentHistoryEntry[];
};

export type PaymentLookupQuery = {
  orderNumber?: string;
  phone?: string;
  email?: string;
  transactionId?: string;
};

export type PaymentMatchField = "orderNumber" | "phone" | "email" | "transactionId";

export type PaymentLookupResult = {
  payment: PaymentRecord;
  matchedFields: PaymentMatchField[];
};

// ---------------------------------------------------------------------------
// Forward-looking, unconnected shapes — modeled now so a real integration
// (any provider above, refunds, invoicing, notifications) can be dropped in
// later without reworking these types. Nothing in this build ever
// constructs, persists, or calls out with the types below.
// ---------------------------------------------------------------------------

export type PaymentGatewayConfig = {
  provider: PaymentProvider;
  enabled: boolean;
  displayName: string;
};

export type RefundStatus = "requested" | "processing" | "completed" | "rejected";

export type Refund = {
  id: string;
  paymentId: string;
  orderId: string;
  amount: number;
  status: RefundStatus;
  reason: string | null;
  requestedAt: string;
  requestedBy: string;
};

export type InvoiceStatus = "draft" | "issued" | "paid" | "void";

export type Invoice = {
  id: string;
  orderId: string;
  paymentId: string | null;
  status: InvoiceStatus;
  issuedAt: string | null;
  amount: number;
};

export type PaymentNotificationChannel = "sms" | "email" | "push";

export type PaymentNotificationKind = "payment_received" | "payment_declined" | "payment_expired" | "payment_reminder";

export type PaymentNotification = {
  id: string;
  paymentId: string;
  orderId: string;
  kind: PaymentNotificationKind;
  channel: PaymentNotificationChannel;
  at: string;
};
