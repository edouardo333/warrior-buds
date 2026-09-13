import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductDetailView from "@/components/shop/ProductDetailView";
import { STOREFRONT_PRODUCTS } from "@/data/shop/products";

// Catalog is a static local array (data/shop/products.ts) with every slug
// known at build time, so all product pages can be prerendered — see the H2
// SEO report for why this is safe here (and wouldn't be for a
// database-backed catalog).
export function generateStaticParams() {
  return STOREFRONT_PRODUCTS.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = STOREFRONT_PRODUCTS.find((p) => p.slug === slug);
  if (!product) return {};
  const title = `${product.name} | Warrior Buds`;
  const description = product.shortDescription;
  const url = `/products/${product.slug}`;
  const image = product.images[0];
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      title,
      description,
      url,
      images: image ? [{ url: image.url, alt: image.alt }] : undefined,
    },
    twitter: image
      ? { card: "summary_large_image", title, description, images: [image.url] }
      : { card: "summary", title, description },
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
