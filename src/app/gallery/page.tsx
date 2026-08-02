import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import PlaceholderSection from "@/components/PlaceholderSection";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Galerie | Warrior Buds",
  description: "Un aperçu de Warrior Buds. Bientôt disponible.",
};

export default function GalleryPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <PlaceholderSection page="gallery" />
      </main>
      <Footer />
    </>
  );
}
