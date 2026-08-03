import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WishlistGrid from "@/components/wishlist/WishlistGrid";

export const metadata: Metadata = {
  title: "Liste de souhaits | Warrior Buds",
  description: "Votre liste de souhaits Warrior Buds.",
  robots: { index: false },
};

export default function WishlistPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <WishlistGrid />
      </main>
      <Footer />
    </>
  );
}
