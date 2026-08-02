import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Espace employé | Warrior Buds",
  robots: { index: false, follow: false },
};

export default function StaffOrdersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
