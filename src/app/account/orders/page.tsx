import type { Metadata } from "next";
import AccountGuard from "@/components/account/AccountGuard";
import OrderHistoryList from "@/components/account/OrderHistoryList";

export const metadata: Metadata = {
  title: "Mes commandes | Warrior Buds",
  description: "Consultez l'historique de vos commandes Warrior Buds.",
  robots: { index: false },
};

export default function AccountOrdersPage() {
  return (
    <AccountGuard active="orders">
      <OrderHistoryList />
    </AccountGuard>
  );
}
