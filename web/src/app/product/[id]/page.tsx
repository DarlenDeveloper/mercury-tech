import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductGallery from "@/components/product/ProductGallery";
import ProductInfo from "@/components/product/ProductInfo";
import ProductTabs from "@/components/product/ProductTabs";
import RelatedProducts from "@/components/product/RelatedProducts";
import { getProductById } from "@/lib/products";
import { getProductFromFirestore, getProductsFromFirestore } from "@/lib/getProducts";
import { getReviews, summarize } from "@/lib/reviews";

export const revalidate = 300;

const SITE_NAME = "Computer Shop, Kampala Uganda";
const SITE_URL = "https://mercurycomputerslimited.com";

// ─── Dynamic SEO metadata (mirrors the old site's title pattern) ──────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = (await getProductFromFirestore(id)) ?? getProductById(id);

  if (!product) {
    return { title: `Product — ${SITE_NAME}` };
  }

  const title = `${product.name} – ${SITE_NAME}`;
  const description =
    (product.overview || product.description || product.name)
      .replace(/\s+/g, " ")
      .slice(0, 155);
  const image = product.image?.startsWith("http") ? product.image : undefined;

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/product/${id}` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/product/${id}`,
      type: "website",
      siteName: SITE_NAME,
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Fetch the single product directly (one doc read), fall back to hardcoded.
  const product = (await getProductFromFirestore(id)) ?? getProductById(id);
  if (!product) notFound();

  // Related products (from the full cached list, filtered by category).
  const allProducts = await getProductsFromFirestore();
  const related = allProducts
    .filter((p) => p.id !== id && p.category === product!.category)
    .slice(0, 6);

  // Live review summary (falls back to catalog rating when there are none
  // or when reviews can't be loaded, e.g. before rules are deployed).
  const reviewSummary = summarize(
    await getReviews(id).catch(() => [])
  );

  const gallery =
    product.gallery && product.gallery.length > 0
      ? product.gallery
      : [product.image];

  // Product structured data (JSON-LD) for rich search results.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: (product.overview || product.description || "").slice(0, 300),
    image: gallery.filter((g) => g?.startsWith("http")),
    brand: product.brand ? { "@type": "Brand", name: product.brand } : undefined,
    category: product.category,
    offers: {
      "@type": "Offer",
      priceCurrency: "UGX",
      price: product.price,
      availability:
        (product.stock ?? 0) > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      url: `${SITE_URL}/product/${id}`,
      seller: { "@type": "Organization", name: "Mercury Computers Limited" },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AnnouncementBar />
      <Header />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 lg:px-6 lg:py-8">
        {/* Breadcrumb */}
        <nav className="flex flex-wrap items-center gap-1.5 text-sm text-muted">
          <Link href="/" className="transition hover:text-mercury">
            Home
          </Link>
          <ChevronRight size={14} />
          <Link href="/" className="transition hover:text-mercury">
            Shop
          </Link>
          <ChevronRight size={14} />
          <span>{product.category}</span>
          <ChevronRight size={14} />
          <span className="font-medium text-ink">{product.name}</span>
        </nav>

        {/* Gallery + info */}
        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,420px)_1fr] lg:gap-12">
          <ProductGallery images={gallery} alt={product.name} />
          <ProductInfo
            product={product}
            reviewAverage={reviewSummary.average}
            reviewCount={reviewSummary.count}
          />
        </div>

        {/* Tabs */}
        <ProductTabs product={product} />

        {/* Related */}
        <RelatedProducts products={related} />
      </main>

      <Footer />
    </>
  );
}
