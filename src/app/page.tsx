import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import TrustBar from "@/components/TrustBar";
import Categories from "@/components/Categories";
import WhyWarriorBuds from "@/components/WhyWarriorBuds";
import HomeSeoAccordion from "@/components/HomeSeoAccordion";
import HomeFinalCta from "@/components/HomeFinalCta";
import Footer from "@/components/Footer";
import { SITE } from "@/lib/site";

// title/description aren't repeated here — this page has none of its own
// and inherits app/layout.tsx's (SITE.defaultTitle/defaultDescription).
// openGraph/twitter DO need to repeat them: Next replaces (not merges) a
// parent's openGraph/twitter object wholesale once a child segment defines
// its own, so setting only `url` here would otherwise drop the inherited
// title/description from every crawler-facing OG/Twitter tag on "/".
export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE.name,
    title: SITE.defaultTitle,
    description: SITE.defaultDescription,
    url: "/",
    locale: "fr_CA",
  },
  twitter: {
    card: "summary",
    title: SITE.defaultTitle,
    description: SITE.defaultDescription,
  },
};

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
