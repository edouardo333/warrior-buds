import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FaqHero from "@/components/faq/FaqHero";
import FaqExplorer from "@/components/faq/FaqExplorer";
import FaqCta from "@/components/faq/FaqCta";

export const metadata: Metadata = {
  title: "FAQ | Warrior Buds",
  description:
    "Réponses aux questions les plus fréquentes du service à la clientèle Warrior Buds — commandes, paiements, promotions, cueillette, suivi, Bud Guardian, votre compte et les produits.",
  alternates: { canonical: "/faq" },
  openGraph: {
    title: "FAQ | Warrior Buds",
    description:
      "Réponses aux questions les plus fréquentes du service à la clientèle Warrior Buds — commandes, paiements, promotions, cueillette, suivi, Bud Guardian, votre compte et les produits.",
    url: "/faq",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "FAQ | Warrior Buds",
    description:
      "Réponses aux questions les plus fréquentes du service à la clientèle Warrior Buds — commandes, paiements, promotions, cueillette, suivi, Bud Guardian, votre compte et les produits.",
  },
};

export default function FaqPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <FaqHero />
        <FaqExplorer />
        <FaqCta />
      </main>
      <Footer hideCta />
    </>
  );
}
