import type { Metadata } from "next";
import AccountGuard from "@/components/account/AccountGuard";
import PaymentPreferences from "@/components/account/PaymentPreferences";

export const metadata: Metadata = {
  title: "Modes de paiement | Warrior Buds",
  description: "Gérez vos préférences de paiement Warrior Buds.",
  robots: { index: false },
};

export default function AccountPaymentMethodsPage() {
  return (
    <AccountGuard active="paymentMethods">
      <PaymentPreferences />
    </AccountGuard>
  );
}
