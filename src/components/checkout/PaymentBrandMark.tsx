// Storefront — real Interac/Shakepay brand marks for the checkout
// payment-method UI. Reuses the exact same official asset files as the site
// footer (components/Footer.tsx PAYMENT_METHODS: "/images/logo/interac-
// email-transfer-logo.webp" and "/images/logo/logo-shakepay-transparent.webp")
// — no new/duplicate asset, no recreation. Uses the same overflow-hidden
// crop technique Footer.tsx documents (oversized centered image inside a
// clipping box, so each file's transparent canvas padding is cropped away
// without ever stretching or distorting the source art), just resized down
// to fit a compact badge in the checkout payment-method row instead of
// Footer's larger badge row. The size/translate values below are Footer's
// own desktop (sm:) values uniformly scaled to a ~36px badge height, so the
// crop window on each file stays proportionally the same as Footer's
// already-measured one.

import Image from "next/image";

export function InteracMark({ className = "" }: { className?: string } = {}) {
  return (
    <span className={`relative inline-block h-9 w-[26px] shrink-0 overflow-hidden ${className}`}>
      <Image
        src="/images/logo/interac-email-transfer-logo.webp"
        alt="Interac e-Transfer"
        width={300}
        height={376}
        className="absolute left-1/2 top-1/2 h-10 w-8 -translate-x-1/2 -translate-y-1/2 object-contain"
      />
    </span>
  );
}

export function ShakepayMark({ className = "" }: { className?: string } = {}) {
  return (
    <span className={`relative inline-block h-9 w-[45px] shrink-0 overflow-hidden ${className}`}>
      <Image
        src="/images/logo/logo-shakepay-transparent.webp"
        alt="Shakepay"
        width={1536}
        height={1024}
        className="absolute left-1/2 top-1/2 h-[53px] w-[79px] translate-x-[calc(-50%_+_1px)] translate-y-[calc(-50%_+_3px)] object-contain"
      />
    </span>
  );
}
