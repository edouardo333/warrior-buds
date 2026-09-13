import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";

type CategoryCardTheme = {
  glow: string;
  glowSecondary: string;
  gradient: string;
};

type CategoryCardProps = {
  name: string;
  description: string;
  exploreLabel: string;
  icon: ReactNode;
  theme: CategoryCardTheme;
  href?: string;
  imageSrc: string;
  imageAlt: string;
};

export default function CategoryCard({
  name,
  description,
  exploreLabel,
  icon,
  theme,
  href = "/products",
  imageSrc,
  imageAlt,
}: CategoryCardProps) {
  const cardStyle = {
    "--card-glow": theme.glow,
    "--card-glow-2": theme.glowSecondary,
  } as CSSProperties;

  return (
    <Link
      href={href}
      style={cardStyle}
      className="wb-cat-card group relative flex h-72 flex-col overflow-hidden rounded-3xl border border-white/10 bg-wb-charcoal p-6 shadow-[0_8px_30px_rgba(0,0,0,0.35)] transition-all duration-[250ms] ease-out hover:-translate-y-1.5 hover:border-white/20 hover:shadow-[0_16px_40px_rgba(0,0,0,0.5)] sm:h-80 sm:p-7"
    >
      <div
        className={`absolute inset-0 z-0 bg-gradient-to-br ${theme.gradient} opacity-80 transition-opacity duration-[250ms] group-hover:opacity-100`}
      />
      <div className="absolute inset-0 z-0 bg-noise opacity-[0.04]" />
      <div className="wb-cat-card__glow wb-cat-card__glow-a" />
      <div className="wb-cat-card__glow wb-cat-card__glow-b" />

      {/* Real category product photo — the dominant visual layer. Sized to
          the card's top ~60% so it never fights the title/description/CTA
          block below (which is pinned to the bottom via mt-auto), and
          object-contain + a transparent PNG lets each product's real shape
          show instead of forcing one crop onto every image. */}
      <div className="wb-cat-card__image-wrap">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
          className="wb-cat-card__image object-contain object-bottom"
        />
      </div>
      <div className="wb-cat-card__image-scrim" />

      <div className="wb-cat-card__accent-line" />

      <div className="relative z-10 flex h-full flex-col">
        <span className="wb-cat-card__badge">{icon}</span>

        <div className="mt-auto pt-6">
          <h3 className="font-display text-2xl tracking-wide text-foreground sm:text-3xl">
            {name}
          </h3>
          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-foreground/75">
            {description}
          </p>
          <span className="wb-cat-card__explore mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest">
            {exploreLabel}
            <ArrowRight className="wb-cat-card__arrow h-3.5 w-3.5" strokeWidth={2.25} />
          </span>
        </div>
      </div>
    </Link>
  );
}
