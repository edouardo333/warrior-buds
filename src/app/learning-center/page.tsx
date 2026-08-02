import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import PlaceholderSection from "@/components/PlaceholderSection";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Centre d'apprentissage | Warrior Buds",
  description:
    "Guides et ressources sur les produits de cannabis, leurs effets et la consommation responsable. Bientôt disponible.",
};

export default function LearningCenterPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <PlaceholderSection page="learningCenter" />
      </main>
      <Footer />
    </>
  );
}
