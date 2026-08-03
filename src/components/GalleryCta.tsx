"use client";

import { MapPin, Phone } from "lucide-react";
import Reveal from "./Reveal";
import { SITE } from "@/lib/site";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function GalleryCta() {
  const { t } = useLanguage();

  return (
    <section className="relative overflow-hidden bg-black px-5 py-16 sm:px-8 lg:py-20">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-[38rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-wb-red/15 via-wb-orange/20 to-wb-yellow/15 blur-[150px]" />

      <Reveal className="relative mx-auto max-w-3xl rounded-[2rem] border border-white/15 bg-white/[0.05] px-6 py-10 text-center shadow-[0_30px_90px_-30px_rgba(0,0,0,0.65)] backdrop-blur-md sm:px-12 sm:py-12">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-wb-orange">
          {t.gallery.finalCta.label}
        </p>
        <h2 className="mt-4 font-display text-4xl tracking-wide text-foreground sm:text-5xl">
          {t.gallery.finalCta.titlePrefix}{" "}
          <span className="text-gradient-ember">{t.gallery.finalCta.titleHighlight}</span>?
        </h2>
        <p className="mt-4 text-foreground/60">{t.gallery.finalCta.subtitle}</p>

        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
          <a
            href={SITE.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative isolate inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-wb-red via-wb-orange to-wb-yellow bg-[length:200%_100%] bg-left px-8 py-3.5 text-sm font-semibold uppercase tracking-wide text-black transition-[background-position,box-shadow,transform] duration-500 ease-out hover:-translate-y-1 hover:scale-105 hover:bg-right hover:shadow-[0_0_32px_-4px_rgba(244,103,15,0.65)] motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:hover:scale-100"
          >
            <MapPin
              className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5"
              strokeWidth={2}
            />
            {t.gallery.finalCta.getDirections}
          </a>
          <a
            href={SITE.phoneHref}
            className="group inline-flex items-center justify-center gap-2 rounded-full border border-white/25 bg-white/5 px-8 py-3.5 text-sm font-semibold uppercase tracking-wide text-foreground backdrop-blur-sm transition-[border-color,color,transform] duration-300 ease-out hover:-translate-y-1 hover:scale-105 hover:border-wb-orange/60 hover:text-wb-orange motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:hover:scale-100"
          >
            <Phone className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12" strokeWidth={2} />
            {t.gallery.finalCta.callNow}
          </a>
        </div>
      </Reveal>
    </section>
  );
}
