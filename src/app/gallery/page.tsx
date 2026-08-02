import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import PlaceholderSection from "@/components/PlaceholderSection";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Gallery | Warrior Buds",
  description: "A look inside Warrior Buds. Coming soon.",
};

export default function GalleryPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <PlaceholderSection
          eyebrow="Coming Soon"
          title="Gallery"
          description="A look inside the store, the products, and the community — coming soon."
        />
      </main>
      <Footer />
    </>
  );
}
