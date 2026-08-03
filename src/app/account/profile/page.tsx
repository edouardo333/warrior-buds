import type { Metadata } from "next";
import AccountGuard from "@/components/account/AccountGuard";
import ProfileForm from "@/components/account/ProfileForm";

export const metadata: Metadata = {
  title: "Profil | Warrior Buds",
  description: "Gérez les informations de votre profil Warrior Buds.",
  robots: { index: false },
};

export default function AccountProfilePage() {
  return (
    <AccountGuard active="profile">
      <ProfileForm />
    </AccountGuard>
  );
}
