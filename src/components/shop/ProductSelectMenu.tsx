"use client";

// Storefront — Products page "Strain" and "Sort By" filters, upgraded from
// native <select> elements into the same premium custom dropdown used by
// ProductCategoryMenu (single-column variant: no subcategory panel). Shares
// the Warrior Buds black/orange/red trigger, panel, hover/selected states,
// wb-dropdown-in animation, and chevron rotation, plus the same click-outside
// / Escape / arrow-key interaction model. Only this filter's visuals change;
// filtering, sorting, search, category menu, cards, and cart are untouched.

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

const triggerClass =
  "wb-select flex w-full items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-left text-sm text-foreground outline-none transition-all duration-250 focus:border-wb-orange/60 focus:bg-white/[0.06] focus:shadow-[0_0_0_3px_rgba(244,103,15,0.15)] hover:border-white/20";

const rowLabelClass =
  "w-full truncate rounded-lg px-3 py-2.5 text-left text-sm text-foreground/80 transition-colors duration-200 hover:bg-wb-orange/10 hover:text-wb-orange";

const rowLabelActiveClass = "bg-wb-orange/10 text-wb-orange";

function getFocusableButtons(panel: HTMLElement | null): HTMLButtonElement[] {
  if (!panel) return [];
  return Array.from(panel.querySelectorAll("button")).filter(
    (btn): btn is HTMLButtonElement => btn.offsetParent !== null
  );
}

export type ProductSelectOption = { value: string; label: string };

export default function ProductSelectMenu({
  label,
  ariaLabel,
  value,
  options,
  onChange,
  className,
}: {
  label: string;
  ariaLabel: string;
  value: string;
  options: ProductSelectOption[];
  onChange: (value: string) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const selectedOption = options.find((o) => o.value === value) ?? options[0];

  function close() {
    setOpen(false);
  }

  function select(nextValue: string) {
    onChange(nextValue);
    close();
    triggerRef.current?.focus();
  }

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) close();
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      triggerRef.current?.focus();
      return;
    }
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    const focusable = getFocusableButtons(panelRef.current);
    if (focusable.length === 0) return;
    event.preventDefault();
    const currentIndex = focusable.indexOf(document.activeElement as HTMLButtonElement);
    const delta = event.key === "ArrowDown" ? 1 : -1;
    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + delta + focusable.length) % focusable.length;
    focusable[nextIndex]?.focus();
  }

  return (
    <div ref={containerRef} className={`relative min-w-[160px] ${className ?? ""}`} onKeyDown={handleKeyDown}>
      <label className="text-xs font-semibold uppercase tracking-widest text-foreground/50">{label}</label>
      <div className="relative mt-2">
        <button
          ref={triggerRef}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          className={triggerClass}
          onClick={() => setOpen((o) => !o)}
        >
          <span className="truncate">{selectedOption?.label}</span>
          <ChevronDown
            className={`wb-select-chevron h-4 w-4 shrink-0 text-foreground/40 transition-transform duration-250 ${open ? "rotate-180" : ""}`}
            strokeWidth={2}
          />
        </button>

        {open && (
          <div
            ref={panelRef}
            role="listbox"
            aria-label={ariaLabel}
            className="wb-dropdown-in absolute left-0 top-full z-50 mt-2 w-full min-w-[180px] overflow-hidden rounded-2xl border border-white/10 bg-wb-charcoal/98 p-2 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.85)] backdrop-blur-xl"
          >
            <ul className="flex max-h-[60vh] flex-col gap-0.5 overflow-y-auto">
              {options.map((option) => (
                <li key={option.value}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={option.value === value}
                    onClick={() => select(option.value)}
                    className={`${rowLabelClass} ${option.value === value ? rowLabelActiveClass : ""}`}
                  >
                    {option.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
