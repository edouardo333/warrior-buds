import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import AboutHero from "@/components/AboutHero";
import AboutBeginning from "@/components/AboutBeginning";
import AboutValues from "@/components/AboutValues";
import AboutCommunity from "@/components/AboutCommunity";
import AboutCta from "@/components/AboutCta";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "À propos | Warrior Buds",
  description:
    "Découvrez Warrior Buds, un dispensaire enraciné dans la communauté d'Oka et Kanesatake — notre histoire, nos valeurs et ce qui nous anime.",
};

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <AboutHero />
        <AboutBeginning />
        <AboutValues />
        <AboutCommunity />
        <AboutCta />
      </main>
      <Footer />
    </>
  );
}
