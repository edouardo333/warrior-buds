import Link from "next/link";
import type { ReactNode } from "react";

type CategoryCardProps = {
  name: string;
  description: string;
  fallbackGradient: string;
  icon: ReactNode;
};

export default function CategoryCard({
  name,
  description,
  fallbackGradient,
  icon,
}: CategoryCardProps) {
  return (
    <Link
      href="/products"
      className="group relative block h-80 overflow-hidden rounded-3xl border border-white/10 sm:h-96"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${fallbackGradient}`}>
        <div className="absolute inset-0 bg-noise opacity-[0.05]" />
        <div className="absolute inset-0 flex items-center justify-center text-foreground/10 transition-colors duration-500 group-hover:text-foreground/15">
          <div className="h-28 w-28 sm:h-36 sm:w-36">{icon}</div>
        </div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/5 transition-colors duration-500 group-hover:from-black/95" />

      <div className="relative flex h-full flex-col justify-end p-6 sm:p-7">
        <h3 className="font-display text-2xl tracking-wide text-foreground sm:text-3xl">
          {name}
        </h3>
        <p className="mt-1.5 max-w-[85%] text-sm text-foreground/70">{description}</p>
        <span className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-wb-orange transition-transform duration-300 ease-out group-hover:translate-x-1.5">
          Explore
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
            <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>
    </Link>
  );
}
