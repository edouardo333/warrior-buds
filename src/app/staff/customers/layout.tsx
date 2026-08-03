import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Clients | Espace employé | Warrior Buds",
  robots: { index: false, follow: false },
};

export default function StaffCustomersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
