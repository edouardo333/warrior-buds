import type { ComponentType } from "react";
import {
  BadgeCheck,
  BanknoteArrowUp,
  BanknoteCheck,
  Check,
  CircleDollarSign,
  Clock,
  ClipboardList,
  CreditCard,
  HelpCircle,
  Hourglass,
  Info,
  Landmark,
  LayoutGrid,
  Leaf,
  LifeBuoy,
  Mail,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  PhoneCall,
  PackageCheck,
  PackageSearch,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  SquareParking,
  Store,
  X,
} from "lucide-react";
import { InstagramIcon, LinktreeIcon } from "@/components/SocialIcons";
import { BUD_GUARDIAN_LINKS } from "@/data/bud-guardian/store";
import type { QuickActionId } from "@/data/bud-guardian/types";
import { useLanguage } from "@/lib/i18n/LanguageContext";

type ActionKind = "faq" | "external" | "tel" | "order" | "payment" | "category";

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
  // --- Bud Guardian V4.1 — persistent category bar ---------------------
  { id: "cat-store", icon: Store, kind: "category", target: "cat-store", label: { fr: "Boutique", en: "Store" } },
  { id: "cat-products", icon: ShoppingBag, kind: "category", target: "cat-products", label: { fr: "Produits", en: "Products" } },
  { id: "cat-product-help", icon: HelpCircle, kind: "category", target: "cat-product-help", label: { fr: "Aide produit", en: "Product Help" } },
  { id: "cat-orders", icon: ClipboardList, kind: "category", target: "cat-orders", label: { fr: "Commandes", en: "Orders" } },
  { id: "cat-payments", icon: CreditCard, kind: "category", target: "cat-payments", label: { fr: "Paiements", en: "Payments" } },
  { id: "cat-policies", icon: ShieldCheck, kind: "category", target: "cat-policies", label: { fr: "Politiques", en: "Policies" } },
  { id: "cat-contact", icon: Mail, kind: "category", target: "cat-contact", label: { fr: "Contact", en: "Contact" } },
  { id: "cat-human-help", icon: LifeBuoy, kind: "category", target: "cat-human-help", label: { fr: "Aide humaine", en: "Human Help" } },

  // --- Bud Guardian V1 — store FAQ. Reachable via category suggestions
  // and free-text search, no longer shown in the persistent bar directly.
  { id: "hours", icon: Clock, kind: "faq", target: "hours-weekly", label: { fr: "Horaires", en: "Hours" }, showInBar: false },
  { id: "products", icon: ShoppingBag, kind: "faq", target: "products-overview", label: { fr: "Produits", en: "Products" }, showInBar: false },
  { id: "categories", icon: LayoutGrid, kind: "faq", target: "categories-overview", label: { fr: "Catégories", en: "Categories" }, showInBar: false },
  { id: "address", icon: MapPin, kind: "faq", target: "location-address", label: { fr: "Adresse", en: "Address" }, showInBar: false },
  { id: "directions", icon: Navigation, kind: "external", target: BUD_GUARDIAN_LINKS.directions, label: { fr: "Itinéraire", en: "Directions" }, showInBar: false },
  { id: "instagram", icon: InstagramIcon, kind: "external", target: BUD_GUARDIAN_LINKS.instagram, label: { fr: "Instagram", en: "Instagram" }, showInBar: false },
  { id: "linktree", icon: LinktreeIcon, kind: "external", target: BUD_GUARDIAN_LINKS.linktree, label: { fr: "Linktree", en: "Linktree" }, showInBar: false },
  { id: "phone", icon: Phone, kind: "tel", target: BUD_GUARDIAN_LINKS.phone, label: { fr: "Téléphone", en: "Phone" }, showInBar: false },

  // V4.1 — additional Store / Products / Product Help / Policies / Contact
  // leaf actions surfaced only as category suggestions.
  { id: "store-open-now", icon: Clock, kind: "faq", target: "hours-open-now", label: { fr: "Ouvert maintenant ?", en: "Open now?" }, showInBar: false },
  { id: "store-parking", icon: SquareParking, kind: "faq", target: "location-parking", label: { fr: "Stationnement", en: "Parking" }, showInBar: false },
  { id: "product-prerolls", icon: Leaf, kind: "faq", target: "products-prerolls", label: { fr: "Préroulés", en: "Pre-rolls" }, showInBar: false },
  { id: "product-new-arrivals", icon: Sparkles, kind: "faq", target: "products-new-arrivals", label: { fr: "Nouveautés", en: "New arrivals" }, showInBar: false },
  { id: "product-availability", icon: PackageCheck, kind: "faq", target: "products-availability", label: { fr: "Disponibilité", en: "Availability" }, showInBar: false },
  { id: "product-potency", icon: Info, kind: "faq", target: "products-potency", label: { fr: "Taux de THC/CBD", en: "THC/CBD potency" }, showInBar: false },
  { id: "order-pickup-process", icon: ClipboardList, kind: "faq", target: "purchase-pickup-process", label: { fr: "Processus de ramassage", en: "Pickup process" }, showInBar: false },
  { id: "help-beginner", icon: BadgeCheck, kind: "faq", target: "help-beginner", label: { fr: "Conseils débutant", en: "Beginner tips" }, showInBar: false },
  { id: "help-choose", icon: HelpCircle, kind: "faq", target: "help-choose-product", label: { fr: "Comment choisir", en: "How to choose" }, showInBar: false },
  { id: "help-thc-cbd", icon: Info, kind: "faq", target: "help-thc-cbd-difference", label: { fr: "THC vs CBD", en: "THC vs CBD" }, showInBar: false },
  { id: "policy-age", icon: ShieldCheck, kind: "faq", target: "age-requirement", label: { fr: "Âge requis", en: "Age requirement" }, showInBar: false },
  { id: "policy-id", icon: BadgeCheck, kind: "faq", target: "age-id", label: { fr: "Pièce d'identité", en: "ID requirement" }, showInBar: false },
  { id: "policy-returns", icon: RotateCcw, kind: "faq", target: "purchase-returns", label: { fr: "Retours/échanges", en: "Returns/exchanges" }, showInBar: false },
  { id: "policy-general", icon: ShieldCheck, kind: "faq", target: "policy-store-general", label: { fr: "Politiques générales", en: "General policies" }, showInBar: false },
  { id: "contact-message", icon: MessageCircle, kind: "faq", target: "contact-form", label: { fr: "Nous écrire", en: "Send a message" }, showInBar: false },
  { id: "human-callback", icon: PhoneCall, kind: "faq", target: "human-callback-request", label: { fr: "Demander un rappel", en: "Request a callback" }, showInBar: false },

  // --- Bud Guardian V2 — "Commandes" mode -------------------------------
  { id: "order-track", icon: PackageSearch, kind: "order", target: "order-track", label: { fr: "Suivre ma commande", en: "Track my order" }, showInBar: false },
  { id: "order-find", icon: Search, kind: "order", target: "order-find", label: { fr: "Retrouver une commande", en: "Find an order" }, showInBar: false },
  { id: "order-ready", icon: PackageCheck, kind: "order", target: "order-ready", label: { fr: "Ma commande est prête ?", en: "Is my order ready?" }, showInBar: false },
  { id: "order-payment", icon: CreditCard, kind: "order", target: "order-payment", label: { fr: "Problème de paiement", en: "Payment issue" }, showInBar: false },
  { id: "order-resume-cart", icon: ShoppingCart, kind: "order", target: "order-resume-cart", label: { fr: "Reprendre mon panier", en: "Resume my cart" }, showInBar: false },
  { id: "order-call", icon: PhoneCall, kind: "tel", target: BUD_GUARDIAN_LINKS.phone, label: { fr: "Appeler maintenant", en: "Call now" }, showInBar: false },

  // Contextual-only (message suggestions), not shown in the persistent bar.
  { id: "order-resume", icon: RefreshCw, kind: "order", target: "order-resume", label: { fr: "Reprendre la commande", en: "Resume order" }, showInBar: false },
  { id: "order-view-cart", icon: ShoppingCart, kind: "order", target: "order-view-cart", label: { fr: "Voir le panier", en: "View cart" }, showInBar: false },
  { id: "order-payment-retry", icon: RefreshCw, kind: "order", target: "order-payment-retry", label: { fr: "Réessayer", en: "Retry" }, showInBar: false },
  { id: "order-confirm-yes", icon: Check, kind: "order", target: "order-confirm-yes", label: { fr: "Oui", en: "Yes" }, showInBar: false },
  { id: "order-confirm-no", icon: X, kind: "order", target: "order-confirm-no", label: { fr: "Non", en: "No" }, showInBar: false },

  // --- Bud Guardian V2.2 — "Paiements" mode -----------------------------
  { id: "payment-check-received", icon: BanknoteCheck, kind: "payment", target: "payment-check-received", label: { fr: "Paiement reçu ?", en: "Payment received?" }, showInBar: false },
  { id: "payment-check-worked", icon: BanknoteCheck, kind: "payment", target: "payment-check-worked", label: { fr: "Paiement réussi ?", en: "Did it work?" }, showInBar: false },
  { id: "payment-remaining", icon: CircleDollarSign, kind: "payment", target: "payment-remaining", label: { fr: "Montant restant", en: "Remaining amount" }, showInBar: false },
  { id: "payment-interac-info", icon: Landmark, kind: "payment", target: "payment-interac-info", label: { fr: "Envoyer mon Interac", en: "Send Interac" }, showInBar: false },
  { id: "payment-in-store", icon: Store, kind: "payment", target: "payment-in-store", label: { fr: "Payer en magasin", en: "Pay in-store" }, showInBar: false },
  { id: "payment-order-confirmed", icon: PackageCheck, kind: "payment", target: "payment-order-confirmed", label: { fr: "Commande confirmée ?", en: "Order confirmed?" }, showInBar: false },
  { id: "payment-expired", icon: Hourglass, kind: "payment", target: "payment-expired", label: { fr: "Paiement expiré ?", en: "Payment expired?" }, showInBar: false },
  { id: "payment-simulate-interac", icon: BanknoteArrowUp, kind: "payment", target: "payment-simulate-interac", label: { fr: "Simuler un paiement Interac", en: "Simulate Interac payment" }, showInBar: false },

  // Contextual-only (message suggestions), not shown in the persistent bar.
  { id: "payment-confirm-demo", icon: Check, kind: "payment", target: "payment-confirm-demo", label: { fr: "Confirmer (démo)", en: "Confirm (demo)" }, showInBar: false },
  { id: "payment-decline-demo", icon: X, kind: "payment", target: "payment-decline-demo", label: { fr: "Refuser (démo)", en: "Decline (demo)" }, showInBar: false },
];

// Category -> 3-5 suggested questions shown as chips when a category quick
// action is selected (see BudGuardian.tsx's "category" kind handling).
export const CATEGORY_SUGGESTIONS: Partial<Record<QuickActionId, QuickActionId[]>> = {
  "cat-store": ["hours", "store-open-now", "address", "directions", "store-parking"],
  "cat-products": ["products", "categories", "product-prerolls", "product-new-arrivals", "product-availability"],
  "cat-product-help": ["help-beginner", "help-choose", "help-thc-cbd", "product-potency"],
  "cat-orders": ["order-track", "order-find", "order-ready", "order-payment", "order-pickup-process"],
  "cat-payments": ["payment-check-received", "payment-interac-info", "payment-in-store", "payment-remaining"],
  "cat-policies": ["policy-age", "policy-id", "policy-returns", "policy-general"],
  "cat-contact": ["phone", "instagram", "linktree", "contact-message"],
  "cat-human-help": ["order-call", "instagram", "human-callback"],
};

const CATEGORY_INTRO: Record<string, { fr: string; en: string }> = {
  "cat-store": { fr: "Voici ce que je peux vous dire sur la boutique :", en: "Here's what I can tell you about the store:" },
  "cat-products": { fr: "Voici quelques questions fréquentes sur nos produits :", en: "Here are some common product questions:" },
  "cat-product-help": { fr: "Voici comment je peux vous aider à choisir :", en: "Here's how I can help you choose:" },
  "cat-orders": { fr: "Voici ce que je peux faire pour votre commande :", en: "Here's what I can help with for your order:" },
  "cat-payments": { fr: "Voici les questions fréquentes sur les paiements :", en: "Here are common payment questions:" },
  "cat-policies": { fr: "Voici nos politiques principales :", en: "Here are our main policies:" },
  "cat-contact": { fr: "Voici comment nous joindre :", en: "Here's how to reach us:" },
  "cat-human-help": { fr: "Voici comment parler à un humain :", en: "Here's how to reach a human:" },
};

export function getCategoryIntro(categoryId: QuickActionId, locale: "fr" | "en"): string {
  return CATEGORY_INTRO[categoryId]?.[locale] ?? "";
}

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
