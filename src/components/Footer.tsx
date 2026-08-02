import Link from "next/link";
import Logo from "./Logo";
import Reveal from "./Reveal";
import { SITE } from "@/lib/site";
import { getWeeklySchedule } from "@/lib/hours";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "Learning Center", href: "/learning-center" },
  { label: "About", href: "/about" },
  { label: "Gallery", href: "/gallery" },
  { label: "Contact", href: "/contact" },
];

export default function Footer() {
  const schedule = getWeeklySchedule();

  return (
    <>
      <section className="relative overflow-hidden border-t border-white/10 bg-black px-5 py-20 sm:px-8">
        <div className="pointer-events-none absolute left-1/2 top-0 h-96 w-[36rem] -translate-x-1/2 rounded-full bg-wb-orange/10 blur-[150px]" />
        <Reveal className="relative mx-auto max-w-3xl text-center">
          <h2 className="font-display text-4xl tracking-wide text-foreground sm:text-5xl">
            Ready to Visit <span className="text-gradient-ember">Warrior Buds</span>?
          </h2>
          <p className="mt-4 text-foreground/60">
            Get directions and discover one of Kanesatake&rsquo;s most
            trusted dispensaries.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <a
              href={SITE.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-gradient-to-r from-wb-red via-wb-orange to-wb-yellow px-8 py-3.5 text-sm font-semibold uppercase tracking-wide text-black transition-transform duration-200 hover:scale-105"
            >
              Get Directions
            </a>
            <a
              href={SITE.phoneHref}
              className="rounded-full border border-white/25 bg-white/5 px-8 py-3.5 text-sm font-semibold uppercase tracking-wide text-foreground transition-colors duration-200 hover:border-wb-orange/60 hover:text-wb-orange"
            >
              Call Now
            </a>
          </div>
        </Reveal>
      </section>

      <footer className="relative border-t border-white/10 bg-black px-5 pb-8 pt-16 sm:px-8">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-x-8 gap-y-12 sm:grid-cols-3 lg:grid-cols-5">
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <Logo imageClassName="h-9" />
            <p className="mt-4 max-w-xs text-sm text-foreground/60">
              Premium cannabis experience, rooted in Oka &amp; Kanesatake.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-wb-orange">
              Explore
            </h3>
            <ul className="mt-4 flex flex-col gap-3">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-foreground/70 transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-wb-orange">
              Visit Us
            </h3>
            <a
              href={SITE.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 block"
            >
              <address className="flex flex-col gap-1 text-sm not-italic text-foreground/70 transition-colors hover:text-foreground">
                <span>{SITE.addressLine1}</span>
                <span>{SITE.addressLine2}</span>
              </address>
            </a>
            <a
              href={SITE.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-sm text-foreground/70 transition-colors hover:text-foreground"
            >
              Get Directions →
            </a>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-wb-orange">
              Opening Hours
            </h3>
            <ul className="mt-4 flex flex-col gap-1.5 text-sm text-foreground/70">
              {schedule.map((entry) => (
                <li key={entry.label} className="flex justify-between gap-4">
                  <span>{entry.label}</span>
                  <span>{entry.hours}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-wb-orange">
              Contact
            </h3>
            <ul className="mt-4 flex flex-col gap-2 text-sm text-foreground/70">
              <li>
                <a href={SITE.phoneHref} className="transition-colors hover:text-foreground">
                  {SITE.phoneDisplay}
                </a>
              </li>
              <li>
                <a
                  href={SITE.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-foreground"
                >
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href={SITE.linktreeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-foreground"
                >
                  Linktree
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="divider-ember mx-auto mt-14 max-w-6xl" />
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 pt-6 text-center text-xs text-foreground/40">
          <p>
            © {new Date().getFullYear()} Warrior Buds. All Rights Reserved.
            <span className="mx-1.5 text-foreground/20">·</span>
            Website designed &amp; developed by Brochu Digital.
          </p>
          <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
            <span className="transition-colors hover:text-foreground/70">Privacy Policy</span>
            <span className="text-foreground/20">•</span>
            <span className="transition-colors hover:text-foreground/70">Terms &amp; Conditions</span>
            <span className="text-foreground/20">•</span>
            <span className="transition-colors hover:text-foreground/70">Cookie Policy</span>
          </p>
          <p className="max-w-2xl text-foreground/30">
            For adults 18+ only. Cannabis sold in accordance with the laws and
            regulations of Québec, Canada and the Mohawk Territory of
            Kanesatake.
          </p>
        </div>
      </footer>
    </>
  );
}
