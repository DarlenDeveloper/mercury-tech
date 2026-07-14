import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import Sidebar from "@/components/Sidebar";
import { CATEGORIES } from "@/lib/categories";
import { getProductsFromFirestore } from "@/lib/getProducts";

export default async function SubCategoryPage({
  params,
}: {
  params: Promise<{ slug: string; sub: string }>;
}) {
  const { slug, sub } = await params;
  const category = CATEGORIES.find((c) => c.slug === slug);
  if (!category) notFound();

  const subCategory = category.children.find((c) => c.slug === sub);
  if (!subCategory) notFound();

  const allProducts = await getProductsFromFirestore();
  // Filter by subcategory: match category name to sub slug
  const products = allProducts.filter((p) => {
    const prodCatSlug = p.category
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    return prodCatSlug === sub;
  });

  return (
    <>
      <AnnouncementBar />
      <Header />

      <main className="flex-1">
        <section className="px-4 py-6 lg:px-6 lg:py-8">
          <div className="flex gap-8">
            <Sidebar />
            <div className="min-w-0 flex-1">
              {/* Breadcrumb */}
              <nav className="mb-4 flex items-center gap-1.5 text-sm text-muted">
                <Link href="/" className="transition hover:text-mercury">
                  Home
                </Link>
                <ChevronRight size={14} />
                <Link
                  href={`/category/${slug}`}
                  className="transition hover:text-mercury"
                >
                  {category.name}
                </Link>
                <ChevronRight size={14} />
                <span className="font-medium text-ink">
                  {subCategory.name}
                </span>
              </nav>

              <h1 className="mb-6 text-2xl font-bold text-ink">
                {subCategory.name}
              </h1>

              {products.length === 0 ? (
                <p className="text-muted">
                  No products found in this subcategory yet.
                </p>
              ) : (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(172px,1fr))] gap-3">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
