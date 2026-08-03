import type { Metadata } from "next";
import AccountGuard from "@/components/account/AccountGuard";
import AddressBook from "@/components/account/AddressBook";

export const metadata: Metadata = {
  title: "Adresses | Warrior Buds",
  description: "Gérez vos adresses de livraison Warrior Buds.",
  robots: { index: false },
};

export default function AccountAddressesPage() {
  return (
    <AccountGuard active="addresses">
      <AddressBook />
    </AccountGuard>
  );
}
