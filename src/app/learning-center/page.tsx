import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import LearningCenterHero from "@/components/LearningCenterHero";
import LearningCenterHub from "@/components/LearningCenterHub";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Centre d'apprentissage | Warrior Buds",
  description:
    "Découvrez le Centre d'apprentissage de Warrior Buds — des guides clairs sur les bases du cannabis, les concentrés, les produits à haute puissance, les psychédéliques, les produits de nicotine et la consommation responsable.",
};

export default function LearningCenterPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <LearningCenterHero />
        <LearningCenterHub />
      </main>
      <Footer />
    </>
  );
}
