import type { Metadata } from "next";
import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCatalogView from "@/components/shop/ProductCatalogView";

export const metadata: Metadata = {
  title: "Produits | Warrior Buds",
  description: "Parcourez le catalogue complet de produits Warrior Buds — fleurs, comestibles, vapoteuses, concentrés, CBD et accessoires.",
  alternates: { canonical: "/products" },
  openGraph: {
    title: "Produits | Warrior Buds",
    description: "Parcourez le catalogue complet de produits Warrior Buds — fleurs, comestibles, vapoteuses, concentrés, CBD et accessoires.",
    url: "/products",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Produits | Warrior Buds",
    description: "Parcourez le catalogue complet de produits Warrior Buds — fleurs, comestibles, vapoteuses, concentrés, CBD et accessoires.",
  },
};

export default function ProductsPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={null}>
          <ProductCatalogView />
        </Suspense>
      </main>
      <Footer hideCta />
    </>
  );
}
