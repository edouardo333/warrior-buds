import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import PlaceholderSection from "@/components/PlaceholderSection";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Produits | Warrior Buds",
  description: "Parcourez le catalogue de produits Warrior Buds. Bientôt disponible.",
};

export default function ProductsPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <PlaceholderSection page="products" />
      </main>
      <Footer />
    </>
  );
}
