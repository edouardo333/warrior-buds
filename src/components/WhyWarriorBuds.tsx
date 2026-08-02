import Link from "next/link";
import SmartImage from "./SmartImage";
import Reveal from "./Reveal";

const REASONS = [
  {
    title: "Premium Selection",
    description: "Every product is curated for quality, potency, and consistency.",
  },
  {
    title: "Friendly Expert Service",
    description: "Our team knows the products and takes the time to guide you right.",
  },
  {
    title: "Community-Owned Experience",
    description: "Proudly rooted in Oka & Kanesatake, built by and for our community.",
  },
];

export default function WhyWarriorBuds() {
  return (
    <section className="relative overflow-hidden bg-wb-charcoal px-5 py-24 sm:px-8 lg:py-32">
      <div className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-wb-red/10 blur-[140px]" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-wb-orange/10 blur-[140px]" />

      <div className="relative mx-auto grid max-w-6xl gap-14 lg:grid-cols-2 lg:items-center lg:gap-20">
        <Reveal>
          <div className="relative h-80 overflow-hidden rounded-3xl border border-white/10 sm:h-[28rem] lg:h-[34rem]">
            <SmartImage
              src="/images/hero/hero-outside-night.webp"
              alt="Warrior Buds dispensary storefront at night"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
              fallback={
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#2a1206_0%,_#150a04_55%,_#000000_100%)]">
                  <div className="absolute inset-0 bg-noise opacity-[0.05]" />
                </div>
              }
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </div>
        </Reveal>

        <Reveal delay={150}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-wb-orange">
              The Difference
            </p>
            <h2 className="mt-3 font-display text-4xl tracking-wide text-foreground sm:text-5xl">
              Why Warrior Buds
            </h2>
            <p className="mt-5 max-w-md text-foreground/60">
              A dispensary built on trust — curated products, a team that
              actually knows them, and a business rooted in this community.
            </p>

            <div className="mt-10 flex flex-col divide-y divide-white/10 border-t border-white/10">
              {REASONS.map((reason, index) => (
                <div key={reason.title} className="flex items-start gap-5 py-5">
                  <span className="font-display text-2xl text-gradient-ember">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="font-display text-xl tracking-wide text-foreground">
                      {reason.title}
                    </h3>
                    <p className="mt-1 text-sm text-foreground/60">
                      {reason.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <Link
              href="/about"
              className="mt-10 inline-flex items-center gap-2 rounded-full border border-white/25 px-8 py-3.5 text-sm font-semibold uppercase tracking-wide text-foreground transition-colors duration-200 hover:border-wb-orange/60 hover:text-wb-orange"
            >
              Our Story
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
