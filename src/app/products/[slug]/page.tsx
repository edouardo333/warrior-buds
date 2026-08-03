import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductDetailView from "@/components/shop/ProductDetailView";
import { STOREFRONT_PRODUCTS } from "@/data/shop/products";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = STOREFRONT_PRODUCTS.find((p) => p.slug === slug);
  if (!product) return {};
  return {
    title: `${product.name} | Warrior Buds`,
    description: product.shortDescription,
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const exists = STOREFRONT_PRODUCTS.some((p) => p.slug === slug);
  if (!exists) notFound();

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <ProductDetailView slug={slug} />
      </main>
      <Footer hideCta />
    </>
  );
}
