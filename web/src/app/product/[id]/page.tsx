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
import { getProductById, getRelatedProducts } from "@/lib/products";
import { getProductsFromFirestore } from "@/lib/getProducts";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Try Firestore first, fall back to hardcoded data.
  const allProducts = await getProductsFromFirestore();
  let product = allProducts.find((p) => p.id === id) ?? getProductById(id);
  if (!product) notFound();

  const related = allProducts
    .filter((p) => p.id !== id && p.category === product!.category)
    .slice(0, 6);

  const gallery =
    product.gallery && product.gallery.length > 0
      ? product.gallery
      : [product.image];

  return (
    <>
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
          <ProductInfo product={product} />
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
