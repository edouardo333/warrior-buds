import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import OrderConfirmationView from "@/components/checkout/OrderConfirmationView";

export const metadata: Metadata = {
  title: "Commande confirmée | Warrior Buds",
  description: "Votre commande Warrior Buds a été confirmée.",
  robots: { index: false },
};

export default async function OrderConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <OrderConfirmationView orderId={id} />
      </main>
      <Footer />
    </>
  );
}
