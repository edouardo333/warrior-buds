import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next.js's dev-mode route indicator defaults to bottom-left — a small
  // floating circular control that, on mobile checkout/cart/order pages,
  // sits over totals, CTAs, and form fields at the bottom of the screen.
  // Moving it to top-left keeps it clear of that content without touching
  // Bud Guardian's own bottom-right placement.
  devIndicators: {
    position: "top-left",
  },
};

export default nextConfig;
