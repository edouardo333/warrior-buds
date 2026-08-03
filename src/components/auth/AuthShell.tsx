"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import Logo from "@/components/Logo";
import Reveal from "@/components/Reveal";

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
  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-black bg-grain px-5 py-24">
      <div className="pointer-events-none absolute left-1/2 top-0 h-96 w-[36rem] -translate-x-1/2 rounded-full bg-wb-orange/10 blur-[150px]" />
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
