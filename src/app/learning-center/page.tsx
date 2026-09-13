import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import LearningCenterHero from "@/components/LearningCenterHero";
import LearningCenterHub from "@/components/LearningCenterHub";
import LearningCenterCta from "@/components/LearningCenterCta";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Centre d'apprentissage | Warrior Buds",
  description:
    "Découvrez le Centre d'apprentissage de Warrior Buds — des guides clairs sur les bases du cannabis, les concentrés, les produits à haute puissance, le CBD, les comestibles, les produits topiques, les psychédéliques, les produits de nicotine et la consommation responsable.",
  alternates: { canonical: "/learning-center" },
  openGraph: {
    title: "Centre d'apprentissage | Warrior Buds",
    description:
      "Découvrez le Centre d'apprentissage de Warrior Buds — des guides clairs sur les bases du cannabis, les concentrés, les produits à haute puissance, le CBD, les comestibles, les produits topiques, les psychédéliques, les produits de nicotine et la consommation responsable.",
    url: "/learning-center",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Centre d'apprentissage | Warrior Buds",
    description:
      "Découvrez le Centre d'apprentissage de Warrior Buds — des guides clairs sur les bases du cannabis, les concentrés, les produits à haute puissance, le CBD, les comestibles, les produits topiques, les psychédéliques, les produits de nicotine et la consommation responsable.",
  },
};

export default function LearningCenterPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <LearningCenterHero />
        <LearningCenterHub />
        <LearningCenterCta />
      </main>
      <Footer hideCta />
    </>
  );
}
