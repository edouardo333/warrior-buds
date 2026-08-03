import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Produit | Inventaire | Warrior Buds",
  robots: { index: false, follow: false },
};

export default function StaffInventoryProductLayout({ children }: { children: React.ReactNode }) {
  return children;
}
