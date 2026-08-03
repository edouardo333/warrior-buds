import type { Metadata } from "next";
import AccountGuard from "@/components/account/AccountGuard";
import OrderDetailView from "@/components/orders/OrderDetailView";

export const metadata: Metadata = {
  title: "Détails de la commande | Warrior Buds",
  description: "Détails et suivi de votre commande Warrior Buds.",
  robots: { index: false },
};

export default async function AccountOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <AccountGuard active="orders">
      <OrderDetailView orderId={id} />
    </AccountGuard>
  );
}
