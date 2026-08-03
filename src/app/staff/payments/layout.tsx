import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Paiements | Espace employé | Warrior Buds",
  robots: { index: false, follow: false },
};

export default function StaffPaymentsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
