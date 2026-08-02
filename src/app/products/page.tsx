import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import PlaceholderSection from "@/components/PlaceholderSection";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Products | Warrior Buds",
  description: "Browse the Warrior Buds product catalog. Coming soon.",
};

export default function ProductsPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <PlaceholderSection
          eyebrow="Coming Soon"
          title="Products"
          description="Our full catalog of flower, edibles, vapes, concentrates, CBD, and accessories is on its way."
        />
      </main>
      <Footer />
    </>
  );
}
