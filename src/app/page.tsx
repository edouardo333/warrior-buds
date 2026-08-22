import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import TrustBar from "@/components/TrustBar";
import Categories from "@/components/Categories";
import WhyWarriorBuds from "@/components/WhyWarriorBuds";
import HomeSeoAccordion from "@/components/HomeSeoAccordion";
import HomeFinalCta from "@/components/HomeFinalCta";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Hero />
        <TrustBar />
        <Categories />
        <WhyWarriorBuds />
        <HomeSeoAccordion />
        <HomeFinalCta />
      </main>
      <Footer hideCta />
    </>
  );
}
