import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import ReviewsHero from "@/components/ReviewsHero";
import ReviewsGrid from "@/components/ReviewsGrid";
import ReviewsCta from "@/components/ReviewsCta";
import ReviewsStoreCta from "@/components/ReviewsStoreCta";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Avis | Warrior Buds",
  description:
    "De vrais avis de clients Warrior Buds à Oka et Kanesatake — découvrez ce que disent des centaines de clients satisfaits.",
};

export default function ReviewsPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <ReviewsHero />
        <ReviewsGrid />
        <ReviewsCta />
        <ReviewsStoreCta />
      </main>
      <Footer hideCta />
    </>
  );
}
