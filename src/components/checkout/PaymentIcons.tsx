// Storefront — small icon badges for the checkout payment-method grid.
// Interac and Shakepay reuse the real official brand assets (see
// PaymentBrandMark.tsx) that the site footer already uses — no generic
// placeholder icon for those two. The rest (card, bitcoin, ethereum) are
// purely decorative SVGs, no external assets. Keyed by PaymentProviderId so
// PaymentStep/PaymentInstructionsCard can look one up generically instead of
// hardcoding per-provider markup.

import type { ReactNode } from "react";
import { InteracMark, ShakepayMark } from "./PaymentBrandMark";

export function CardBadge() {
  return (
    <svg viewBox="0 0 40 40" className="h-9 w-9 shrink-0" role="img" aria-label="Credit / Debit Card">
      <rect width="40" height="40" rx="10" fill="#150a04" />
      <rect x="0.5" y="0.5" width="39" height="39" rx="9.5" fill="none" stroke="#F4670F" strokeOpacity="0.35" />
      <rect x="8" y="12.5" width="24" height="15" rx="2.5" fill="none" stroke="#F4670F" strokeWidth="1.6" />
      <rect x="8" y="16.5" width="24" height="3.5" fill="#F4670F" />
      <rect x="11" y="23.5" width="7" height="2" rx="1" fill="#F8B400" />
    </svg>
  );
}

export function BitcoinBadge() {
  return (
    <svg viewBox="0 0 40 40" className="h-9 w-9 shrink-0" role="img" aria-label="Bitcoin (BTC)">
      <circle cx="20" cy="20" r="19" fill="#F7931A" />
      <text x="20" y="27.5" textAnchor="middle" fontFamily="Georgia, 'Times New Roman', serif" fontWeight="700" fontSize="21" fill="#150a04">
        ₿
      </text>
    </svg>
  );
}

export function EthereumBadge() {
  return (
    <svg viewBox="0 0 40 40" className="h-9 w-9 shrink-0" role="img" aria-label="Ethereum (ETH)">
      <circle cx="20" cy="20" r="19" fill="#141110" stroke="#F4670F" strokeOpacity="0.4" strokeWidth="1.4" />
      <path d="M20 6 L20 23 L29.5 18 Z" fill="#EDEDED" />
      <path d="M20 6 L10.5 18 L20 23 Z" fill="#A9A9A9" />
      <path d="M20 25 L20 34 L29.5 20 Z" fill="#EDEDED" />
      <path d="M20 25 L10.5 20 L20 34 Z" fill="#A9A9A9" />
    </svg>
  );
}

export const PAYMENT_PROVIDER_BADGES: Record<string, () => ReactNode> = {
  interac: InteracMark,
  card: CardBadge,
  bitcoin: BitcoinBadge,
  ethereum: EthereumBadge,
  shakepay: ShakepayMark,
};
