import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Personnel | Espace employé | Warrior Buds",
  robots: { index: false, follow: false },
};

export default function StaffTeamLayout({ children }: { children: React.ReactNode }) {
  return children;
}
