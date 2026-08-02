import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import PlaceholderSection from "@/components/PlaceholderSection";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "About | Warrior Buds",
  description:
    "Learn about Warrior Buds, a community-rooted dispensary in Oka & Kanesatake. Coming soon.",
};

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <PlaceholderSection
          eyebrow="Coming Soon"
          title="About Us"
          description="Our story, our community, and what drives Warrior Buds — coming soon."
        />
      </main>
      <Footer />
    </>
  );
}
