// Storefront — customer order lifecycle rules: status labels, the ordered
// tracking timeline, and a demo-only "advance" helper. There is no real
// payment gateway or staff workflow wired in to move an order forward in
// this build (that's the Staff Dashboard/CRM, which this module never
// touches), so the account order-detail page offers a clearly-labeled
// simulate control that calls simulateAdvanceOrder(). Never imports from or
// writes to data/bud-guardian/**, lib/staff/**, or components/staff/**.

import { advanceOrderStatus, setTrackingNumber } from "@/data/shop/order-store";
import type { Locale } from "@/lib/i18n/types";
import type { ShopOrder, ShopOrderStatus } from "@/types/shop-order";

export const ORDER_STATUS_SEQUENCE: ShopOrderStatus[] = [
  "pending_payment",
  "payment_received",
  "processing",
  "packed",
  "shipped",
  "delivered",
];

const STATUS_LABELS: Record<ShopOrderStatus, Record<Locale, string>> = {
  pending_payment: { fr: "En attente de paiement", en: "Pending Payment" },
  payment_received: { fr: "Paiement reçu", en: "Payment Received" },
  processing: { fr: "En traitement", en: "Processing" },
  packed: { fr: "Emballée", en: "Packed" },
  shipped: { fr: "Expédiée", en: "Shipped" },
  delivered: { fr: "Livrée", en: "Delivered" },
  cancelled: { fr: "Annulée", en: "Cancelled" },
};

export function getOrderStatusLabel(status: ShopOrderStatus, locale: Locale): string {
  return STATUS_LABELS[status][locale];
}

export function getNextStatus(status: ShopOrderStatus): ShopOrderStatus | null {
  const index = ORDER_STATUS_SEQUENCE.indexOf(status);
  if (index === -1 || index === ORDER_STATUS_SEQUENCE.length - 1) return null;
  return ORDER_STATUS_SEQUENCE[index + 1];
}

export type TrackingStepState = "done" | "current" | "upcoming";

export type TrackingStep = {
  status: ShopOrderStatus;
  label: string;
  at: string | null;
  state: TrackingStepState;
};

export function buildTrackingSteps(order: ShopOrder, locale: Locale): TrackingStep[] {
  const currentIndex = ORDER_STATUS_SEQUENCE.indexOf(order.status);
  return ORDER_STATUS_SEQUENCE.map((status, index) => {
    const entry = order.timeline.find((t) => t.status === status);
    const state: TrackingStepState =
      order.status === "cancelled" ? "upcoming" : index < currentIndex ? "done" : index === currentIndex ? "current" : "upcoming";
    return { status, label: getOrderStatusLabel(status, locale), at: entry?.at ?? null, state };
  });
}

function generateTrackingNumber(): string {
  return `CA${Math.floor(100000000 + Math.random() * 899999999)}CA`;
}

export function simulateAdvanceOrder(order: ShopOrder): ShopOrder | undefined {
  const next = getNextStatus(order.status);
  if (!next) return undefined;
  const updated = advanceOrderStatus(order.id, next);
  if (updated && next === "shipped" && !updated.canadaPostTrackingNumber) {
    return setTrackingNumber(order.id, generateTrackingNumber());
  }
  return updated;
}
