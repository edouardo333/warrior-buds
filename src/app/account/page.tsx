import type { Metadata } from "next";
import AccountGuard from "@/components/account/AccountGuard";
import AccountDashboard from "@/components/account/AccountDashboard";

export const metadata: Metadata = {
  title: "Mon compte | Warrior Buds",
  description: "Gérez votre compte Warrior Buds.",
  robots: { index: false },
};

export default function AccountPage() {
  return (
    <AccountGuard active="dashboard">
      <AccountDashboard />
    </AccountGuard>
  );
}
