import type { Metadata } from "next";
import AccountGuard from "@/components/account/AccountGuard";
import AccountSettingsForm from "@/components/account/AccountSettingsForm";

export const metadata: Metadata = {
  title: "Paramètres | Warrior Buds",
  description: "Gérez les paramètres de votre compte Warrior Buds.",
  robots: { index: false },
};

export default function AccountSettingsPage() {
  return (
    <AccountGuard active="settings">
      <AccountSettingsForm />
    </AccountGuard>
  );
}
