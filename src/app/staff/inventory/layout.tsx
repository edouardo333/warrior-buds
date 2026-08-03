import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inventaire | Warrior Buds",
  robots: { index: false, follow: false },
};

export default function StaffInventoryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
