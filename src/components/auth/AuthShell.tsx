"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import Logo from "@/components/Logo";
import Reveal from "@/components/Reveal";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const { t } = useLanguage();

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-black bg-grain px-5 py-24">
      <div className="pointer-events-none absolute left-1/2 top-0 h-96 w-[36rem] -translate-x-1/2 rounded-full bg-wb-orange/10 blur-[150px]" />

      <Link
        href="/"
        className="group absolute left-4 top-4 flex items-center gap-1.5 rounded-full border border-white/10 bg-black/30 px-3 py-1.5 text-xs font-medium text-white/45 backdrop-blur-md transition-all duration-200 hover:border-white/20 hover:text-white/80 sm:left-6 sm:top-6"
      >
        <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
        {t.auth.backToWebsite}
      </Link>
      <LanguageSwitcher className="absolute right-4 top-4 sm:right-6 sm:top-6" />

      <Reveal className="relative w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Link href="/">
            <Logo imageClassName="h-16" />
          </Link>
        </div>
        <div className="rounded-3xl border border-white/10 bg-wb-charcoal/70 p-8 backdrop-blur-xl shadow-[0_0_60px_-20px_rgba(0,0,0,0.8)]">
          <h1 className="text-center font-display text-3xl tracking-wide text-foreground">{title}</h1>
          {subtitle && <p className="mt-2 text-center text-sm text-foreground/60">{subtitle}</p>}
          <div className="mt-8">{children}</div>
        </div>
        {footer && <div className="mt-6 text-center text-sm text-foreground/60">{footer}</div>}
      </Reveal>
    </div>
  );
}
