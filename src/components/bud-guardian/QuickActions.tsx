import type { ComponentType } from "react";
import {
  Check,
  Clock,
  CreditCard,
  LayoutGrid,
  MapPin,
  Navigation,
  Phone,
  PhoneCall,
  PackageCheck,
  PackageSearch,
  RefreshCw,
  Search,
  ShoppingBag,
  ShoppingCart,
  X,
} from "lucide-react";
import { InstagramIcon, LinktreeIcon } from "@/components/SocialIcons";
import { BUD_GUARDIAN_LINKS } from "@/data/bud-guardian/store";
import type { QuickActionId } from "@/data/bud-guardian/types";
import { useLanguage } from "@/lib/i18n/LanguageContext";

type ActionKind = "faq" | "external" | "tel" | "order";

export type QuickActionConfig = {
  id: QuickActionId;
  icon: ComponentType<{ className?: string }>;
  kind: ActionKind;
  target: string;
  label: { fr: string; en: string };
  // Contextual actions (confirmation yes/no, abandoned-cart follow-ups…)
  // only ever appear as message suggestions, never in the persistent bar.
  showInBar?: boolean;
};

export const QUICK_ACTIONS: QuickActionConfig[] = [
  { id: "hours", icon: Clock, kind: "faq", target: "hours-weekly", label: { fr: "Horaires", en: "Hours" } },
  { id: "products", icon: ShoppingBag, kind: "faq", target: "products-overview", label: { fr: "Produits", en: "Products" } },
  { id: "categories", icon: LayoutGrid, kind: "faq", target: "categories-overview", label: { fr: "Catégories", en: "Categories" } },
  { id: "address", icon: MapPin, kind: "faq", target: "location-address", label: { fr: "Adresse", en: "Address" } },
  { id: "directions", icon: Navigation, kind: "external", target: BUD_GUARDIAN_LINKS.directions, label: { fr: "Itinéraire", en: "Directions" } },
  { id: "instagram", icon: InstagramIcon, kind: "external", target: BUD_GUARDIAN_LINKS.instagram, label: { fr: "Instagram", en: "Instagram" } },
  { id: "linktree", icon: LinktreeIcon, kind: "external", target: BUD_GUARDIAN_LINKS.linktree, label: { fr: "Linktree", en: "Linktree" } },
  { id: "phone", icon: Phone, kind: "tel", target: BUD_GUARDIAN_LINKS.phone, label: { fr: "Téléphone", en: "Phone" } },

  // --- Bud Guardian V2 — "Commandes" mode -----------------------------
  { id: "order-track", icon: PackageSearch, kind: "order", target: "order-track", label: { fr: "Suivre ma commande", en: "Track my order" } },
  { id: "order-find", icon: Search, kind: "order", target: "order-find", label: { fr: "Retrouver une commande", en: "Find an order" } },
  { id: "order-ready", icon: PackageCheck, kind: "order", target: "order-ready", label: { fr: "Ma commande est prête ?", en: "Is my order ready?" } },
  { id: "order-payment", icon: CreditCard, kind: "order", target: "order-payment", label: { fr: "Problème de paiement", en: "Payment issue" } },
  { id: "order-resume-cart", icon: ShoppingCart, kind: "order", target: "order-resume-cart", label: { fr: "Reprendre mon panier", en: "Resume my cart" } },
  { id: "order-call", icon: PhoneCall, kind: "tel", target: BUD_GUARDIAN_LINKS.phone, label: { fr: "Appeler maintenant", en: "Call now" } },

  // Contextual-only (message suggestions), not shown in the persistent bar.
  { id: "order-resume", icon: RefreshCw, kind: "order", target: "order-resume", label: { fr: "Reprendre la commande", en: "Resume order" }, showInBar: false },
  { id: "order-view-cart", icon: ShoppingCart, kind: "order", target: "order-view-cart", label: { fr: "Voir le panier", en: "View cart" }, showInBar: false },
  { id: "order-payment-retry", icon: RefreshCw, kind: "order", target: "order-payment-retry", label: { fr: "Réessayer", en: "Retry" }, showInBar: false },
  { id: "order-confirm-yes", icon: Check, kind: "order", target: "order-confirm-yes", label: { fr: "Oui", en: "Yes" }, showInBar: false },
  { id: "order-confirm-no", icon: X, kind: "order", target: "order-confirm-no", label: { fr: "Non", en: "No" }, showInBar: false },
];

type QuickActionsProps = {
  onAction: (action: QuickActionConfig) => void;
  className?: string;
};

export default function QuickActions({ onAction, className = "" }: QuickActionsProps) {
  const { locale } = useLanguage();

  return (
    <div className={`flex gap-2 overflow-x-auto px-4 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${className}`}>
      {QUICK_ACTIONS.filter((action) => action.showInBar !== false).map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.id}
            type="button"
            onClick={() => onAction(action)}
            className="flex shrink-0 items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-medium text-foreground/80 transition-colors duration-200 hover:border-wb-orange/50 hover:text-wb-orange"
          >
            <Icon className="h-3.5 w-3.5 shrink-0" />
            {action.label[locale]}
          </button>
        );
      })}
    </div>
  );
}
