import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import PlaceholderSection from "@/components/PlaceholderSection";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Contact | Warrior Buds",
  description:
    "Get in touch with Warrior Buds or find directions to our Oka & Kanesatake location.",
};

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <PlaceholderSection
          eyebrow="Coming Soon"
          title="Contact"
          description="A full contact form and map will live here soon. In the meantime, find our details in the footer below."
        />
      </main>
      <Footer />
    </>
  );
}
