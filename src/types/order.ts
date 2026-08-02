// Shared order types for Bud Guardian's simulated order-assistance mode (V2).
// This models a local, in-memory order book only — no payment, delivery, or
// database is connected. Shapes are kept deliberately close to what a real
// backend/CRM would return so this layer can be swapped for a real API later
// without reworking the engine or chat UI.

export type OrderStatus =
  | "received"
  | "verifying"
  | "confirmed"
  | "preparing"
  | "ready"
  | "completed"
  | "cancelled";

export type FulfillmentMethod = "pickup" | "curbside";

export type PaymentStatus =
  | "not_started"
  | "pending"
  | "awaiting_confirmation"
  | "failed"
  | "paid_in_store";

export type PaymentMethod = "interac" | "cash" | "in_store_card";

export type OrderItem = {
  name: string;
  quantity: number;
  unitPrice: number;
};

export type OrderConfirmationFlags = {
  nameConfirmed: boolean;
  phoneConfirmed: boolean;
  fulfillmentConfirmed: boolean;
  ageConfirmed: boolean;
};

export type OrderPayment = {
  status: PaymentStatus;
  method: PaymentMethod | null;
};

export type Order = {
  id: string;
  customerName: string;
  phone: string;
  email: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  fulfillmentMethod: FulfillmentMethod;
  confirmation: OrderConfirmationFlags;
  payment: OrderPayment;
};

export type OrderLookupQuery = {
  orderNumber?: string;
  phone?: string;
  email?: string;
};

export type OrderMatchField = "orderNumber" | "phone" | "email";

export type OrderLookupResult = {
  order: Order;
  matchedFields: OrderMatchField[];
};

export type ConfirmationQuestionId = "name" | "phone" | "fulfillment" | "age";
