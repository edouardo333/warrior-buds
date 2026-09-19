"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { ProductFlavourGroup } from "@/types/product";

// Accent dot per flavour family, mirroring the four colour cues of the
// supplied product sheet. Purely decorative — the family is always also
// identified by its text label — and unknown family ids simply get no dot.
const GROUP_DOT: Record<string, string> = {
  fruit: "bg-rose-500",
  "fruit-ice": "bg-sky-400",
  mint: "bg-teal-400",
  tobacco: "bg-amber-600",
};

// Two-step flavour picker for a product with `flavourGroups`: choose a
// family (Fruit / Fruit + Ice / Mint / Tobacco), then one flavour inside it.
// A product with a single family (e.g. Heavy Hitters' four flavours) skips the
// family step and shows its flavours directly.
// Flavour names are official identity data and render exactly as stored;
// only the family labels and surrounding UI copy are localized. The chosen
// flavour is informational selection state — this component never touches
// the cart (priceOnRequest products can't be added to it).
export default function ProductFlavourSelector({ groups }: { groups: ProductFlavourGroup[] }) {
  const { t, locale } = useLanguage();
  const [activeGroupId, setActiveGroupId] = useState(groups[0]?.id ?? "");
  const [selected, setSelected] = useState<{ groupId: string; flavour: string } | null>(null);

  const activeGroup = groups.find((g) => g.id === activeGroupId) ?? groups[0];
  if (!activeGroup) return null;
  const selectedGroup = selected ? groups.find((g) => g.id === selected.groupId) : undefined;
  const singleGroup = groups.length === 1;

  return (
    <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:p-5" aria-label={t.productCatalog.detail.flavourProfile}>
      <h2 className="text-xs font-semibold uppercase tracking-widest text-wb-orange">{t.productCatalog.detail.flavourProfile}</h2>

      {!singleGroup && (
      <div role="tablist" aria-label={t.productCatalog.detail.flavourProfile} className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {groups.map((group) => {
          const active = group.id === activeGroup.id;
          const holdsSelection = selected?.groupId === group.id;
          return (
            <button
              key={group.id}
              type="button"
              role="tab"
              id={`flavour-tab-${group.id}`}
              aria-selected={active}
              aria-controls="flavour-panel"
              onClick={() => setActiveGroupId(group.id)}
              className={`relative flex min-w-0 flex-col items-start gap-1 rounded-xl border px-3 py-2.5 text-left transition-all duration-250 focus:outline-none focus-visible:ring-2 focus-visible:ring-wb-orange/60 ${
                active
                  ? "border-wb-orange bg-wb-orange/10 shadow-[0_0_18px_-6px_rgba(244,103,15,0.6)]"
                  : "border-white/10 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.06]"
              }`}
            >
              <span className={`flex min-w-0 max-w-full items-center gap-2 text-sm font-semibold ${active ? "text-wb-orange" : "text-foreground/85"}`}>
                <span aria-hidden="true" className={`h-2.5 w-2.5 shrink-0 rounded-full ${GROUP_DOT[group.id] ?? "bg-white/30"}`} />
                <span className="min-w-0 break-words">{group.label[locale]}</span>
              </span>
              <span className="text-[11px] text-foreground/45">{t.productCatalog.detail.flavourCount(group.flavours.length)}</span>
              {holdsSelection && (
                <span aria-hidden="true" className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-wb-orange text-black">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
              )}
            </button>
          );
        })}
      </div>
      )}

      <div id="flavour-panel" {...(singleGroup ? {} : { role: "tabpanel", "aria-labelledby": `flavour-tab-${activeGroup.id}` })} className="mt-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-foreground/40">{t.productCatalog.detail.flavour}</p>
        <div role="radiogroup" aria-label={`${t.productCatalog.detail.flavour} — ${activeGroup.label[locale]}`} className="mt-2.5 flex flex-wrap gap-2">
          {activeGroup.flavours.map((flavour) => {
            const isSelected = selected?.groupId === activeGroup.id && selected.flavour === flavour;
            return (
              <button
                key={flavour}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => setSelected(isSelected ? null : { groupId: activeGroup.id, flavour })}
                className={`inline-flex max-w-full items-center gap-1.5 rounded-xl border px-3 py-2 text-left text-sm leading-snug transition-all duration-250 focus:outline-none focus-visible:ring-2 focus-visible:ring-wb-orange/60 ${
                  isSelected
                    ? "border-wb-orange bg-wb-orange/15 font-semibold text-wb-orange shadow-[0_0_16px_-4px_rgba(244,103,15,0.65)]"
                    : "border-white/10 bg-white/[0.03] text-foreground/80 hover:border-wb-orange/40 hover:text-foreground"
                }`}
              >
                {isSelected && <Check className="h-3.5 w-3.5 shrink-0" strokeWidth={3} />}
                <span className="min-w-0 break-words">{flavour}</span>
              </button>
            );
          })}
        </div>
      </div>

      <p aria-live="polite" className="mt-4 border-t border-white/10 pt-3 text-sm text-foreground/60">
        {selected && selectedGroup ? (
          <>
            {t.productCatalog.detail.selectedFlavour}{locale === "fr" ? " : " : ": "}<span className="break-words font-semibold text-wb-orange">{selected.flavour}</span>
            {!singleGroup && <span className="text-foreground/40"> · {selectedGroup.label[locale]}</span>}
          </>
        ) : (
          t.productCatalog.detail.chooseFlavour
        )}
      </p>
    </section>
  );
}
