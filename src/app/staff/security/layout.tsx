import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sécurité | Espace employé | Warrior Buds",
  robots: { index: false, follow: false },
};

export default function StaffSecurityLayout({ children }: { children: React.ReactNode }) {
  return children;
}
