"use client";

import ProductDetail from "./ProductDetail";
import { useProduct } from "@/lib/shop/product-actions";

export default function ProductDetailView({ slug }: { slug: string }) {
  const product = useProduct(slug);
  if (!product) return null;
  return <ProductDetail product={product} />;
}
