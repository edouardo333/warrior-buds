"use client";

// Storefront — Products page "Category" filter, upgraded from a flat
// <select> into a 2-level mega-dropdown (lib/shop/category-tree.ts drives
// the taxonomy + per-node product matching). Desktop: left column of
// top-level categories, hover/click/focus opens a right-hand subcategory
// panel. Mobile: the same left column becomes a tap accordion — a chevron
// button expands/collapses a category's children inline. Selecting any
// parent or subcategory sets the filter and closes the menu immediately.
// Only this filter changes; search, strain, sort, cards, and cart are
// untouched.

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useAllProducts } from "@/lib/shop/product-actions";
import { CATEGORY_TREE, countNodeMatches, findCategoryNode, getNodeLabel, type CategoryNode } from "@/lib/shop/category-tree";

const triggerClass =
  "wb-select flex w-full items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-left text-sm text-foreground outline-none transition-all duration-250 focus:border-wb-orange/60 focus:bg-white/[0.06] focus:shadow-[0_0_0_3px_rgba(244,103,15,0.15)] hover:border-white/20";

const rowLabelClass =
  "flex-1 truncate rounded-lg px-3 py-2.5 text-left text-sm text-foreground/80 transition-colors duration-200 hover:bg-wb-orange/10 hover:text-wb-orange";

const rowLabelActiveClass = "bg-wb-orange/10 text-wb-orange";

const countClass = "ml-2 shrink-0 text-xs tabular-nums text-foreground/35";

function getFocusableButtons(panel: HTMLElement | null): HTMLButtonElement[] {
  if (!panel) return [];
  return Array.from(panel.querySelectorAll("button")).filter(
    (btn): btn is HTMLButtonElement => btn.offsetParent !== null
  );
}

export default function ProductCategoryMenu({
  value,
  onChange,
}: {
  value?: string;
  onChange: (nodeId: string | undefined) => void;
}) {
  const { t, locale } = useLanguage();
  const products = useAllProducts();
  const [open, setOpen] = useState(false);
  const [activeParentId, setActiveParentId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const selectedNode = value ? findCategoryNode(value) : undefined;
  const activeNode = activeParentId ? CATEGORY_TREE.find((n) => n.id === activeParentId) : undefined;

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    function walk(nodes: CategoryNode[]) {
      for (const node of nodes) {
        map.set(node.id, countNodeMatches(node, products));
        if (node.children) walk(node.children);
      }
    }
    walk(CATEGORY_TREE);
    return map;
  }, [products]);

  function close() {
    setOpen(false);
    setActiveParentId(null);
  }

  function select(nodeId: string | undefined) {
    onChange(nodeId);
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
    <div ref={containerRef} className="relative min-w-[200px]" onKeyDown={handleKeyDown}>
      <label className="text-xs font-semibold uppercase tracking-widest text-foreground/50">{t.productCatalog.filters.category}</label>
      <div className="relative mt-2">
        <button
          ref={triggerRef}
          type="button"
          aria-haspopup="true"
          aria-expanded={open}
          aria-controls="wb-category-menu-panel"
          onClick={() => setOpen((o) => !o)}
          className={triggerClass}
        >
          <span className="truncate">{selectedNode ? getNodeLabel(selectedNode, locale) : t.productCatalog.filters.allCategories}</span>
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-foreground/40 transition-transform duration-250 ${open ? "rotate-180" : ""}`}
            strokeWidth={2}
          />
        </button>

        {open && (
          <div
            id="wb-category-menu-panel"
            ref={panelRef}
            role="group"
            aria-label={t.productCatalog.filters.category}
            className="wb-dropdown-in absolute left-0 top-full z-50 mt-2 w-[min(92vw,560px)] overflow-hidden rounded-2xl border border-white/10 bg-wb-charcoal/98 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.85)] backdrop-blur-xl sm:grid sm:grid-cols-[200px_1fr]"
          >
            <ul className="max-h-[70vh] overflow-y-auto border-white/10 p-2 sm:border-r">
              <li>
                <button
                  type="button"
                  onClick={() => select(undefined)}
                  onMouseEnter={() => setActiveParentId(null)}
                  onFocus={() => setActiveParentId(null)}
                  className={`${rowLabelClass} w-full ${!value ? rowLabelActiveClass : ""}`}
                >
                  {t.productCatalog.filters.allCategories}
                </button>
              </li>
              {CATEGORY_TREE.map((node) => {
                const hasChildren = Boolean(node.children?.length);
                const isExpanded = activeParentId === node.id;
                const isSelected = value === node.id;
                return (
                  <li key={node.id}>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => select(node.id)}
                        onMouseEnter={() => setActiveParentId(hasChildren ? node.id : null)}
                        onFocus={() => setActiveParentId(hasChildren ? node.id : null)}
                        className={`${rowLabelClass} ${isSelected ? rowLabelActiveClass : ""}`}
                      >
                        {getNodeLabel(node, locale)}
                        <span className={countClass}>{counts.get(node.id) ?? 0}</span>
                      </button>
                      {hasChildren && (
                        <button
                          type="button"
                          aria-expanded={isExpanded}
                          aria-label={
                            isExpanded
                              ? t.productCatalog.filters.categoryMenu.hideSubcategories(getNodeLabel(node, locale))
                              : t.productCatalog.filters.categoryMenu.showSubcategories(getNodeLabel(node, locale))
                          }
                          onClick={() => setActiveParentId((prev) => (prev === node.id ? null : node.id))}
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-foreground/40 transition-colors duration-200 hover:bg-wb-orange/10 hover:text-wb-orange sm:pointer-events-none sm:opacity-60 ${isExpanded ? "text-wb-orange sm:text-foreground/40" : ""}`}
                        >
                          <ChevronRight
                            className={`h-4 w-4 transition-transform duration-250 sm:rotate-0 ${isExpanded ? "rotate-90" : ""}`}
                            strokeWidth={2}
                          />
                        </button>
                      )}
                    </div>

                    {hasChildren && isExpanded && (
                      <ul className="ml-3 flex flex-col gap-0.5 border-l border-white/10 py-1 pl-2 sm:hidden">
                        {node.children!.map((child) => (
                          <li key={child.id}>
                            <button
                              type="button"
                              onClick={() => select(child.id)}
                              className={`${rowLabelClass} w-full ${value === child.id ? rowLabelActiveClass : ""}`}
                            >
                              {getNodeLabel(child, locale)}
                              <span className={countClass}>{counts.get(child.id) ?? 0}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>

            <div className="hidden p-2 sm:block">
              {activeNode?.children ? (
                <ul className="flex flex-col gap-0.5">
                  {activeNode.children.map((child) => (
                    <li key={child.id}>
                      <button
                        type="button"
                        onClick={() => select(child.id)}
                        className={`${rowLabelClass} w-full ${value === child.id ? rowLabelActiveClass : ""}`}
                      >
                        {getNodeLabel(child, locale)}
                        <span className={countClass}>{counts.get(child.id) ?? 0}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="flex h-full items-center justify-center px-4 text-center text-xs text-foreground/35">
                  {t.productCatalog.filters.categoryMenu.hoverHint}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
