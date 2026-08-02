import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import PlaceholderSection from "@/components/PlaceholderSection";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Learning Center | Warrior Buds",
  description:
    "Guides and resources on cannabis products, effects, and responsible use. Coming soon.",
};

export default function LearningCenterPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <PlaceholderSection
          eyebrow="Coming Soon"
          title="Learning Center"
          description="Guides on strains, effects, dosing, and responsible use — built to help you choose with confidence."
        />
      </main>
      <Footer />
    </>
  );
}
