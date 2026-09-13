import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import GalleryVideo from "@/components/GalleryVideo";
import GalleryCta from "@/components/GalleryCta";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Galerie | Warrior Buds",
  description: "Un aperçu de la boutique Warrior Buds, des produits et de la communauté à Oka et Kanesatake.",
  alternates: { canonical: "/gallery" },
  openGraph: {
    title: "Galerie | Warrior Buds",
    description: "Un aperçu de la boutique Warrior Buds, des produits et de la communauté à Oka et Kanesatake.",
    url: "/gallery",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Galerie | Warrior Buds",
    description: "Un aperçu de la boutique Warrior Buds, des produits et de la communauté à Oka et Kanesatake.",
  },
};

export default function GalleryPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <GalleryVideo />
        <GalleryCta />
      </main>
      <Footer hideCta />
    </>
  );
}
