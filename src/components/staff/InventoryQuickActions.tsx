"use client";

import { useState, type FormEvent } from "react";
import { ArrowLeftRight, Eye, History, PackagePlus, SlidersHorizontal } from "lucide-react";
import type { InventoryLocation, MovementReason } from "@/types/inventory";
import type { StaffRole } from "@/types/staff-order";
import { getLocationLabel } from "@/lib/bud-guardian/inventory-engine";
import { manualAdjustment, receiveInventory, transferInventory, type StaffInventoryProductView } from "@/lib/staff/inventory-actions";
import { canWriteInventory } from "@/lib/staff/permissions";
import { useLanguage } from "@/lib/i18n/LanguageContext";

type Mode = "receive" | "adjustment" | "transfer" | "view-product" | "view-history" | null;

const LOCATIONS: InventoryLocation[] = ["warehouse", "sales-floor", "back-storage"];
const ADJUSTMENT_REASONS: Extract<MovementReason, "damaged" | "manual-count" | "correction" | "expired">[] = [
  "manual-count",
  "damaged",
  "correction",
  "expired",
];

const TEXT = {
  fr: {
    receive: "Réceptionner",
    adjustment: "Ajustement manuel",
    transfer: "Transférer",
    viewProduct: "Voir le produit",
    viewHistory: "Voir l'historique",
    product: "Produit",
    quantity: "Quantité",
    note: "Note (optionnel)",
    submit: "Confirmer",
    cancel: "Annuler",
    reason: "Raison",
    delta: "Écart (+/-)",
    destination: "Destination",
    go: "Ouvrir",
    viewOnly: "Accès en lecture seule — les ajustements de stock sont réservés aux gestionnaires, superviseurs et administrateurs.",
    reasons: {
      "manual-count": "Comptage manuel",
      damaged: "Endommagé",
      correction: "Correction",
      expired: "Expiré",
    },
  },
  en: {
    receive: "Receive Inventory",
    adjustment: "Manual Adjustment",
    transfer: "Transfer Stock",
    viewProduct: "View Product",
    viewHistory: "View History",
    product: "Product",
    quantity: "Quantity",
    note: "Note (optional)",
    submit: "Confirm",
    cancel: "Cancel",
    reason: "Reason",
    delta: "Delta (+/-)",
    destination: "Destination",
    go: "Open",
    viewOnly: "Read-only access — stock adjustments are limited to managers, supervisors, and admins.",
    reasons: {
      "manual-count": "Manual count",
      damaged: "Damaged",
      correction: "Correction",
      expired: "Expired",
    },
  },
} as const;

function fieldClass() {
  return "min-w-[160px] flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-foreground outline-none focus:border-wb-orange/60";
}

export default function InventoryQuickActions({
  products,
  actor,
  role,
  defaultProductId,
  onViewProduct,
  onViewHistory,
}: {
  products: StaffInventoryProductView[];
  actor: string;
  role: StaffRole;
  defaultProductId: string | null;
  onViewProduct: (productId: string) => void;
  onViewHistory: () => void;
}) {
  const { locale } = useLanguage();
  const t = TEXT[locale];
  const [mode, setMode] = useState<Mode>(null);
  const [productId, setProductId] = useState(defaultProductId ?? products[0]?.id ?? "");
  const canAdjust = canWriteInventory(role);

  function toggle(next: Mode) {
    setMode((current) => (current === next ? null : next));
    if (defaultProductId) setProductId(defaultProductId);
  }

  // Regular employees may still view products and history — the write
  // actions (receive / adjustment / transfer) are simply not offered.
  const buttons: { key: Exclude<Mode, null>; label: string; icon: typeof PackagePlus }[] = [
    ...(canAdjust
      ? ([
          { key: "receive", label: t.receive, icon: PackagePlus },
          { key: "adjustment", label: t.adjustment, icon: SlidersHorizontal },
          { key: "transfer", label: t.transfer, icon: ArrowLeftRight },
        ] as const)
      : []),
    { key: "view-product", label: t.viewProduct, icon: Eye },
    { key: "view-history", label: t.viewHistory, icon: History },
  ];

  function handleButtonClick(key: Exclude<Mode, null>) {
    if (key === "view-history") {
      onViewHistory();
      return;
    }
    toggle(key);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {buttons.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => handleButtonClick(key)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-medium transition-colors duration-200 ${
              mode === key ? "border-wb-orange/60 bg-wb-orange/10 text-wb-orange" : "border-white/15 text-white/70 hover:border-wb-orange/50 hover:text-white"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {canAdjust && mode === "receive" && (
        <ReceiveForm
          products={products}
          productId={productId}
          setProductId={setProductId}
          actor={actor}
          role={role}
          t={t}
          onDone={() => setMode(null)}
        />
      )}
      {canAdjust && mode === "adjustment" && (
        <AdjustmentForm
          products={products}
          productId={productId}
          setProductId={setProductId}
          actor={actor}
          role={role}
          t={t}
          onDone={() => setMode(null)}
        />
      )}
      {canAdjust && mode === "transfer" && (
        <TransferForm
          products={products}
          productId={productId}
          setProductId={setProductId}
          actor={actor}
          role={role}
          locale={locale}
          t={t}
          onDone={() => setMode(null)}
        />
      )}
      {!canAdjust && <p className="text-xs text-white/40">{t.viewOnly}</p>}
      {mode === "view-product" && (
        <ViewProductForm
          products={products}
          productId={productId}
          setProductId={setProductId}
          t={t}
          onGo={() => {
            onViewProduct(productId);
            setMode(null);
          }}
        />
      )}
    </div>
  );
}

type SharedProps = {
  products: StaffInventoryProductView[];
  productId: string;
  setProductId: (id: string) => void;
  t: (typeof TEXT)["fr"] | (typeof TEXT)["en"];
};

function ProductSelect({ products, productId, setProductId }: Omit<SharedProps, "t">) {
  return (
    <select
      value={productId}
      onChange={(e) => setProductId(e.target.value)}
      className="min-w-[220px] rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-foreground outline-none focus:border-wb-orange/60"
    >
      {products.map((p) => (
        <option key={p.id} value={p.id} className="bg-wb-charcoal">
          {p.id} — {p.name}
        </option>
      ))}
    </select>
  );
}

function ReceiveForm({
  products,
  productId,
  setProductId,
  actor,
  role,
  t,
  onDone,
}: SharedProps & { actor: string; role: StaffRole; onDone: () => void }) {
  const [quantity, setQuantity] = useState("10");
  const [note, setNote] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const qty = Number(quantity);
    if (!productId || !Number.isFinite(qty) || qty <= 0) return;
    receiveInventory(productId, qty, actor, role, note || undefined);
    onDone();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] p-3">
      <ProductSelect products={products} productId={productId} setProductId={setProductId} />
      <input
        type="number"
        min={1}
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        placeholder={t.quantity}
        className={fieldClass()}
      />
      <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder={t.note} className={fieldClass()} />
      <button type="submit" className="rounded-xl bg-wb-orange px-4 py-2 text-sm font-semibold text-black">
        {t.submit}
      </button>
    </form>
  );
}

function AdjustmentForm({
  products,
  productId,
  setProductId,
  actor,
  role,
  t,
  onDone,
}: SharedProps & { actor: string; role: StaffRole; onDone: () => void }) {
  const [delta, setDelta] = useState("-1");
  const [reason, setReason] = useState<(typeof ADJUSTMENT_REASONS)[number]>("manual-count");
  const [note, setNote] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const value = Number(delta);
    if (!productId || !Number.isFinite(value) || value === 0) return;
    manualAdjustment(productId, value, reason, actor, role, note || undefined);
    onDone();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] p-3">
      <ProductSelect products={products} productId={productId} setProductId={setProductId} />
      <input type="number" value={delta} onChange={(e) => setDelta(e.target.value)} placeholder={t.delta} className={fieldClass()} />
      <select
        value={reason}
        onChange={(e) => setReason(e.target.value as typeof reason)}
        className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-foreground outline-none focus:border-wb-orange/60"
      >
        {ADJUSTMENT_REASONS.map((r) => (
          <option key={r} value={r} className="bg-wb-charcoal">
            {t.reasons[r]}
          </option>
        ))}
      </select>
      <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder={t.note} className={fieldClass()} />
      <button type="submit" className="rounded-xl bg-wb-orange px-4 py-2 text-sm font-semibold text-black">
        {t.submit}
      </button>
    </form>
  );
}

function TransferForm({
  products,
  productId,
  setProductId,
  actor,
  role,
  locale,
  t,
  onDone,
}: SharedProps & { actor: string; role: StaffRole; locale: "fr" | "en"; onDone: () => void }) {
  const current = products.find((p) => p.id === productId);
  const [destination, setDestination] = useState<InventoryLocation>(
    LOCATIONS.find((l) => l !== current?.location) ?? "warehouse"
  );
  const [note, setNote] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!productId) return;
    transferInventory(productId, destination, actor, role, note || undefined);
    onDone();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] p-3">
      <ProductSelect products={products} productId={productId} setProductId={setProductId} />
      <select
        value={destination}
        onChange={(e) => setDestination(e.target.value as InventoryLocation)}
        className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-foreground outline-none focus:border-wb-orange/60"
      >
        {LOCATIONS.map((loc) => (
          <option key={loc} value={loc} className="bg-wb-charcoal">
            {getLocationLabel(loc, locale)}
          </option>
        ))}
      </select>
      <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder={t.note} className={fieldClass()} />
      <button type="submit" className="rounded-xl bg-wb-orange px-4 py-2 text-sm font-semibold text-black">
        {t.submit}
      </button>
    </form>
  );
}

function ViewProductForm({ products, productId, setProductId, t, onGo }: SharedProps & { onGo: () => void }) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] p-3">
      <ProductSelect products={products} productId={productId} setProductId={setProductId} />
      <button type="button" onClick={onGo} className="rounded-xl bg-wb-orange px-4 py-2 text-sm font-semibold text-black">
        {t.go}
      </button>
    </div>
  );
}
